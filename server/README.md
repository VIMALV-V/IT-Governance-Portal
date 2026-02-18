# IT Governance Portal

A Full Stack Role-Based IT Governance Management System built using the MERN stack (MongoDB, Express.js, React.js, Node.js).

This application enables organizations to manage policies, track compliance, handle approval workflows, monitor risks, and maintain audit logs in a structured governance environment.

---

## Features

### Authentication & Authorization
- JWT-based secure authentication
- Role-Based Access Control (Admin, Manager, Employee)
- Protected routes (Frontend + Backend)
- Secure API access

### Policy Management
- Create, update, and manage governance policies
- Policy version tracking
- Policy acknowledgment system

### Request Workflow System
- Employees submit governance-related requests
- Managers/Admins approve or reject requests
- Status tracking (Pending, Approved, Rejected)

### Notifications System
- Real-time notifications on approvals
- Alerts on policy updates
- User-specific notification retrieval

### Risk Management
- Create and manage risk entries
- Severity levels (Low, Medium, High)
- Role-restricted risk creation

### Compliance Analytics Dashboard
- Total Policies
- Total Requests
- Pending Requests
- Compliance Percentage
- Bar & Pie Charts using Chart.js

### Audit Logging
- Tracks important system actions
- Helps maintain accountability

---

## Tech Stack

### Frontend
- React.js (Vite)
- Tailwind CSS
- React Router DOM
- React Icons
- Chart.js

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- bcrypt.js

### Development Tools
- VS Code
- Git & GitHub
- Postman / Thunder Client

---

## Project Structure

IT-Governance-Portal/
│
├── client/ # React Frontend
│ ├── src/
│ ├── public/
│
├── server/ # Express Backend
│ ├── controllers/
│ ├── models/
│ ├── routes/
│ ├── middleware/
│
└── README.md


---

## Application Flow

1. User Registers / Logs In
2. JWT Token Stored in Local Storage
3. Protected Routes Guarded via Middleware
4. Role-Based UI Restrictions Applied
5. Backend Enforces Role Authorization
6. Dashboard Displays Real-Time Governance Metrics

---

## Security Features

- Password Hashing using bcrypt
- JWT Token Validation
- Middleware-based route protection
- Role-level API access control
- Environment variables (.env protected)

---

##  Installation & Setup

### Clone the repository
```bash
    git clone https://github.com/VIMALV-V/IT-Governance-Portal.git

Backend Setup:
    cd server
    npm install
    npm run dev

Frontend Setup:
    cd client
    npm install
    npm run dev

Future Enhancements:
    Email notifications
    Real-time updates using WebSockets
    Advanced compliance analytics
    Deployment on Render/Vercel
    Role management panel

Academic Purpose :
    This project was developed as a Full Stack IT Governance System to demonstrate:
        Secure Authentication
        Role-Based Access Control
        Approval Workflows
        Risk Management
        Analytics Dashboard Implementation
        Clean UI Architecture

Developed By:
    Vimal V
    Full Stack Developer


---