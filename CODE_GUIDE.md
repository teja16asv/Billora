# 🧠 SaaSBilling Developer & Code Guide

Welcome to the internal code guide! This document is designed to help you (or any new developer) understand exactly how the SaaSBilling system is wired together under the hood. 

This guide breaks down the most critical parts of the codebase, module by module.

---

## 1. The Database Architecture (`backend/app/models.py`)
The entire application revolves around **Multi-Tenancy** (one database, many companies).
Every major table contains a `tenant_id` foreign key. This is the absolute golden rule of this codebase.

* **`Tenant`**: Represents a Company (e.g., "Acme Corp"). Holds their `logo_url` and `brand_color`.
* **`User`**: The people who log in. An Admin User belongs to a `Tenant`.
* **`Customer`**: The people your Tenant is selling to. Customers belong to a `Tenant`.
* **`UsageRecord`**: Stores the raw CSV data uploaded by the Admin. Belongs to a `Customer` and a `Tenant`.
* **`Invoice`**: The final compiled bill. Links the `UsageRecords` together and charges the `Customer`.

---

## 2. Authentication & Tenant Isolation (`backend/app/middleware/auth.py`)
This is the security vault of the application. 
Whenever an Admin logs in, the backend generates a **JWT (JSON Web Token)** that contains their `tenant_id` inside the encrypted payload.

**How it works in practice:**
If you look at `auth.py`, you will see the `@require_auth` Python decorator.
When a route has this decorator, the middleware intercepts the incoming HTTP request, cracks open the JWT, and extracts the `tenant_id`. It assigns this ID to a global Flask variable called `g.tenant_id`.

**Why is this brilliant?**
Because in every single route (like fetching invoices or customers), the developer simply writes:
`Invoice.query.filter_by(tenant_id=g.tenant_id)`
This mathematically guarantees that an Admin can **never** accidentally see another company's data.

---

## 3. The Core API Routes (`backend/app/routes/`)
Here is where the business happens. Each file handles a specific domain:

### `auth_routes.py`
* **POST `/register`**: Creates a brand new `Tenant` row, then creates an Admin `User` attached to that specific Tenant.
* **POST `/login`**: Verifies the password, generates the JWT containing the `tenant_id`, and sends it back to the React frontend.

### `customer_routes.py`
Handles CRUD (Create, Read, Update, Delete) for the Tenant's customers. Every query strictly uses `.filter_by(tenant_id=g.tenant_id)`.

### `invoice_routes.py`
The most complex and important file in the application.
* **POST `/usage/upload`**: Parses the uploaded CSV file using `pandas`. It loops through the rows, extracts the `customer_id`, and saves raw `UsageRecord` rows into MySQL.
* **POST `/invoices` (Generate Button)**:
  1. Sweeps the database for `UsageRecords` that don't have an `invoice_id` yet.
  2. Groups them by `customer_id`.
  3. Calculates the total monetary amount.
  4. Creates the `Invoice` row.
  5. Triggers `PDFService` to physically draw the PDF document.
  6. Triggers `NotificationService` to fire the SendGrid email with the Magic Link.

### `public_routes.py`
These routes do **not** have the `@require_auth` decorator! They are completely open to the internet.
* **GET `/public/invoices/<id>`**: Searches for an invoice merely by its UUID. Returns limited data (Company Name, Colors, Total Amount) because the customer isn't logged in.
* **POST `/public/payments/create-order`**: Talks to the Razorpay API to generate a secure transaction ticket so the frontend can display the payment modal.

---

## 4. Services (The Heavy Lifters)

### `pdf_service.py` (`backend/app/services/pdf_service.py`)
Uses the `ReportLab` library to programmatically draw PDFs. It acts like a digital paintbrush.
1. It grabs the `brand_color` from the Tenant database and switches the brush color (`c.setFillColor`).
2. It fetches the `logo_url` and paints the image onto the XY coordinates of the canvas.
3. It loops through the customer's `UsageRecords` and writes the line-items down the page.

### `notification_service.py` (`backend/app/services/notification_service.py`)
Uses the Twilio SendGrid SDK. It accepts the `Customer` email, writes a custom message containing the `PublicPayment` Magic Link, and shoots off the HTTP request to SendGrid to deliver the email.

---

## 5. The Frontend React Architecture (`frontend/src/`)

### `App.jsx` (The Router)
The central traffic cop. Notice the `<ProtectedRoute>` wrappers around the Admin dashboards. If a user tries to type `/admin/dashboard` into their URL bar without a valid JWT token, `ProtectedRoute` will aggressively kick them back to `/login`.
The `/pay/:id` route is specifically left **outside** the protector, so anyone with the Magic Link can access it.

### `api.js` (`frontend/src/services/api.js`)
The "Interceptors." Before React sends *any* `axios` request to the Python backend, this file automatically grabs the JWT token from `localStorage` and silently attaches it to the HTTP Headers (`Authorization: Bearer <token>`). This is why you don't have to manually pass the token in every single API call you write!

### `PublicPayment.jsx` (`frontend/src/pages/public/PublicPayment.jsx`)
The unauthenticated checkout page.
1. Checks the `:id` parameter in the URL.
2. Calls the backend `/public/invoices/<id>` API.
3. Dynamically injects the `brand_color` into the CSS `style={}` tags of the React HTML.
4. When "Pay Securely" is clicked, it asks the backend for a Razorpay Order ID, then pops open the Razorpay JS SDK modal directly over the screen.

---

## 🎯 Summary for Interviews
If an interviewer asks you about this architecture, hit these three key points:
1. **Security**: "I built a strict multi-tenant architecture utilizing JWT Claims. The database enforces Tenant-level isolation at the middleware layer."
2. **Scalability**: "Billing calculations are decoupled from the API layer using background workers (APScheduler), preventing the web server from blocking during massive CSV processing."
3. **User Experience**: "I designed a frictionless public checkout flow utilizing unguessable UUID Magic Links, drastically increasing conversion rates by removing the friction of password creation for end-users."
