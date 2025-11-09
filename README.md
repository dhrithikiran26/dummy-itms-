# College Sports Court Booking System

A full-stack web application for managing college sports court reservations. Built with React (Vite) on the frontend and Node.js/Express with MySQL on the backend.

## Features

### Student
- Landing page entry with student/admin selector
- Secure registration and login (JWT + bcrypt)
- Browse active courts by sport
- Book slots, mark payments, confirm bookings, cancel reservations
- View personal booking history with filters

### Admin
- Admin authentication using staff accounts
- Dashboard metrics (active courts/students, booking stats, revenue)
- Manage courts, bookings, sports, and staff via dedicated pages
- CRUD operations on sports and staff members
- Slot management via API (existing endpoints)

### Database Automations
- **Stored Function**: `fn_slot_duration_hours`
- **Stored Procedures**:
  - `sp_create_booking`
  - `sp_cancel_booking`
  - `sp_record_payment`
  - `sp_confirm_booking`
- **Triggers**:
  - `trg_payment_after_insert`
  - `trg_booking_complete_usage`

## Tech Stack
- **Frontend**: React 18, React Router, Axios, Vite
- **Backend**: Node.js, Express.js, MySQL2, JWT, bcrypt
- **Database**: MySQL with stored routines, triggers, functions

## Project Structure
```
new/
├── backend/
│   ├── server.js
│   ├── package.json
│   └── src/
│       ├── middleware/auth.js
│       └── routes/
│           ├── admin.routes.js
│           ├── auth.routes.js
│           ├── booking.routes.js
│           └── court.routes.js
├── frontend/
│   ├── index.html
│   ├── package.json
│   └── src/
│       ├── App.jsx
│       ├── components/
│       │   ├── Landing.jsx
│       │   ├── Login.jsx
│       │   ├── Register.jsx
│       │   ├── Dashboard.jsx
│       │   ├── CourtBooking.jsx
│       │   ├── MyBookings.jsx
│       │   └── admin/
│       │       ├── AdminDashboard.jsx
│       │       ├── CourtManagement.jsx
│       │       ├── BookingsManagement.jsx
│       │       ├── SportManagement.jsx
│       │       └── StaffManagement.jsx
│       ├── contexts/
│       │   ├── AuthContext.jsx
│       │   └── AdminContext.jsx
│       └── services/api.js
├── database/
│   ├── schema.sql
│   └── sample_data.sql
├── SETUP.md
└── package.json
```

## Setup

### Prerequisites
- Node.js 16+
- MySQL 8+
- npm or yarn

### 1. Database
```sql
CREATE DATABASE sports_court_booking;
```
Import schema (creates tables, indexes, stored routines):
```powershell
Get-Content database/schema.sql | mysql -u root -p
```
Load sample data (safe to re-run due to INSERT IGNORE):
```powershell
Get-Content database/sample_data.sql | mysql -u root -p
```

### 2. Backend
```powershell
cd backend
npm install
npm run dev
```
Backend will run on `http://localhost:5000`.

### 3. Frontend
```powershell
cd frontend
npm install
npm run dev
```
Frontend will run on `http://localhost:5173` with API proxy to backend.

## API Overview

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/admin/login`
- `GET /api/auth/verify`

### Student Bookings
- `POST /api/bookings` *(sp_create_booking)*
- `GET /api/bookings`
- `GET /api/bookings/:id`
- `PUT /api/bookings/:id/cancel` *(sp_cancel_booking)*
- `PUT /api/bookings/:id/pay` *(sp_record_payment)*
- `PUT /api/bookings/:id/confirm` *(sp_confirm_booking)*

### Courts & Slots
- `GET /api/courts`
- `GET /api/courts/:id`
- `GET /api/courts/:id/slots`

### Admin
- `GET /api/admin/dashboard`
- `GET /api/admin/bookings`
- `GET/POST/PUT/DELETE /api/admin/courts`
- `GET/POST/PUT/DELETE /api/admin/sports`
- `GET/POST/PUT/DELETE /api/admin/staff`

## Sample Admin Login
Import `sample_data.sql` and use any staff email, e.g. `john.manager@college.edu`. Password currently unchecked; enter any value.

## Troubleshooting
- When rerunning schema, ensure stored routines are enabled and indexes are dropped (already handled in `schema.sql`).
- Payment confirmation flow: mark booking as paid before confirming.
- Disable interfering browser extensions if you see “message channel closed” warnings—they stem from extensions handling intercepted requests.

## License
Academic use for DBMS mini project.
