# Quick Setup Guide

## Step 1: Database Setup

1. **Create the database:**
```sql
CREATE DATABASE sports_court_booking;
```

2. **Import the schema:**
```bash
mysql -u root -p sports_court_booking < database/schema.sql
```

3. **Optional: Add sample data:**
```bash
mysql -u root -p sports_court_booking < database/sample_data.sql
```

## Step 2: Backend Setup

1. **Navigate to backend:**
```bash
cd backend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Create `.env` file:**
Create a file named `.env` in the backend folder with:
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=sports_court_booking
JWT_SECRET=your_secret_key_here_change_in_production
```

4. **Start backend:**
```bash
npm run dev
```

Backend should now be running on `http://localhost:5000`

## Step 3: Frontend Setup

1. **Navigate to frontend:**
```bash
cd frontend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Start frontend:**
```bash
npm run dev
```

Frontend should now be running on `http://localhost:5173`

## Step 4: Access the Application

Open your browser and go to: `http://localhost:5173`

### Test Account
If you imported sample data, you can use:
- Email: `test@student.college.edu`
- Password: You'll need to register a new account or generate a proper password hash

**Note:** For the sample data students, you'll need to generate proper bcrypt password hashes. You can register new students through the UI.

## Troubleshooting

### Port Already in Use
- Change PORT in backend `.env` file
- Update `vite.config.js` proxy if backend port changes

### Database Connection Error
- Verify MySQL is running: `mysql --version`
- Check credentials in `.env`
- Ensure database exists

### CORS Errors
- Make sure backend is running
- Check CORS settings in `server.js`

## Generating Password Hash for Sample Data

To create a proper password hash for test accounts, you can use the provided script:

```bash
cd backend
node scripts/generatePasswordHash.js your_password
```

Or use Node.js directly:

```javascript
const bcrypt = require('bcryptjs');
bcrypt.hash('test123', 10).then(hash => console.log(hash));
```

Then update the sample_data.sql with the generated hash.

