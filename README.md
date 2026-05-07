# Tenant Hub

A full-stack PG (Paying Guest) Management System called Tenant Hub built to manage properties, rooms, tenants, maintenance requests, and payments through a centralized dashboard.

This project is being developed with a scalable architecture using:

* Frontend: React
* Backend: Django + Django REST Framework
* Database: SQLite (development)
* Authentication: Role-based access system

---

# Features

## Authentication & User Roles

* Login system
* Role-based access control
* Global roles:

  * Owner
  * Manager
  * Tenant
* Protected APIs using permissions

---

## Property Management

* Create and manage PG properties
* Store property details
* Assign managers to properties
* View property-wise data

---

## Room Management

* Add rooms
* Manage room types
* Room occupancy tracking
* Room availability status

---

## Tenant Management

* Add tenants
* Assign tenants to rooms
* Maintain tenant records
* Track tenant status

---

## Maintenance Management

* Raise maintenance requests
* Track request status
* Update maintenance progress

---

## Payment Management

* Record tenant payments
* Track payment history
* Payment status management

---

# Tech Stack

## Frontend

* React
* React Router
* Axios
* CSS

## Backend

* Django
* Django REST Framework
* SQLite

---

# Project Structure

```bash
project-root/
│
├── backend/
│   ├── management/
│   ├── accounts/
│   ├── backend/
│   ├── manage.py
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── node_modules/
│
└── README.md
```

---

# Backend Setup

## 1. Clone Repository

```bash
git clone <your-repository-url>
cd <repository-folder>
```

---

## 2. Create Virtual Environment

### Windows

```bash
python -m venv venv
venv\Scripts\activate
```

### Mac/Linux

```bash
python3 -m venv venv
source venv/bin/activate
```

---

## 3. Install Dependencies

```bash
pip install -r requirements.txt
```

---

## 4. Run Migrations

```bash
python manage.py makemigrations
python manage.py migrate
```

---

## 5. Start Backend Server

```bash
python manage.py runserver
```

Backend will run on:

```bash
http://127.0.0.1:8000/
```

---

# Frontend Setup

## 1. Move to Frontend Folder

```bash
cd frontend
```

---

## 2. Install Dependencies

```bash
npm install
```

---

## 3. Start Frontend

```bash
npm start
```

Frontend will run on:

```bash
http://localhost:3000/
```

---

# API Development

The backend is developed using Django REST Framework.

Key API modules include:

* Authentication APIs
* Property APIs
* Room APIs
* Tenant APIs
* Maintenance APIs
* Payment APIs

---

# Current Development Focus

* Scalable authentication architecture
* Permission handling
* Frontend validation
* Error handling
* Modular backend structure
* Automation-ready testing workflow

---

# Git Workflow

Recommended workflow:

```bash
# Create branch
git checkout -b feature-name

# Commit changes
git add .
git commit -m "Your message"

# Push branch
git push origin feature-name
```

After review:

```bash
git checkout main
git pull origin main
```

---

# Future Enhancements

* JWT Authentication
* Notifications system
* Analytics dashboard
* Rent reminders
* Advanced reporting
* File uploads
* Automation testing integration
* Deployment setup

---

# Learning Goals Behind Project

This project is also being used to improve practical knowledge of:

* Full-stack development
* Django architecture
* REST APIs
* Authentication systems
* Role-based authorization
* React state management
* QA and testing workflows
* Scalable project structure

---

# Author

Aayush Khanna

Software Quality Analyst

---

# License

This project is for learning and development purposes.
