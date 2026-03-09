# SaaSBilling: Secure Multi-Tenant Invoice Management System

![Dashboard Preview](https://via.placeholder.com/800x400.png?text=SaaSBilling+Dashboard+Preview)

## 📌 Project Objective
SaaSBilling is a full-fledged, production-ready **B2B Software-as-a-Service (SaaS)** platform designed to handle complex billing operations for multiple companies (tenants) simultaneously. 

It solves the real-world problem of usage-based billing by allowing businesses to securely isolate their data, upload bulk customer usage metrics via CSV, automatically generate calculation-based PDF invoices, and securely dispatch them to customers via email for instant payment.

This project was built to demonstrate expertise in **Multi-Tenant Architecture, Role-Based Access Control (RBAC), Background Job Processing,** and **Third-Party API Integrations (Payment Gateways & Email Services)**.

---

## ✨ Core Features

### 🏢 1. True Multi-Tenant Architecture
- **Data Isolation:** A single monolithic database where every row is strictly tied to a `tenant_id`.
- **JWT Middleware Validation:** Every API request is intercepted, and the tenant context is dynamically injected to guarantee that Company A can never access Company B's customers, invoices, or revenue data.
- **Dynamic Registration:** New companies can register on the platform and are instantly cleanly partitioned into their own workspace.

### 🎨 2. advanced "Invoice Cloud" White-Labeling
- **Brand Customization:** Administrators can upload their Company Logo and set a Primary Brand Hex Color.
- **Dynamic PDF Generation:** The backend `ReportLab` engine dynamically reads the tenant's settings and injects their logo and brand colors directly into the generated PDF invoices.
- **Hosted Checkout Page:** The public, unauthenticated React checkout page dynamically alters its UI theme to match the billing company's brand, providing a highly professional customer experience.

### ⚙️ 3. Metering & Usage-Based Billing
- **Bulk CSV Ingestion:** Admins can drag-and-drop massive `.csv` files containing raw customer usage data (e.g., "API Calls", "Storage GB").
- **Invoice Compilation Engine:** A backend process aggregates all unbilled usage metrics for a specific customer, calculates the totals, and compiles them into a finalized `Invoice` record.

### 💸 4. Public Customer Checkout Flow
- **Magic Links:** Customers do not need to create accounts or remember passwords. When an invoice is generated, they receive a secure, unguessable UUID "Magic Link".
- **Razorpay Integration:** Visiting the link opens a public React page (`/pay/<id>`) that fetches the isolated invoice data and initializes the **Razorpay SDK** for immediate, secure payment processing.

### 📧 5. Automated Email Dispatch
- **SendGrid API Client:** Fully integrated with Twilio SendGrid to ensure reliable delivery of invoice notifications straight to the customer's inbox.
- **Webhook Capabilities:** (Architecture prepared) for async status updates when emails bounce or are delivered.

---

## 🛠️ Tech Stack

**Frontend Framework:**
- **React.js (Vite)**
- **Tailwind CSS** (for responsive, modern, glassmorphism UI)
- **Lucide React** (Iconography)
- **Axios** (API communication & JWT Interceptors)
- **React Router** (Protected & Public boundaries)

**Backend Architecture:**
- **Python (Flask)**
- **SQLAlchemy ORM** (Database interaction & schema management)
- **Flask-JWT-Extended** (Stateless authentication & RBAC)
- **Flask-Limiter** (Rate-limiting for security)
- **ReportLab** (Programmatic PDF generation)
- **Pandas** (High-speed CSV parsing)

**Database & Infrastructure:**
- **MySQL** (Relational data storage)
- **Docker & Docker Compose** (Containerized microservices orchestration)
- **Nginx** (Frontend reverse proxy, configured in Docker)

**Third-Party APIs:**
- **Razorpay (Payment Gateway)**
- **Twilio SendGrid (Email Delivery)**

---

## 🚀 Setup & Installation

You can run this system either via Docker (Recommended for production) or locally for development.

### Option 1: Docker Orchestration (Recommended)
1. Ensure Docker Desktop is running.
2. Rename `backend/.env.example` to `backend/.env` and insert your API keys.
3. Run the complete microservices cluster:
```bash
docker-compose up --build -d
```
4. Access the web app at `http://localhost`.

### Option 2: Local Development Environment

**1. Database Configuration**
Ensure you have a local MySQL server running.
Create a database named `saas_fintech`.

**2. Backend Setup**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows use: venv\Scripts\activate
pip install -r requirements.txt
```
Create a `.env` file in the `backend/` directory:
```ini
DATABASE_URL=mysql+pymysql://user:password@localhost/saas_fintech
SECRET_KEY=your_secure_hash
JWT_SECRET_KEY=your_jwt_secure_hash
RAZORPAY_KEY_ID=your_razorpay_test_key
RAZORPAY_KEY_SECRET=your_razorpay_test_secret
SENDGRID_API_KEY=your_sendgrid_key
SENDGRID_FROM_EMAIL=your_verified_sender_email
```
Run the server (Tables will auto-migrate on first boot):
```bash
python run.py
```

**3. Frontend Setup**
```bash
cd frontend
npm install
npm run dev
```
The application will be available at `http://localhost:5173`.

---

## 🛡️ Security Posture
- **Passwords:** Hashed via `werkzeug.security` (bcrypt).
- **Sessions:** Stateless JSON Web Tokens (JWT) with strict expiration policies.
- **API Protection:** Endpoints guarded by strict `@require_role` decorators and tenant-level database filters preventing Cross-Tenant Data Leakage.
- **Rate Limiting:** Flask-Limiter inherently protects authentication routes from brute-force attacks.

---
*Built as a comprehensive demonstration of enterprise-grade SaaS architecture capabilities.*
