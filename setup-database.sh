#!/bin/bash

echo "🚀 Pharmacy Database Setup Script"
echo "=================================="
echo ""

# Check if MySQL is running
if ! command -v mysql &> /dev/null; then
    echo "❌ MySQL is not installed or not in PATH"
    exit 1
fi

echo "📝 Please enter your MySQL root password when prompted"
echo ""

# Create database
echo "Creating pharmacy_db database..."
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS pharmacy_db;"

if [ $? -eq 0 ]; then
    echo "✅ Database created successfully"
else
    echo "❌ Failed to create database"
    exit 1
fi

# Import schema
echo ""
echo "Importing schema and sample data..."
mysql -u root -p pharmacy_db < database/schema.sql

if [ $? -eq 0 ]; then
    echo "✅ Schema imported successfully"
else
    echo "❌ Failed to import schema"
    exit 1
fi

# Verify data
echo ""
echo "Verifying data..."
mysql -u root -p pharmacy_db -e "SELECT COUNT(*) as medicines FROM medicines; SELECT COUNT(*) as patients FROM patients; SELECT COUNT(*) as prescriptions FROM prescriptions;"

echo ""
echo "🎉 Database setup complete!"
echo ""
echo "Next steps:"
echo "1. Update your .env file with your MySQL password"
echo "2. Restart the server: npm run dev"
echo "3. Open http://localhost:3000"
