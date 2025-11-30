// API Base URL
const API_URL = 'http://localhost:3000/api';

// State
let medicines = [];
let patients = [];
let prescriptions = [];
let currentUser = null;

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    initializeTabs();
    initializeEventListeners();
    loadDashboard();
    setTodayDate();
    updateUserUI();
});

// ===== AUTHENTICATION =====
function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    try {
        currentUser = JSON.parse(localStorage.getItem('user'));
    } catch (e) {
        logout();
    }
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'login.html';
}

function updateUserUI() {
    if (currentUser) {
        // Create user profile section in header if it doesn't exist
        let userSection = document.getElementById('userSection');
        if (!userSection) {
            const headerContent = document.querySelector('.header-content');
            userSection = document.createElement('div');
            userSection.id = 'userSection';
            userSection.className = 'user-section';
            headerContent.appendChild(userSection);
        }

        userSection.innerHTML = `
            <div class="user-profile">
                <span class="user-avatar">👤</span>
                <div class="user-info">
                    <span class="user-name">${currentUser.username}</span>
                    ${currentUser.role !== currentUser.username ? `<span class="user-role badge badge-info">${currentUser.role}</span>` : ''}
                </div>
                <button id="logoutBtn" class="btn btn-sm btn-secondary">Logout</button>
            </div>
        `;

        document.getElementById('logoutBtn').addEventListener('click', logout);
    }
}

// ===== TAB NAVIGATION =====
function initializeTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.getAttribute('data-tab');

            // Remove active class from all buttons and contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            // Add active class to clicked button and corresponding content
            button.classList.add('active');
            const targetContent = document.getElementById(targetTab);
            if (targetContent) {
                targetContent.classList.add('active');

                // Load data when switching tabs
                if (targetTab === 'medicines') {
                    loadMedicines();
                } else if (targetTab === 'patients') {
                    loadPatients();
                } else if (targetTab === 'prescriptions') {
                    loadPrescriptions();
                } else if (targetTab === 'dashboard') {
                    loadDashboard();
                }
            }
        });
    });
}

// ===== EVENT LISTENERS =====
function initializeEventListeners() {
    // Medicine form
    const addMedicineBtn = document.getElementById('addMedicineBtn');
    const cancelMedicineBtn = document.getElementById('cancelMedicineBtn');
    const medicineFormElement = document.getElementById('medicineFormElement');
    const medicineSearch = document.getElementById('medicineSearch');

    if (addMedicineBtn) {
        addMedicineBtn.addEventListener('click', showMedicineForm);
    }
    if (cancelMedicineBtn) {
        cancelMedicineBtn.addEventListener('click', hideMedicineForm);
    }
    if (medicineFormElement) {
        medicineFormElement.addEventListener('submit', saveMedicine);
    }
    if (medicineSearch) {
        medicineSearch.addEventListener('input', searchMedicines);
    }

    // Patient form
    const addPatientBtn = document.getElementById('addPatientBtn');
    const cancelPatientBtn = document.getElementById('cancelPatientBtn');
    const patientFormElement = document.getElementById('patientFormElement');

    if (addPatientBtn) {
        addPatientBtn.addEventListener('click', showPatientForm);
    }
    if (cancelPatientBtn) {
        cancelPatientBtn.addEventListener('click', hidePatientForm);
    }
    if (patientFormElement) {
        patientFormElement.addEventListener('submit', savePatient);
    }

    // Prescription form
    const addPrescriptionBtn = document.getElementById('addPrescriptionBtn');
    const cancelPrescriptionBtn = document.getElementById('cancelPrescriptionBtn');
    const prescriptionFormElement = document.getElementById('prescriptionFormElement');
    const prescriptionMedicine = document.getElementById('prescriptionMedicine');

    if (addPrescriptionBtn) {
        addPrescriptionBtn.addEventListener('click', showPrescriptionForm);
    }
    if (cancelPrescriptionBtn) {
        cancelPrescriptionBtn.addEventListener('click', hidePrescriptionForm);
    }
    if (prescriptionFormElement) {
        prescriptionFormElement.addEventListener('submit', savePrescription);
    }
    if (prescriptionMedicine) {
        prescriptionMedicine.addEventListener('change', updateStockInfo);
    }
}

// ===== DASHBOARD =====
async function loadDashboard() {
    try {
        // Load dashboard stats
        const stats = await fetchAPI('/reports/dashboard');
        
        // Update header stats
        document.getElementById('totalMedicines').textContent = stats.total_medicines || 0;
        document.getElementById('totalPatients').textContent = stats.total_patients || 0;
        document.getElementById('totalPrescriptions').textContent = stats.total_prescriptions || 0;

        // Load alerts
        const [expired, expiringSoon, lowStock] = await Promise.all([
            fetchAPI('/reports/expired'),
            fetchAPI('/reports/expiring-soon'),
            fetchAPI('/reports/low-stock')
        ]);

        // Render alerts
        renderAlerts(stats);
        
        // Render tables
        renderExpiredTable(expired);
        renderExpiringSoonTable(expiringSoon);
        renderLowStockTable(lowStock);

    } catch (error) {
        console.error('Dashboard load error:', error);
        showToast('Failed to load dashboard', 'error');
    }
}

function renderAlerts(stats) {
    const alertsGrid = document.getElementById('alertsGrid');
    if (!alertsGrid) return;

    const alerts = [];

    if (stats.expired_medicines > 0) {
        alerts.push({
            type: 'error',
            icon: '⚠️',
            title: 'Expired Medicines',
            message: `${stats.expired_medicines} medicine(s) have expired`,
            count: stats.expired_medicines
        });
    }

    if (stats.expiring_soon > 0) {
        alerts.push({
            type: 'warning',
            icon: '⏰',
            title: 'Expiring Soon',
            message: `${stats.expiring_soon} medicine(s) expiring within 30 days`,
            count: stats.expiring_soon
        });
    }

    if (stats.low_stock_medicines > 0) {
        alerts.push({
            type: 'info',
            icon: '📉',
            title: 'Low Stock',
            message: `${stats.low_stock_medicines} medicine(s) running low`,
            count: stats.low_stock_medicines
        });
    }

    if (alerts.length === 0) {
        alertsGrid.innerHTML = '<div class="alert alert-success">✅ All systems operational. No alerts.</div>';
        return;
    }

    alertsGrid.innerHTML = alerts.map(alert => `
        <div class="alert alert-${alert.type}">
            <span class="alert-icon">${alert.icon}</span>
            <div class="alert-content">
                <h4>${alert.title}</h4>
                <p>${alert.message}</p>
            </div>
            <span class="alert-count">${alert.count}</span>
        </div>
    `).join('');
}

function renderExpiredTable(data) {
    const tbody = document.querySelector('#expiredTable tbody');
    if (!tbody) return;

    if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: var(--text-muted);">No expired medicines</td></tr>';
        return;
    }

    tbody.innerHTML = data.map(medicine => `
        <tr>
            <td>${medicine.name}</td>
            <td>${medicine.type}</td>
            <td>${medicine.stock}</td>
            <td>${formatDate(medicine.expiry_date)}</td>
        </tr>
    `).join('');
}

function renderExpiringSoonTable(data) {
    const tbody = document.querySelector('#expiringSoonTable tbody');
    if (!tbody) return;

    if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: var(--text-muted);">No medicines expiring soon</td></tr>';
        return;
    }

    tbody.innerHTML = data.map(medicine => `
        <tr>
            <td>${medicine.name}</td>
            <td>${medicine.type}</td>
            <td>${medicine.stock}</td>
            <td>${formatDate(medicine.expiry_date)}</td>
        </tr>
    `).join('');
}

function renderLowStockTable(data) {
    const tbody = document.querySelector('#lowStockTable tbody');
    if (!tbody) return;

    if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: var(--text-muted);">No low stock items</td></tr>';
        return;
    }

    tbody.innerHTML = data.map(medicine => `
        <tr>
            <td>${medicine.name}</td>
            <td>${medicine.type}</td>
            <td>${medicine.stock}</td>
            <td>₹${parseFloat(medicine.price).toFixed(2)}</td>
        </tr>
    `).join('');
}

// ===== MEDICINES =====
async function loadMedicines() {
    try {
        medicines = await fetchAPI('/medicines');
        renderMedicinesTable(medicines);
    } catch (error) {
        showToast('Failed to load medicines', 'error');
    }
}

function renderMedicinesTable(data) {
    const tbody = document.querySelector('#medicinesTable tbody');
    if (!tbody) return;

    if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: var(--text-muted);">No medicines found</td></tr>';
        return;
    }

    tbody.innerHTML = data.map(medicine => `
        <tr>
            <td>${medicine.id}</td>
            <td>${medicine.name}</td>
            <td>${medicine.type}</td>
            <td>${medicine.stock}</td>
            <td>₹${parseFloat(medicine.price).toFixed(2)}</td>
            <td>${formatDate(medicine.expiry_date)}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-sm btn-secondary" onclick="editMedicine(${medicine.id})">Edit</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteMedicine(${medicine.id})">Delete</button>
                </div>
            </td>
        </tr>
    `).join('');
}

function showMedicineForm() {
    document.getElementById('medicineForm').style.display = 'block';
    document.getElementById('medicineFormTitle').textContent = 'Add New Medicine';
    document.getElementById('medicineFormElement').reset();
    document.getElementById('medicineId').value = '';
    
    // Scroll to form
    document.getElementById('medicineForm').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function hideMedicineForm() {
    document.getElementById('medicineForm').style.display = 'none';
}

async function saveMedicine(e) {
    e.preventDefault();

    const id = document.getElementById('medicineId').value;
    const data = {
        name: document.getElementById('medicineName').value,
        type: document.getElementById('medicineType').value,
        stock: parseInt(document.getElementById('medicineStock').value),
        price: parseFloat(document.getElementById('medicinePrice').value),
        expiry_date: document.getElementById('medicineExpiry').value
    };

    try {
        if (id) {
            await fetchAPI(`/medicines/${id}`, 'PUT', data);
            showToast('Medicine updated successfully', 'success');
        } else {
            await fetchAPI('/medicines', 'POST', data);
            showToast('Medicine added successfully', 'success');
        }

        hideMedicineForm();
        loadMedicines();
        loadDashboard(); // Refresh dashboard stats
    } catch (error) {
        showToast(error.message || 'Failed to save medicine', 'error');
    }
}

async function editMedicine(id) {
    const medicine = medicines.find(m => m.id === id);
    if (!medicine) return;

    document.getElementById('medicineId').value = medicine.id;
    document.getElementById('medicineName').value = medicine.name;
    document.getElementById('medicineType').value = medicine.type;
    document.getElementById('medicineStock').value = medicine.stock;
    document.getElementById('medicinePrice').value = medicine.price;
    document.getElementById('medicineExpiry').value = medicine.expiry_date.split('T')[0]; // Format date for input

    document.getElementById('medicineFormTitle').textContent = 'Edit Medicine';
    document.getElementById('medicineForm').style.display = 'block';
    
    // Scroll to form
    document.getElementById('medicineForm').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

async function deleteMedicine(id) {
    console.log('Attempting to delete medicine:', id);
    if (!confirm('Are you sure you want to delete this medicine?')) {
        console.log('Deletion cancelled by user');
        return;
    }

    try {
        console.log('Sending DELETE request...');
        const result = await fetchAPI(`/medicines/${id}`, 'DELETE');
        console.log('DELETE response:', result);

        showToast('Medicine deleted successfully', 'success');
        await loadMedicines();
        console.log('Medicines reloaded');
    } catch (error) {
        console.error('Delete failed:', error);
        showToast('Failed to delete medicine: ' + error.message, 'error');
    }
}

async function searchMedicines(e) {
    const query = e.target.value.trim();

    if (query === '') {
        renderMedicinesTable(medicines);
        return;
    }

    const filtered = medicines.filter(m =>
        m.name.toLowerCase().includes(query.toLowerCase()) ||
        m.type.toLowerCase().includes(query.toLowerCase())
    );

    renderMedicinesTable(filtered);
}

// ===== PATIENTS =====
async function loadPatients() {
    try {
        patients = await fetchAPI('/patients');
        renderPatientsTable(patients);
    } catch (error) {
        showToast('Failed to load patients', 'error');
    }
}

function renderPatientsTable(data) {
    const tbody = document.querySelector('#patientsTable tbody');

    if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--text-muted);">No patients found</td></tr>';
        return;
    }

    tbody.innerHTML = data.map(patient => `
        <tr>
            <td>${patient.id}</td>
            <td>${patient.name}</td>
            <td>${patient.age}</td>
            <td>${patient.phone}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-sm btn-secondary" onclick="editPatient(${patient.id})">Edit</button>
                    <button class="btn btn-sm btn-danger" onclick="deletePatient(${patient.id})">Delete</button>
                </div>
            </td>
        </tr>
    `).join('');
}

function showPatientForm() {
    document.getElementById('patientForm').style.display = 'block';
    document.getElementById('patientFormTitle').textContent = 'Add New Patient';
    document.getElementById('patientFormElement').reset();
    document.getElementById('patientId').value = '';
}

function hidePatientForm() {
    document.getElementById('patientForm').style.display = 'none';
}

async function savePatient(e) {
    e.preventDefault();

    const id = document.getElementById('patientId').value;
    const age = parseInt(document.getElementById('patientAge').value);
    
    // Validate age (must be more than 0 and less than or equal to 100)
    if (isNaN(age) || age <= 0 || age > 100) {
        showToast('Age must be more than 0 and less than or equal to 100', 'error');
        return;
    }

    const data = {
        name: document.getElementById('patientName').value,
        age: age,
        phone: document.getElementById('patientPhone').value
    };

    try {
        if (id) {
            await fetchAPI(`/patients/${id}`, 'PUT', data);
            showToast('Patient updated successfully', 'success');
        } else {
            await fetchAPI('/patients', 'POST', data);
            showToast('Patient added successfully', 'success');
        }

        hidePatientForm();
        loadPatients();
    } catch (error) {
        showToast(error.message || 'Failed to save patient', 'error');
    }
}

async function editPatient(id) {
    const patient = patients.find(p => p.id === id);
    if (!patient) return;

    document.getElementById('patientId').value = patient.id;
    document.getElementById('patientName').value = patient.name;
    document.getElementById('patientAge').value = patient.age;
    document.getElementById('patientPhone').value = patient.phone;

    document.getElementById('patientFormTitle').textContent = 'Edit Patient';
    document.getElementById('patientForm').style.display = 'block';
}

async function deletePatient(id) {
    if (!confirm('Are you sure you want to delete this patient?')) return;

    try {
        await fetchAPI(`/patients/${id}`, 'DELETE');
        showToast('Patient deleted successfully', 'success');
        loadPatients();
    } catch (error) {
        showToast('Failed to delete patient', 'error');
    }
}

// ===== PRESCRIPTIONS =====
async function loadPrescriptions() {
    try {
        prescriptions = await fetchAPI('/prescriptions');
        renderPrescriptionsTable(prescriptions);

        // Load dropdowns
        await loadPrescriptionDropdowns();
    } catch (error) {
        showToast('Failed to load prescriptions', 'error');
    }
}

function renderPrescriptionsTable(data) {
    const tbody = document.querySelector('#prescriptionsTable tbody');

    if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: var(--text-muted);">No prescriptions found</td></tr>';
        return;
    }

    tbody.innerHTML = data.map(prescription => {
        const total = prescription.quantity * prescription.medicine_price;
        return `
            <tr>
                <td>${prescription.id}</td>
                <td>${prescription.patient_name}</td>
                <td>${prescription.medicine_name} (${prescription.medicine_type})</td>
                <td>${prescription.quantity}</td>
                <td>${formatDate(prescription.date)}</td>
                <td>₹${total.toFixed(2)}</td>
            </tr>
        `;
    }).join('');
}

async function showPrescriptionForm() {
    await loadPrescriptionDropdowns();
    document.getElementById('prescriptionForm').style.display = 'block';
    document.getElementById('prescriptionFormElement').reset();
    document.getElementById('stockInfo').style.display = 'none';
}

function hidePrescriptionForm() {
    document.getElementById('prescriptionForm').style.display = 'none';
}

async function loadPrescriptionDropdowns() {
    try {
        const [medicinesData, patientsData] = await Promise.all([
            fetchAPI('/medicines'),
            fetchAPI('/patients')
        ]);

        // Populate patients dropdown
        const patientSelect = document.getElementById('prescriptionPatient');
        patientSelect.innerHTML = '<option value="">Choose Patient</option>' +
            patientsData.map(p => `<option value="${p.id}">${p.name} (Age: ${p.age})</option>`).join('');

        // Populate medicines dropdown
        const medicineSelect = document.getElementById('prescriptionMedicine');
        medicineSelect.innerHTML = '<option value="">Choose Medicine</option>' +
            medicinesData.map(m => `<option value="${m.id}" data-stock="${m.stock}">${m.name} - ${m.type} (Stock: ${m.stock})</option>`).join('');

    } catch (error) {
        showToast('Failed to load dropdown data', 'error');
    }
}

function updateStockInfo() {
    const select = document.getElementById('prescriptionMedicine');
    const selectedOption = select.options[select.selectedIndex];

    if (selectedOption.value) {
        const stock = selectedOption.dataset.stock;
        document.getElementById('availableStock').textContent = stock;
        document.getElementById('stockInfo').style.display = 'flex';
    } else {
        document.getElementById('stockInfo').style.display = 'none';
    }
}

// Make functions globally available for onclick handlers
window.editMedicine = editMedicine;
window.deleteMedicine = deleteMedicine;
window.editPatient = editPatient;
window.deletePatient = deletePatient;
window.loadMedicines = loadMedicines;
window.updateStockInfo = updateStockInfo;

async function savePrescription(e) {
    e.preventDefault();

    const data = {
        patient_id: parseInt(document.getElementById('prescriptionPatient').value),
        medicine_id: parseInt(document.getElementById('prescriptionMedicine').value),
        quantity: parseInt(document.getElementById('prescriptionQuantity').value),
        date: document.getElementById('prescriptionDate').value
    };

    try {
        const result = await fetchAPI('/prescriptions', 'POST', data);
        showToast(`Prescription created! Stock remaining: ${result.stock_remaining}`, 'success');
        hidePrescriptionForm();
        loadPrescriptions();
        loadDashboard(); // Refresh dashboard stats
    } catch (error) {
        showToast(error.message || 'Failed to create prescription', 'error');
    }
}

// ===== UTILITY FUNCTIONS =====
async function fetchAPI(endpoint, method = 'GET', data = null) {
    const token = localStorage.getItem('token');

    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : ''
        }
    };

    if (data) {
        options.body = JSON.stringify(data);
    }

    try {
        const response = await fetch(`${API_URL}${endpoint}`, options);

        // Handle 401 Unauthorized (token expired or invalid)
        if (response.status === 401) {
            logout();
            throw new Error('Session expired. Please login again.');
        }

        // Handle empty responses (like 204 No Content)
        if (response.status === 204) {
            return {};
        }

        // Check content type before parsing JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            const text = await response.text();
            if (!response.ok) {
                throw new Error(text || 'Request failed');
            }
            return text;
        }

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'Request failed');
        }

        return result;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function setTodayDate() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('prescriptionDate').value = today;
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type}`;
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}
