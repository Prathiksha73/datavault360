#  DataVault360

### A Role-Based Healthcare Data Management Platform

---

##  Project Overview

**DataVault360** is a full-stack healthcare data management system designed to securely manage hospital data such as patients, doctors, visits, and laboratory records. The platform follows a **role-based access control (RBAC)** model to ensure privacy, security, and controlled access to sensitive healthcare information.

The system combines a **Django Admin–driven backend**, **RESTful APIs**, a **React-based frontend**, and **FHIR standards** to deliver a scalable and interoperable healthcare solution suitable for real-world hospital and medical institution environments.

---

## 🎯 Key Features

* Role-based access control (RBAC)
* Secure authentication using JWT
* Centralized hospital data management
* Django Admin Portal for internal operations
* Modern React frontend for controlled user access
* FHIR standards for healthcare data interoperability
* REST API–based architecture
* Scalable and production-ready design

---

## 👥 User Roles & Permissions

| Role                      | Description                                                     |
| ------------------------- | --------------------------------------------------------------- |
| **Organization (Admin)**  | Manages doctors, patients, labs, visits, and system permissions |
| **Doctor (Practitioner)** | Views assigned patients, records visits, requests lab tests     |
| **Lab User**              | Updates lab test status and results                             |
| **Patient**               | Read-only access to personal medical records                    |

---

## 🏗️ System Architecture

```
React Frontend
     ↓
Django REST API
     ↓
Django Admin Portal
     ↓
Relational Database
```

* **Frontend** handles user interaction
* **Backend** manages business logic and security
* **Admin Portal** serves as the internal management interface

---

## 🧰 Technology Stack

### Backend

* Django
* Django REST Framework (DRF)
* JWT Authentication (SimpleJWT)

### Frontend

* React (Vite)
* JavaScript
* Tailwind CSS

### Database

* SQLite (Development)

### Standards

* FHIR (Fast Healthcare Interoperability Resources)

### Tools

* Git & GitHub
* Postman
* Visual Studio Code (VS Code)

---

## 🔐 Security Implementation

* Token-based authentication using JWT
* Role-based permission enforcement
* Secure API endpoints
* Admin-only access for critical operations
* Controlled data visibility per role

---

## 📂 Project Structure

```
datavault360/
│
├── backend/
│   ├── models.py
│   ├── serializers.py
│   ├── views.py
│   ├── urls.py
│   └── admin.py
│
├── frontend/
│   ├── components/
│   ├── api.js
│   ├── App.jsx
│   └── main.jsx
│
├── README.md
└── requirements.txt
```

---

## ⚙️ Setup & Installation

### Backend Setup

```bash
git clone https://github.com/prathiksha73/datavault360.git
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

---

## 🔄 API Authentication

* Uses **JWT (JSON Web Tokens)** via SimpleJWT
* Access token required for all secured endpoints
* Tokens passed via Authorization header

```
Authorization: Bearer <access_token>
```

---

## 🌐 FHIR Standards Integration

The system integrates **FHIR (Fast Healthcare Interoperability Resources)** to standardize healthcare data representation.
This ensures:

* Interoperability with external healthcare systems
* Structured and consistent medical records
* Future integration with EHR and health platforms

---

## 🚀 Future Enhancements

* Appointment scheduling
* Billing and payment module
* Advanced analytics dashboard
* Notification system
* Cloud deployment (AWS/Azure)
* Mobile application support

---

## 📌 Conclusion

DataVault360 demonstrates modern full-stack development practices by integrating secure backend architecture, a responsive frontend, standardized healthcare data formats, and scalable system design. The platform is well-suited for hospitals, clinics, and healthcare institutions seeking a secure and efficient data management solution.

---

## 👩‍💻 Contributors

* Prathiksha
* Vidit
* Yasin
* Hardik

---

## 📄 License

This project is developed for academic and educational purposes.

---

