# Software Engineering Projects Repository

This repository contains two full-stack applications:

1. **IT Infrastructure Management System (IIMS)** - Python/Flask application
2. **College Sports Court Booking System** - Node.js/React application

---

## 📋 Project 1: IT Infrastructure Management System (IIMS)

A comprehensive full-stack application prototype for managing IT infrastructure assets, licenses, monitoring, and operations.

### Features
- **Asset Management**: Full CRUD operations with QR code generation
- **License Management**: Track software licenses with compliance status
- **Monitoring**: Hardware health, network usage, and backup status
- **Role-Based Access Control**: Admin, IT Staff, and Employee roles
- **Authentication**: Login with MFA support for Admin users
- **Analytics**: Asset distribution by department
- **Integration Status**: External service monitoring
- **Audit Logging**: Complete activity tracking
- **CI/CD Pipeline**: Automated testing, coverage, linting, security scanning

### Technology Stack
- **Backend**: Python 3.10+ with Flask
- **Frontend**: HTML5, Tailwind CSS, Vanilla JavaScript
- **Database**: In-memory data structures (prototype)
- **Containerization**: Docker
- **CI/CD**: GitHub Actions (5 stages: Build, Test, Coverage, Lint, Security)

### Quick Start (IIMS)

```bash
# Install dependencies
pip install -r requirements.txt

# Run the server
python server.py

# Access at http://localhost:5000
```

**Login Credentials:**
- Admin: `admin` / `admin123` (MFA: `123456`)
- IT Staff: `itstaff` / `it123`
- Employee: `employee` / `emp123`

### Testing (IIMS)

```bash
# Run all tests (37 tests, 95% coverage)
pytest tests/ -v --cov=server --cov-fail-under=75
```

### Project Structure (IIMS)
```
.
├── server.py              # Flask backend
├── index.html             # Frontend SPA
├── requirements.txt       # Python dependencies
├── Dockerfile             # Docker configuration
├── docker-compose.yml      # Docker Compose
├── pytest.ini            # Test configuration
├── tests/                 # Test suite (37 tests)
│   ├── test_server.py
│   ├── test_integration.py
│   └── test_server_extended.py
└── .github/workflows/
    └── ci-cd.yml          # CI/CD pipeline
```

---

## 📋 Project 2: College Sports Court Booking System

A full-stack web application for managing college sports court reservations. Built with React (Vite) on the frontend and Node.js/Express with MySQL on the backend.

### Features

#### Student
- Landing page entry with student/admin selector
- Secure registration and login (JWT + bcrypt)
- Browse active courts by sport
- Book slots, mark payments, confirm bookings, cancel reservations
- View personal booking history with filters

#### Admin
- Admin authentication using staff accounts
- Dashboard metrics (active courts/students, booking stats, revenue)
- Manage courts, bookings, sports, and staff via dedicated pages
- CRUD operations on sports and staff members
- Slot management via API (existing endpoints)

#### Database Automations
- **Stored Function**: `fn_slot_duration_hours`
- **Stored Procedures**:  
   * `sp_create_booking`  
   * `sp_cancel_booking`  
   * `sp_record_payment`  
   * `sp_confirm_booking`
- **Triggers**:  
   * `trg_payment_after_insert`  
   * `trg_booking_complete_usage`

### Technology Stack
- **Frontend**: React 18, React Router, Axios, Vite
- **Backend**: Node.js, Express.js, MySQL2, JWT, bcrypt
- **Database**: MySQL with stored routines, triggers, functions

### Quick Start (DBMS Project)

#### 1. Database
```sql
CREATE DATABASE sports_court_booking;
```
```powershell
Get-Content database/schema.sql | mysql -u root -p
Get-Content database/sample_data.sql | mysql -u root -p
```

#### 2. Backend
```powershell
cd backend
npm install
npm run dev
```
Backend runs on `http://localhost:5000`

#### 3. Frontend
```powershell
cd frontend
npm install
npm run dev
```
Frontend runs on `http://localhost:5173`

### Project Structure (DBMS)
```
.
├── backend/               # Node.js/Express backend
│   ├── server.js
│   └── src/
│       ├── middleware/
│       └── routes/
├── frontend/              # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── contexts/
│   │   └── services/
│   └── vite.config.js
└── database/              # MySQL schema and data
    ├── schema.sql
    └── sample_data.sql
```

---

## 🚀 CI/CD Pipeline

The repository includes a comprehensive CI/CD pipeline for the IIMS project:

### Pipeline Stages
1. **Build** - Verifies application compiles
2. **Test** - Runs 37 unit and integration tests
3. **Coverage** - Enforces >= 75% code coverage (currently 95%)
4. **Lint** - Code quality checks (flake8, black)
5. **Security** - Vulnerability scanning (safety)

### Deployment Artifact
- Docker image created and stored as artifact

### View Pipeline
Go to: **Actions** tab → **CI/CD Pipeline**

---

## 📁 Repository Structure

```
.
├── IIMS Project Files (Root Level)
│   ├── server.py
│   ├── index.html
│   ├── requirements.txt
│   ├── Dockerfile
│   ├── docker-compose.yml
│   ├── pytest.ini
│   └── tests/
│
├── DBMS Project Files
│   ├── backend/
│   ├── frontend/
│   ├── database/
│   └── SETUP.md
│
├── .github/
│   └── workflows/
│       └── ci-cd.yml      # CI/CD for IIMS
│
└── Documentation
    ├── README.md          # This file
    ├── IMPLEMENTATION_GUIDE.md
    ├── CI_CD_COMPLIANCE.md
    └── QUICK_START.md
```

---

## 🔧 Development

### IIMS Project
- Follow PEP 8 style guide
- Maintain test coverage >= 75%
- All 37 tests must pass
- CI/CD runs automatically on push

### DBMS Project
- Follow JavaScript/React best practices
- Use MySQL stored procedures and triggers
- Test database automations

---

## 📊 Testing & Quality

### IIMS Project
- **37 comprehensive tests** (unit + integration)
- **95% code coverage** (exceeds 75% requirement)
- Automated CI/CD pipeline
- Code quality checks

### DBMS Project
- Manual testing recommended
- Database stored procedures tested
- Frontend/Backend integration testing

---

## 📝 License

Academic use for Software Engineering and DBMS projects.

---

## 👥 Support

For issues or questions:
- IIMS Project: Check `.github/workflows/ci-cd.yml` for CI/CD issues
- DBMS Project: Check `SETUP.md` for setup instructions

---

## 🎯 Quick Links

- **IIMS Application**: http://localhost:5000 (when running)
- **DBMS Backend**: http://localhost:5000 (when running)
- **DBMS Frontend**: http://localhost:5173 (when running)
- **CI/CD Pipeline**: GitHub Actions tab
