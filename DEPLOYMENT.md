# DEPLOYMENT GUIDE 🚀

This guide provides step-by-step instructions to get the **Secure Multi-Tenant Invoice Management System** running in production or locally.

---

## 1. Environment Configurations
Rename `backend/.env.example` to `backend/.env` and update the keys:

```ini
# Flask Setup
FLASK_ENV=production
FLASK_APP=run.py

# Cryptography - Generate safe random hashes for these!
SECRET_KEY=generate_me_with_python_secrets
JWT_SECRET_KEY=generate_me_with_python_secrets

# Third-Party API Keys
RAZORPAY_KEY_ID=rzp_test_xxxxxx
RAZORPAY_KEY_SECRET=yyyyyy_xxxxxx
SENDGRID_API_KEY=SG.xxxxxx_yyyyyy
```

---

## 2. Docker Deployment (Recommended)
This repository includes a full microservices orchestration using Docker Compose.

1. Ensure **Docker Desktop** is installed and running.
2. In the root of the project, run:
   ```bash
   docker-compose up --build -d
   ```
3. The system will start three containers:
   * **`saas_mysql`**: Port `3306`
   * **`saas_backend`**: Port `5000` (Flask via Gunicorn)
   * **`saas_frontend`**: Port `80` (React via Nginx)
4. Access the web app by visiting `http://localhost`.

---

## 3. Local Development (Without Docker)

### Backend
1. cd `backend`
2. Activate a python virtual environment.
3. `pip install -r requirements.txt`
4. Make sure a local MYSQL server is running mapped to the `DATABASE_URL` in your `.env`.
5. `python run.py` (Local DB tables will automatically initialize).

### Frontend
1. cd `frontend`
2. `npm install`
3. `npm run dev`
4. The local dev server runs on `http://localhost:5173`.

---

## 4. Third-Party Integrations

### Razorpay Checkout Integration
1. Go to [Razorpay Dashboard](https://dashboard.razorpay.com).
2. Generate Test API Keys from `Settings > API Keys`.
3. Add `Key Id` and `Key Secret` to `.env`.
4. (Optional) Run `ngrok http 5000` and map it to Razorpay's webhook settings pointing to `/api/v1/payments/verify`.

### SendGrid Setup
1. Create a free account at [Twilio SendGrid](https://sendgrid.com/).
2. Setup and verify a single sender identity.
3. Generate an API Key under `Settings > API Keys`.
4. Add it to `SENDGRID_API_KEY` in `.env`.
