# Pharmacy Medication Stock & Prescription Management System

A comprehensive web-based application for managing pharmacy inventory, patient records, and prescriptions with automatic stock management and expiry tracking.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Node](https://img.shields.io/badge/node-%3E%3D14.0.0-green)
![MySQL](https://img.shields.io/badge/mysql-%3E%3D8.0-orange)

## 🎯 Features

### ✅ Medicines Management
- Add, update, and delete medicines
- Track stock levels in real-time
- Monitor expiry dates
- Search medicines by name or type
- Automatic low-stock alerts
- Price management

### 👥 Patient Management
- Maintain patient records
- Store patient details (name, age, phone)
- View patient prescription history
- Easy CRUD operations

### 📋 Prescription Handling
- Create prescriptions with patient and medicine selection
- Automatic stock reduction on prescription creation
- Stock validation to prevent overselling
- Transaction-based inventory updates
- Prescription history tracking

### 📊 Reports & Analytics
- Dashboard with key statistics
- Expired medicines report
- Expiring soon alerts (30-day window)
- Low stock warnings
- Real-time inventory insights

## 🛠️ Technology Stack

**Backend:**
- Node.js
- Express.js
- MySQL (with mysql2 driver)

**Frontend:**
- HTML5
- CSS3 (Modern dark theme with glassmorphism)
- Vanilla JavaScript

**Tools:**
- dotenv (Environment configuration)
- CORS (Cross-origin resource sharing)
- Nodemon (Development auto-reload)

## 📋 Prerequisites

- Node.js (v14 or higher)
- MySQL (v8.0 or higher)
- npm or yarn package manager

## 🚀 Installation

### 1. Clone or Download the Project

```bash
cd /Users/rohitdas/Desktop/MERN\ Stack/Internship-project
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Database

**Option A: Using XAMPP**
1. Start XAMPP and run MySQL
2. Open phpMyAdmin (http://localhost/phpmyadmin)
3. Create a new database named `pharmacy_db`
4. Import the schema:
   - Click on `pharmacy_db`
   - Go to "Import" tab
   - Select `database/schema.sql`
   - Click "Go"

**Option B: Using MySQL Command Line**
```bash
mysql -u root -p < database/schema.sql
```

### 4. Configure Environment Variables

Edit the `.env` file and update your database credentials:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password_here
DB_NAME=pharmacy_db
PORT=3000
```

### 5. Start the Server

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will start at `http://localhost:3000`

## 📖 Usage Guide

### Accessing the Application

1. Open your browser and navigate to `http://localhost:3000`
2. You'll see the dashboard with statistics and alerts

### Managing Medicines

1. Click on the **Medicines** tab
2. Click **Add Medicine** button
3. Fill in the form:
   - Medicine Name
   - Type (Tablet, Syrup, etc.)
   - Stock Quantity
   - Price
   - Expiry Date
4. Click **Save Medicine**

### Managing Patients

1. Click on the **Patients** tab
2. Click **Add Patient** button
3. Enter patient details
4. Click **Save Patient**

### Creating Prescriptions

1. Click on the **Prescriptions** tab
2. Click **Create Prescription** button
3. Select a patient from the dropdown
4. Select a medicine (stock will be displayed)
5. Enter quantity (system validates against available stock)
6. Select date
7. Click **Create Prescription**
   - Stock will automatically reduce
   - Alert shown if insufficient stock

### Viewing Reports

1. Click on the **Dashboard** tab
2. View:
   - Total statistics (medicines, patients, prescriptions)
   - Expired medicines
   - Medicines expiring within 30 days
   - Low stock items (< 10 units)

## 🔌 API Endpoints

### Medicines
- `GET /api/medicines` - Get all medicines
- `GET /api/medicines/:id` - Get single medicine
- `POST /api/medicines` - Add new medicine
- `PUT /api/medicines/:id` - Update medicine
- `DELETE /api/medicines/:id` - Delete medicine
- `GET /api/medicines/search/:query` - Search medicines

### Patients
- `GET /api/patients` - Get all patients
- `GET /api/patients/:id` - Get single patient
- `POST /api/patients` - Add new patient
- `PUT /api/patients/:id` - Update patient
- `DELETE /api/patients/:id` - Delete patient

### Prescriptions
- `GET /api/prescriptions` - Get all prescriptions
- `POST /api/prescriptions` - Create prescription (auto reduces stock)
- `GET /api/prescriptions/patient/:id` - Get patient prescription history

### Reports
- `GET /api/reports/expired` - Get expired medicines
- `GET /api/reports/expiring-soon` - Get medicines expiring within 30 days
- `GET /api/reports/low-stock` - Get low stock medicines
- `GET /api/reports/dashboard` - Get dashboard statistics

## 📁 Project Structure

```
Internship-project/
├── database/
│   ├── db.js              # Database connection
│   └── schema.sql         # Database schema
├── routes/
│   ├── medicines.js       # Medicine routes
│   ├── patients.js        # Patient routes
│   ├── prescriptions.js   # Prescription routes
│   └── reports.js         # Reports routes
├── public/
│   ├── css/
│   │   └── style.css      # Styles
│   ├── js/
│   │   └── app.js         # Frontend logic
│   └── index.html         # Main page
├── server.js              # Express server
├── package.json           # Dependencies
├── .env                   # Environment config
└── README.md              # Documentation
```

## 🎨 Design Features

- **Modern Dark Theme** with purple/blue gradients
- **Glassmorphism** effects on cards and modals
- **Smooth Animations** for enhanced UX
- **Responsive Design** for all screen sizes
- **Real-time Alerts** for critical inventory issues
- **Interactive Tables** with hover effects
- **Toast Notifications** for user feedback

## 🔒 Security Notes

- Never commit `.env` file to version control
- Use strong database passwords in production
- Implement authentication for production use
- Validate all user inputs
- Use prepared statements (already implemented)

## 🚀 Future Enhancements

- [ ] User authentication & authorization
- [ ] Role-based access control (Admin, Pharmacist)
- [ ] GST billing integration
- [ ] PDF invoice generation
- [ ] SMS/Email notifications for patients
- [ ] Barcode scanning for medicines
- [ ] Advanced analytics with charts
- [ ] Backup and restore functionality
- [ ] Multi-pharmacy support

## 🐛 Troubleshooting

**Database connection failed:**
- Check MySQL is running
- Verify credentials in `.env`
- Ensure `pharmacy_db` database exists

**Port already in use:**
- Change PORT in `.env` file
- Or stop the process using port 3000

**Cannot find module errors:**
- Run `npm install` again
- Delete `node_modules` and reinstall

## 📄 License

This project is open source and available for educational purposes.

## 👨‍💻 Author

Created as an internship project demonstrating full-stack development skills with Node.js, MySQL, and modern web technologies.

## 🙏 Acknowledgments

- Express.js team for the excellent web framework
- MySQL team for the robust database system
- Google Fonts for Inter typeface
