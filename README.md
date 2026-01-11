
# DataVault360 – Role-Based Healthcare Data Management Platform

DataVault360 is a full-stack healthcare data management system designed for hospitals, clinics, and medical colleges. The platform provides a secure, centralized, web-based solution for managing healthcare data while ensuring privacy, role-based access control, and interoperability using FHIR R4 standards.

---

## 📌 Project Overview

DataVault360 streamlines hospital operations by securely managing **Patients, Doctors, Labs, Rooms, and Appointments**.  
The system follows modern software engineering practices with a scalable backend, a responsive frontend, and standardized healthcare data formats.

---

## ✨ Key Features

- Role-Based Access Control (RBAC) for Admins, Doctors, Patients, and Lab Users  
- Secure authentication using JWT (SimpleJWT)  
- FHIR R4 compliance for standardized healthcare data exchange  
- Dual-write architecture for relational and FHIR-compliant data storage  
- Email-based digital invitation and onboarding system  
- Room and bed occupancy management  
- Integrated lab request and reporting workflow  
- Analytics dashboard for operational insights  
- Dockerized setup for easy deployment  

---

## 👥 User Roles

| Role | Description |
|----|------------|
| **Superuser / Organization Admin** | Manages organizations, users, permissions, and system configuration |
| **Doctor (Practitioner)** | Views assigned patients, records visits, requests lab tests |
| **Lab User** | Updates lab test status and uploads reports |
| **Patient** | Read-only access to personal medical records |

---

## 🏗️ System Architecture

```

React Frontend
↓
Django REST API
↓
Django Admin Portal
↓
Relational Database (SQLite)
↓
FHIR JSON Store (MongoDB)

````

- **Frontend** handles user interaction  
- **Backend** manages business logic and security  
- **Django Admin** acts as the internal management interface  
- **FHIR layer** ensures healthcare data interoperability  

---

## 🧰 Technology Stack

### Frontend
- React (Vite)
- Tailwind CSS
- Framer Motion
- Recharts

### Backend
- Django
- Django REST Framework
- JWT Authentication (SimpleJWT)
- Python 3.12

### Databases
- SQLite (Primary relational database – development)
- MongoDB (FHIR R4 JSON document store)

### DevOps & Tools
- Docker
- Docker Compose
- Git & GitHub
- Postman
- Visual Studio Code (VS Code)

---

## ⚙️ Setup & Installation

### Prerequisites
- Docker
- Docker Compose

### Docker Setup (Recommended)

```bash
git clone https://github.com/Prathiksha73/datavault360.git
cd datavault360
docker-compose up --build -d
````

* Frontend: `http://localhost:5173`
* Backend API: `http://localhost:8000/api/`

---

### Manual Local Setup

#### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## 🔐 Authentication

* Token-based authentication using **JWT**
* All secured endpoints require a valid access token
* Role-based permissions enforced at API level

---

## 🔄 Backend API Overview

**Base URL:** `http://localhost:8000/api/`

### Authentication

* `POST /auth/login/`

### Invitations

* `POST /invitations/`
* `GET /invitations/check/{token}/`
* `POST /invitations/complete/`

### Patients

* `GET /patients/`
* `GET /patients/{id}/`
* `POST /patients/`
* `PATCH /patients/{id}/`

### Doctors

* `GET /doctors/`
* `GET /doctors/{id}/`

### Lab Tests

* `GET /lab-tests/`
* `POST /lab-tests/`
* `PATCH /lab-tests/{id}/`

### Rooms

* `GET /rooms/`
* `POST /rooms/{id}/assign_patient/`
* `POST /rooms/{id}/discharge_patient/`

### Analytics

* `GET /analytics/`

---

## 🗄️ Database Design

### Relational Models (SQLite)

* User (extends AbstractUser with roles)
* PatientProfile
* DoctorProfile
* Invitation
* Room and Bed entities

### FHIR Storage (MongoDB)

* Database: `fhir_db`
* Collection: `fhir_patient`
* Stores FHIR R4 Patient Resource JSON mapped from PatientProfile

---

## 🔒 Security Implementation

* JWT-based authentication
* Role-based access control
* Secure API endpoints
* Admin-only critical operations
* Controlled data visibility per user role

---

## 🚀 Future Enhancements

* Appointment scheduling module
* Billing and payment integration
* Advanced analytics dashboards
* Notification and alert system
* Cloud deployment (AWS / Azure)
* Mobile application support

---

## 📌 Conclusion

DataVault360 integrates Django, React, Docker, and FHIR R4 standards to provide a secure, scalable, and interoperable healthcare data management platform. The system demonstrates modern full-stack development practices and is suitable for real-world healthcare environments.

---

## 👩‍💻 Contributors

* Prathiksha
* Vidit
* Hardik
* Yasin

---

## 📄 License

This project is developed for academic and educational purposes.


