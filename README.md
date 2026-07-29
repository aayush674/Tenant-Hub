# Tenant Hub

A full-stack **PG (Paying Guest) and Tenant Management System** built to streamline property operations through a centralized dashboard. Tenant Hub enables property owners and managers to efficiently manage properties, rooms, tenants, rent dues, payments, maintenance requests, and user access with a scalable architecture.

---

# Tech Stack

## Frontend

- React
- React Router
- Axios
- CSS

## Backend

- Django
- Django REST Framework
- JWT Authentication (Simple JWT)

## Database

- PostgreSQL (Production)
- SQLite (Development)

## Deployment

- **Frontend:** Vercel
- **Backend:** Render

---

# Features

## Authentication & User Management

- JWT-based Authentication
- Secure Login System
- Email-based User Accounts
- Role-Based Access Control
- Protected API Endpoints
- Invitation-based Tenant Account Creation
- Email Verification & Account Activation
- Token-based Account Activation Links

### User Roles

- Owner
- Manager
- Tenant

---

## Property Management

- Create and manage multiple properties
- Store complete property information
- Assign managers to properties
- Property-wise statistics
- Property dashboard overview

---

## Room Management

- Add and update rooms
- Room Type management
- Room occupancy tracking
- Room availability status
- Capacity management
- Room-wise tenant listing

---

## Tenant Management

- Add tenants
- Assign tenants to rooms
- Automatic user account creation for tenants
- Tenant profile management
- Tenant status tracking
- Tenant dashboard

---

## Rent & Dues Management

- Generate rent dues
- Manual due creation
- Multiple due types:
  - Rent
  - Electricity
  - Maintenance
  - Other
- Due status tracking:
  - Pending
  - Partially Paid
  - Paid
- Automatic overdue detection
- Due history

---

## Payment Management

- Record tenant payments
- Partial payment support
- Automatic due updates after payment
- Payment history
- Payment status tracking

---

## Maintenance Management

- Raise maintenance requests
- Track maintenance status
- Update request progress
- Property-wise maintenance management

---

## Dashboard & UI

- Responsive interface
- Search functionality
- Filtering
- Pagination
- Loading states
- Snackbar notifications
- Protected routes
- Role-based navigation

---

# Security Features

- JWT Authentication
- Protected APIs
- Role-based permissions
- Property-level authorization
- Invitation token expiration
- Email verification before account activation

---

# Project Structure

```text
project-root/
│
├── backend/
│   ├── accounts/
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── permissions.py
│   │   └── urls.py
│   │
│   ├── management/
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── permissions.py
│   │   └── urls.py
│   │
│   ├── backend/
│   ├── manage.py
│   └── requirements.txt
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── layouts/
│   │   ├── services/
│   │   └── utils/
│   ├── package.json
│   └── .env
│
└── README.md
```

---

# Backend Setup

## 1. Clone Repository

```bash
git clone <repository-url>
cd <repository-folder>
```

## 2. Create Virtual Environment

### Windows

```bash
python -m venv venv
venv\Scripts\activate
```

### Linux / macOS

```bash
python3 -m venv venv
source venv/bin/activate
```

## 3. Install Dependencies

```bash
pip install -r requirements.txt
```

## 4. Configure Environment Variables

Create a `.env` file inside the **backend** folder.

Example:

```env
SECRET_KEY=your-secret-key
DEBUG=True

DATABASE_URL=sqlite:///db.sqlite3

EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password

FRONTEND_URL=http://localhost:3000
```

## 5. Run Migrations

```bash
python manage.py makemigrations
python manage.py migrate
```

## 6. Start Backend Server

```bash
python manage.py runserver
```

Backend will run at:

```
http://127.0.0.1:8000/
```

---

# Frontend Setup

```bash
cd frontend
npm install
npm start
```

Frontend will run at:

```
http://localhost:3000/
```

Example `.env.development`

```env
REACT_APP_API_BASE_URL=http://127.0.0.1:8000
```

Example `.env.production`

```env
REACT_APP_API_BASE_URL=https://your-backend-url.onrender.com
```

---

# REST APIs

The backend provides REST APIs for:

- Authentication
- Account Activation
- Properties
- Rooms
- Room Types
- Tenants
- Rent Dues
- Payments
- Maintenance Requests
- User Profile

---

# Current Development Status

## ✅ Completed

- JWT Authentication
- Role-Based Authorization
- Invitation-Based Tenant Accounts
- Email Verification
- Property Management
- Room Management
- Tenant Management
- Rent Due Management
- Payment Module
- Maintenance Module
- Responsive React UI
- Pagination
- Search & Filtering
- Protected Routes
- Backend Deployment (Render)
- Frontend Deployment (Vercel)

---

## 🚧 In Progress

- Analytics Dashboard
- Notifications
- Reports & Export
- Dashboard Metrics
- UI/UX Improvements
- Automated Testing

---

# Future Roadmap

- Email Notifications
- Rent Reminder Automation
- File Uploads
- Payment Receipt Generation
- Reports (PDF / Excel)
- Occupancy Analytics
- Revenue Dashboard
- Audit Logs
- Mobile Responsiveness Improvements
- Selenium & Playwright Automation Suite

---

# Learning Objectives

This project is built to strengthen practical experience in:

- Full-Stack Development
- React
- Django REST Framework
- REST API Design
- JWT Authentication
- Scalable Backend Architecture
- Role-Based Authorization
- PostgreSQL
- Deployment
- Software Testing
- Test Automation

---

# Author

**Aayush Khanna**

Software Quality Analyst

- GitHub: *Add your GitHub profile*
- LinkedIn: *Add your LinkedIn profile*

---

# License

This project is developed for learning, portfolio, and demonstration purposes.
