// Blood Bank JavaScript with Google Sheets Backend

// Google Sheets Configuration
const GOOGLE_SHEETS_ID = '2PACX-1vR1TSjBq4wdR1yEDfujvn-ehP3LQ3wXHCPAcYDn34sowxTefL4WmuMcebnuANwXaUMFjqxYCAovS6mJ'; // Replace with your sheet ID
const SHEET_NAME = 'Sheet1';
const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbw2PACX-1vR1TSjBq4wdR1yEDfujvn-ehP3LQ3wXHCPAcYDn34sowxTefL4WmuMcebnuANwXaUMFjqxYCAovS6mJ/exec'; // For form submission

// Fallback data if Google Sheets is not accessible
const fallbackDonors = [
    {
        id: 1,
        name: "Vignesh",
        bloodGroup: "AB+",
        age: 20,
        phone: "9786206210",
        district: "Thanjavur",
        location: "Central Bus Stand",
        registeredDate: "2024-01-15",
        lastDonated: "2024-01-10",
        status: "Active"
    }
];

// Tamil Nadu Districts
const tamilNaduDistricts = [
    "Ariyalur", "Chengalpattu", "Chennai", "Coimbatore", "Cuddalore",
    "Dharmapuri", "Dindigul", "Erode", "Kallakurichi", "Kancheepuram",
    "Kanniyakumari", "Karur", "Krishnagiri", "Madurai", "Mayiladuthurai",
    "Nagapattinam", "Namakkal", "Nilgiris", "Perambalur", "Pudukkottai",
    "Ramanathapuram", "Ranipet", "Salem", "Sivaganga", "Tenkasi",
    "Thanjavur", "Theni", "Thiruvallur", "Thiruvarur", "Thoothukudi",
    "Tiruchirappalli", "Tirunelveli", "Tirupathur", "Tiruppur", "Tiruvannamalai",
    "Vellore", "Villupuram", "Virudhunagar"
];

// DOM Elements
let searchDistrictSelect, searchBloodGroupSelect, searchBtn;
let donorDistrictSelect, donorBloodGroupSelect, donorForm;
let resultsContainer, totalDonorsElement;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    searchDistrictSelect = document.getElementById('searchDistrict');
    searchBloodGroupSelect = document.getElementById('searchBloodGroup');
    searchBtn = document.getElementById('searchBtn');
    donorDistrictSelect = document.getElementById('donorDistrict');
    donorBloodGroupSelect = document.getElementById('donorBloodGroup');
    donorForm = document.getElementById('donorRegistrationForm');
    resultsContainer = document.getElementById('resultsContainer');
    totalDonorsElement = document.getElementById('totalDonors');
    
    // Initialize the app
    initializeApp();
    
    // Set up event listeners
    setupEventListeners();
    
    // Load donors from Google Sheets
    loadDonors();
});

function initializeApp() {
    // Populate district dropdowns
    populateDistricts(searchDistrictSelect);
    populateDistricts(donorDistrictSelect);
}

function populateDistricts(selectElement) {
    // Clear existing options except first one
    while (selectElement.options.length > 1) {
        selectElement.remove(1);
    }
    
    // Add districts in alphabetical order
    tamilNaduDistricts.sort().forEach(district => {
        const option = document.createElement('option');
        option.value = district;
        option.textContent = district;
        selectElement.appendChild(option);
    });
}

function setupEventListeners() {
    // Search button click
    if (searchBtn) {
        searchBtn.addEventListener('click', searchDonors);
    }
    
    // Donor form submission
    if (donorForm) {
        donorForm.addEventListener('submit', registerDonor);
    }
    
    // Notification close button
    const notificationClose = document.getElementById('notificationClose');
    if (notificationClose) {
        notificationClose.addEventListener('click', hideNotification);
    }
    
    // Enter key in search form
    if (searchDistrictSelect) {
        searchDistrictSelect.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') searchDonors();
        });
    }
    if (searchBloodGroupSelect) {
        searchBloodGroupSelect.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') searchDonors();
        });
    }
}

async function loadDonors() {
    try {
        showLoading(true);
        
        // Try to load from Google Sheets
        const donors = await fetchDonorsFromGoogleSheets();
        
        if (donors && donors.length > 0) {
            updateTotalDonorsCount(donors.length);
            showNotification(`Loaded ${donors.length} donor records`, 'success');
        } else {
            // Use fallback data
            updateTotalDonorsCount(fallbackDonors.length);
            showNotification('Using sample data. Please configure Google Sheets for real-time updates.', 'warning');
        }
    } catch (error) {
        console.error('Error loading donors:', error);
        updateTotalDonorsCount(fallbackDonors.length);
        showNotification('Network error. Using offline data.', 'error');
    } finally {
        showLoading(false);
    }
}

async function fetchDonorsFromGoogleSheets() {
    try {
        // Using a proxy to avoid CORS issues
        const proxyUrl = 'https://api.allorigins.win/raw?url=';
        const sheetsUrl = `https://docs.google.com/spreadsheets/d/e/${GOOGLE_SHEETS_ID}/pub?gid=0&single=true&output=csv`;
        
        const response = await fetch(proxyUrl + encodeURIComponent(sheetsUrl));
        
        if (!response.ok) {
            throw new Error('Failed to fetch data');
        }
        
        const csvData = await response.text();
        return parseCSVData(csvData);
    } catch (error) {
        console.error('Error fetching from Google Sheets:', error);
        return null;
    }
}

function parseCSVData(csvData) {
    const donors = [];
    const rows = csvData.split('\n');
    
    // Skip header row
    for (let i = 1; i < rows.length; i++) {
        const columns = rows[i].split(',');
        
        if (columns.length >= 6 && columns[1]) { // Check if name exists
            donors.push({
                id: i,
                name: columns[1]?.trim() || 'Anonymous',
                bloodGroup: columns[2]?.trim() || 'Not specified',
                age: parseInt(columns[3]) || 0,
                phone: columns[4]?.trim() || 'Not available',
                district: columns[5]?.trim() || 'Not specified',
                location: columns[6]?.trim() || columns[5]?.trim() || 'Not specified',
                registeredDate: columns[0]?.trim() || new Date().toISOString().split('T')[0],
                lastDonated: columns[7]?.trim() || 'Never',
                status: columns[8]?.trim() || 'Active'
            });
        }
    }
    
    return donors;
}

async function searchDonors() {
    const district = searchDistrictSelect.value;
    const bloodGroup = searchBloodGroupSelect.value;
    
    if (!district || !bloodGroup) {
        showNotification('Please select both district and blood group', 'warning');
        return;
    }
    
    try {
        showLoading(true, resultsContainer);
        
        // Fetch latest data
        const donors = await fetchDonorsFromGoogleSheets() || fallbackDonors;
        
        // Filter donors
        const filteredDonors = donors.filter(donor => 
            donor.status === 'Active' &&
            donor.district.toLowerCase() === district.toLowerCase() && 
            donor.bloodGroup === bloodGroup
        );
        
        displaySearchResults(filteredDonors, district, bloodGroup);
    } catch (error) {
        console.error('Search error:', error);
        showNotification('Error searching donors. Please try again.', 'error');
    } finally {
        showLoading(false, resultsContainer);
    }
}

function displaySearchResults(donors, district, bloodGroup) {
    resultsContainer.innerHTML = '';
    
    if (donors.length === 0) {
        resultsContainer.innerHTML = `
            <div class="no-results">
                <i class="fas fa-exclamation-circle" style="font-size: 48px; color: #ff6b6b; margin-bottom: 20px;"></i>
                <h3>No active donors found</h3>
                <p>No registered donors found for ${bloodGroup} blood group in ${district} district.</p>
                <p>Please check:</p>
                <ul style="text-align: left; margin: 15px auto; display: inline-block;">
                    <li>Other nearby districts</li>
                    <li>Compatible blood groups</li>
                    <li>Emergency contact number</li>
                </ul>
                <p style="margin-top: 20px;">
                    <a href="#register-donor" class="btn" style="background: #c0392b; color: white; padding: 10px 20px;">
                        <i class="fas fa-user-plus"></i> Register as Donor
                    </a>
                </p>
            </div>
        `;
        return;
    }
    
    const resultsTitle = document.createElement('div');
    resultsTitle.className = 'results-header';
    resultsTitle.innerHTML = `
        <h3><i class="fas fa-users"></i> Found ${donors.length} donor(s)</h3>
        <p style="color: #666;">${bloodGroup} blood group in ${district} district</p>
        <div style="margin: 10px 0; padding: 10px; background: #e8f5e9; border-radius: 5px;">
            <small><i class="fas fa-info-circle"></i> Click "Contact Donor" to get phone number</small>
        </div>
    `;
    resultsContainer.appendChild(resultsTitle);
    
    donors.forEach(donor => {
        const donorCard = createDonorCard(donor);
        resultsContainer.appendChild(donorCard);
    });
}

function createDonorCard(donor) {
    const card = document.createElement('div');
    card.className = 'donor-card';
    
    // Format phone for display (hide middle digits)
    const phoneDisplay = donor.phone.length === 10 ? 
        `${donor.phone.substring(0, 3)}***${donor.phone.substring(6)}` : 
        'Not available';
    
    card.innerHTML = `
        <div class="donor-info">
            <h4>${donor.name} <span class="blood-group">(${donor.bloodGroup})</span></h4>
            <div class="donor-details">
                <span><i class="fas fa-birthday-cake"></i> ${donor.age} years</span>
                <span><i class="fas fa-map-marker-alt"></i> ${donor.district}</span>
                <span><i class="fas fa-location-dot"></i> ${donor.location}</span>
                <span><i class="fas fa-calendar-alt"></i> Last donated: ${donor.lastDonated}</span>
            </div>
            <div style="margin-top: 10px; color: #666; font-size: 14px;">
                <i class="fas fa-phone"></i> ${phoneDisplay}
            </div>
        </div>
        <button class="contact-btn" onclick="showContactModal('${donor.name}', '${donor.bloodGroup}', '${donor.phone}', '${donor.district}')">
            <i class="fas fa-phone"></i> Contact Donor
        </button>
    `;
    
    return card;
}

// Global function for contact button
window.showContactModal = function(name, bloodGroup, phone, district) {
    const modalHTML = `
        <div class="contact-modal-overlay" id="contactModalOverlay">
            <div class="contact-modal">
                <div class="contact-modal-header">
                    <h3><i class="fas fa-user-md"></i> Contact Donor</h3>
                    <button onclick="closeContactModal()" class="close-btn">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="contact-modal-body">
                    <div class="donor-contact-info">
                        <p><strong>Donor Name:</strong> ${name}</p>
                        <p><strong>Blood Group:</strong> <span class="blood-group">${bloodGroup}</span></p>
                        <p><strong>Phone Number:</strong> ${phone}</p>
                        <p><strong>District:</strong> ${district}</p>
                    </div>
                    <div class="contact-actions">
                        <a href="tel:${phone}" class="btn call-btn">
                            <i class="fas fa-phone"></i> Call Now
                        </a>
                        <a href="https://wa.me/91${phone}?text=Hi%20${encodeURIComponent(name)}%2C%20I%20need%20${bloodGroup}%20blood%20for%20emergency%20in%20${encodeURIComponent(district)}%20district.%20Please%20call%20back.%20-%20PK%20Blood%20Bank"
                           target="_blank" class="btn whatsapp-btn">
                            <i class="fab fa-whatsapp"></i> WhatsApp
                        </a>
                    </div>
                    <div class="emergency-guidelines">
                        <h4><i class="fas fa-exclamation-triangle"></i> Emergency Guidelines:</h4>
                        <ul>
                            <li>Identify yourself clearly</li>
                            <li>Explain the emergency situation</li>
                            <li>Confirm blood group requirement</li>
                            <li>Arrange hospital details</li>
                            <li>Be respectful and polite</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Remove existing modal if any
    const existingModal = document.getElementById('contactModalOverlay');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Add new modal
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Add styles for modal if not already present
    addModalStyles();
};

window.closeContactModal = function() {
    const modal = document.getElementById('contactModalOverlay');
    if (modal) {
        modal.remove();
    }
};

function addModalStyles() {
    if (!document.getElementById('contactModalStyles')) {
        const style = document.createElement('style');
        style.id = 'contactModalStyles';
        style.textContent = `
            .contact-modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.7);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 9999;
                padding: 20px;
            }
            
            .contact-modal {
                background: white;
                border-radius: 15px;
                width: 100%;
                max-width: 500px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                animation: modalSlideIn 0.3s ease;
            }
            
            @keyframes modalSlideIn {
                from {
                    opacity: 0;
                    transform: translateY(-50px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            .contact-modal-header {
                background: linear-gradient(135deg, #c0392b, #e74c3c);
                color: white;
                padding: 20px;
                border-radius: 15px 15px 0 0;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .contact-modal-header h3 {
                margin: 0;
            }
            
            .close-btn {
                background: none;
                border: none;
                color: white;
                font-size: 20px;
                cursor: pointer;
                padding: 5px;
            }
            
            .contact-modal-body {
                padding: 30px;
            }
            
            .donor-contact-info {
                background: #f8f9fa;
                padding: 20px;
                border-radius: 10px;
                margin-bottom: 20px;
            }
            
            .donor-contact-info p {
                margin: 10px 0;
                font-size: 16px;
            }
            
            .contact-actions {
                display: flex;
                gap: 15px;
                margin-bottom: 25px;
            }
            
            .contact-actions .btn {
                flex: 1;
                padding: 15px;
                text-align: center;
                border-radius: 8px;
                text-decoration: none;
                font-weight: 600;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 10px;
            }
            
            .call-btn {
                background: #c0392b;
                color: white;
            }
            
            .whatsapp-btn {
                background: #25D366;
                color: white;
            }
            
            .emergency-guidelines {
                background: #fff3cd;
                border-left: 4px solid #ffc107;
                padding: 15px;
                border-radius: 5px;
            }
            
            .emergency-guidelines h4 {
                color: #856404;
                margin-top: 0;
            }
            
            .emergency-guidelines ul {
                margin: 10px 0;
                padding-left: 20px;
            }
            
            .emergency-guidelines li {
                margin: 5px 0;
                color: #856404;
            }
        `;
        document.head.appendChild(style);
    }
}

async function registerDonor(e) {
    e.preventDefault();
    
    // Get form values
    const name = document.getElementById('donorName').value.trim();
    const age = document.getElementById('donorAge').value;
    const bloodGroup = donorBloodGroupSelect.value;
    const phone = document.getElementById('donorPhone').value.trim();
    const district = donorDistrictSelect.value;
    const location = document.getElementById('donorLocation').value.trim();
    
    // Validate inputs
    if (!name || !age || !bloodGroup || !phone || !district) {
        showNotification('Please fill all required fields', 'error');
        return;
    }
    
    // Validate phone number
    if (!/^[6-9][0-9]{9}$/.test(phone)) {
        showNotification('Please enter a valid 10-digit Indian mobile number', 'error');
        return;
    }
    
    // Validate age
    if (age < 18 || age > 65) {
        showNotification('Age must be between 18 and 65 years', 'error');
        return;
    }
    
    try {
        showLoading(true);
        
        // Submit to Google Form via Apps Script or direct form
        const submitted = await submitDonorToGoogleForm({
            name,
            bloodGroup,
            age,
            phone,
            district,
            location,
            timestamp: new Date().toISOString()
        });
        
        if (submitted) {
            // Show success message
            showNotification(`Thank you ${name}! You are now registered as a blood donor. Our team will verify and activate your profile within 24 hours.`, 'success');
            
            // Reset form
            donorForm.reset();
            
            // Update donor count
            setTimeout(loadDonors, 2000);
            
            // Auto-search if same criteria
            if (searchDistrictSelect.value === district && searchBloodGroupSelect.value === bloodGroup) {
                setTimeout(searchDonors, 1000);
            }
        } else {
            showNotification('Registration failed. Please try again or contact us directly.', 'error');
        }
    } catch (error) {
        console.error('Registration error:', error);
        showNotification('Network error. Please save your details and contact us at 7010704215', 'error');
    } finally {
        showLoading(false);
    }
}

async function submitDonorToGoogleForm(donorData) {
    try {
        // Method 1: Direct Google Forms submission (if you create a Google Form)
        const formResponse = await submitViaGoogleForm(donorData);
        
        if (formResponse) {
            return true;
        }
        
        // Method 2: Email fallback
        await submitViaEmail(donorData);
        return true;
        
    } catch (error) {
        console.error('Form submission error:', error);
        return false;
    }
}

async function submitViaGoogleForm(donorData) {
    // This requires creating a Google Form and getting its submission URL
    const formURL = 'https://docs.google.com/forms/d/e/1FAIpQLSdHR7IvnxF26cwVbNPR5N1VhZY7JZ-a1Q96Aga7TO65SljDRw/formResponse';
    
    // Create form data
    const formData = new FormData();
    formData.append('entry.1234567890', donorData.name); // Replace with actual entry IDs
    formData.append('entry.2345678901', donorData.bloodGroup);
    formData.append('entry.3456789012', donorData.age);
    formData.append('entry.4567890123', donorData.phone);
    formData.append('entry.5678901234', donorData.district);
    formData.append('entry.6789012345', donorData.location);
    
    try {
        const response = await fetch(formURL, {
            method: 'POST',
            body: formData,
            mode: 'no-cors' // Required for Google Forms
        });
        
        return true; // no-cors returns opaque response
    } catch (error) {
        throw error;
    }
}

async function submitViaEmail(donorData) {
    // Create email content
    const subject = `New Blood Donor Registration: ${donorData.name}`;
    const body = `
New Blood Donor Registration:
------------------------------
Name: ${donorData.name}
Blood Group: ${donorData.bloodGroup}
Age: ${donorData.age}
Phone: ${donorData.phone}
District: ${donorData.district}
Location: ${donorData.location}
Timestamp: ${new Date().toLocaleString()}
------------------------------
Please add this donor to the database.
`;
    
    // Create mailto link
    const mailtoLink = `mailto:info@pkgroup.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    // Open email client
    window.open(mailtoLink, '_blank');
}

function updateTotalDonorsCount(count) {
    if (totalDonorsElement) {
        totalDonorsElement.textContent = count;
    }
}

function showLoading(show, element = document.body) {
    if (show) {
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'loading-overlay';
        loadingDiv.id = 'loadingOverlay';
        loadingDiv.innerHTML = `
            <div class="loading-spinner">
                <div class="spinner"></div>
                <p>Loading donor data...</p>
            </div>
        `;
        element.appendChild(loadingDiv);
    } else {
        const loadingDiv = document.getElementById('loadingOverlay');
        if (loadingDiv) {
            loadingDiv.remove();
        }
    }
}

function showNotification(message, type = 'success') {
    const notification = document.getElementById('bloodNotification');
    const title = document.getElementById('notificationTitle');
    const messageEl = document.getElementById('notificationMessage');
    
    // Set icon and color based on type
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };
    
    const colors = {
        success: 'linear-gradient(135deg, #2ecc71, #27ae60)',
        error: 'linear-gradient(135deg, #e74c3c, #c0392b)',
        warning: 'linear-gradient(135deg, #f39c12, #e67e22)',
        info: 'linear-gradient(135deg, #3498db, #2980b9)'
    };
    
    const titles = {
        success: 'Success!',
        error: 'Error!',
        warning: 'Warning!',
        info: 'Information'
    };
    
    notification.querySelector('i').className = `fas ${icons[type]}`;
    notification.style.background = colors[type];
    title.textContent = titles[type];
    messageEl.textContent = message;
    
    // Show notification
    notification.classList.add('show');
    
    // Auto hide after 5 seconds
    setTimeout(hideNotification, 5000);
}

function hideNotification() {
    const notification = document.getElementById('bloodNotification');
    notification.classList.remove('show');
}

// Add loading spinner CSS
const loadingStyles = document.createElement('style');
loadingStyles.textContent = `
    .loading-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(255, 255, 255, 0.9);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
        border-radius: inherit;
    }
    
    .loading-spinner {
        text-align: center;
    }
    
    .spinner {
        width: 50px;
        height: 50px;
        border: 5px solid #f3f3f3;
        border-top: 5px solid #c0392b;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin: 0 auto 15px;
    }
    
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
    
    .loading-spinner p {
        color: #c0392b;
        font-weight: 500;
    }
`;
document.head.appendChild(loadingStyles);
