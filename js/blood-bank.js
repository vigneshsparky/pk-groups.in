// Blood Bank JavaScript

// Tamil Nadu Districts
const tamilNaduDistricts = [
    "Ariyalur", "Chengalpattu", "Chennai", "Coimbatore", "Cuddalore",
    "Dharmapuri", "Dindigul", "Erode", "Kallakurichi", "Kancheepum",
    "Kanniyakumari", "Karur", "Krishnagiri", "Madurai", "Mayiladuthurai",
    "Nagapattinam", "Namakkal", "Nilgiris", "Perambalur", "Pudukkottai",
    "Ramanathapuram", "Ranipet", "Salem", "Sivaganga", "Tenkasi",
    "Thanjavur", "Theni", "Thiruvallur", "Thiruvarur", "Thoothukudi",
    "Tiruchirappalli", "Tirunelveli", "Tirupathur", "Tiruppur", "Tiruvannamalai",
    "Vellore", "Villupuram", "Virudhunagar"
];

// Blood groups
const bloodGroups = [
    "A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"
];

// Sample initial donors (can be expanded)
let bloodDonors = [
    {
        id: 1,
        name: "Vignesh",
        bloodGroup: "AB+",
        age: 20,
        phone: "9786206210",
        district: "Thanjavur",
        location: "Central Bus Stand",
        registeredDate: "2024-01-15",
        lastDonated: "2024-01-10"
    }
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
});

function initializeApp() {
    // Populate district dropdowns
    populateDistricts(searchDistrictSelect);
    populateDistricts(donorDistrictSelect);
    
    // Update total donors count
    updateTotalDonors();
    
    // Load donors from localStorage if available
    loadDonorsFromStorage();
}

function populateDistricts(selectElement) {
    // Clear existing options except first one
    while (selectElement.options.length > 1) {
        selectElement.remove(1);
    }
    
    // Add districts
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
}

function searchDonors() {
    const district = searchDistrictSelect.value;
    const bloodGroup = searchBloodGroupSelect.value;
    
    if (!district || !bloodGroup) {
        showNotification('Please select both district and blood group', 'warning');
        return;
    }
    
    // Filter donors
    const filteredDonors = bloodDonors.filter(donor => 
        donor.district.toLowerCase() === district.toLowerCase() && 
        donor.bloodGroup === bloodGroup
    );
    
    displaySearchResults(filteredDonors, district, bloodGroup);
}

function displaySearchResults(donors, district, bloodGroup) {
    resultsContainer.innerHTML = '';
    
    if (donors.length === 0) {
        resultsContainer.innerHTML = `
            <div class="no-results">
                <i class="fas fa-exclamation-circle" style="font-size: 48px; color: #ff6b6b; margin-bottom: 20px;"></i>
                <h3>No donors found</h3>
                <p>No registered donors found for ${bloodGroup} blood group in ${district} district.</p>
                <p>Please check back later or register as a donor.</p>
            </div>
        `;
        return;
    }
    
    const resultsTitle = document.createElement('h3');
    resultsTitle.textContent = `Found ${donors.length} donor(s) for ${bloodGroup} in ${district}`;
    resultsContainer.appendChild(resultsTitle);
    
    donors.forEach(donor => {
        const donorCard = createDonorCard(donor);
        resultsContainer.appendChild(donorCard);
    });
}

function createDonorCard(donor) {
    const card = document.createElement('div');
    card.className = 'donor-card';
    
    const donorInfo = document.createElement('div');
    donorInfo.className = 'donor-info';
    
    donorInfo.innerHTML = `
        <h4>${donor.name} <span class="blood-group">(${donor.bloodGroup})</span></h4>
        <div class="donor-details">
            <span><i class="fas fa-birthday-cake"></i> ${donor.age} years</span>
            <span><i class="fas fa-map-marker-alt"></i> ${donor.district}</span>
            <span><i class="fas fa-location-dot"></i> ${donor.location || 'Not specified'}</span>
            <span><i class="fas fa-calendar-alt"></i> Last donated: ${donor.lastDonated || 'Not available'}</span>
        </div>
    `;
    
    const contactBtn = document.createElement('button');
    contactBtn.className = 'contact-btn';
    contactBtn.innerHTML = `<i class="fas fa-phone"></i> Contact Donor`;
    contactBtn.onclick = () => contactDonor(donor);
    
    card.appendChild(donorInfo);
    card.appendChild(contactBtn);
    
    return card;
}

function contactDonor(donor) {
    // Create a temporary contact display
    const contactInfo = document.createElement('div');
    contactInfo.className = 'contact-info-modal';
    contactInfo.innerHTML = `
        <div style="background: white; padding: 20px; border-radius: 10px; text-align: center;">
            <h3 style="color: #c0392b;">Contact Information</h3>
            <p><strong>Donor:</strong> ${donor.name}</p>
            <p><strong>Blood Group:</strong> ${donor.bloodGroup}</p>
            <p><strong>Phone:</strong> ${donor.phone}</p>
            <p><strong>District:</strong> ${donor.district}</p>
            <div style="margin-top: 20px;">
                <a href="tel:${donor.phone}" class="btn" style="background: #c0392b; color: white; padding: 10px 20px; margin-right: 10px;">
                    <i class="fas fa-phone"></i> Call Now
                </a>
                <a href="https://wa.me/91${donor.phone}?text=Hi%20${encodeURIComponent(donor.name)}%2C%20I%20need%20blood%20donation%20for%20${donor.bloodGroup}%20blood%20group."
                   target="_blank" class="btn" style="background: #25D366; color: white; padding: 10px 20px;">
                    <i class="fab fa-whatsapp"></i> WhatsApp
                </a>
            </div>
            <p style="margin-top: 15px; font-size: 12px; color: #666;">
                <i class="fas fa-exclamation-circle"></i> Please be respectful and explain your emergency clearly.
            </p>
        </div>
    `;
    
    // Show as alert for simplicity
    alert(`Donor Contact Information:\n\nName: ${donor.name}\nBlood Group: ${donor.bloodGroup}\nPhone: ${donor.phone}\nDistrict: ${donor.district}\n\nPlease call only if you have a genuine emergency.`);
}

function registerDonor(e) {
    e.preventDefault();
    
    // Get form values
    const name = document.getElementById('donorName').value.trim();
    const age = document.getElementById('donorAge').value;
    const bloodGroup = donorBloodGroupSelect.value;
    const phone = document.getElementById('donorPhone').value.trim();
    const district = donorDistrictSelect.value;
    const location = document.getElementById('donorLocation').value.trim();
    
    // Validate phone number
    if (!/^[0-9]{10}$/.test(phone)) {
        showNotification('Please enter a valid 10-digit phone number', 'error');
        return;
    }
    
    // Validate age
    if (age < 18 || age > 65) {
        showNotification('Age must be between 18 and 65 years', 'error');
        return;
    }
    
    // Check if donor already exists (by phone number)
    const existingDonor = bloodDonors.find(donor => donor.phone === phone);
    if (existingDonor) {
        showNotification('This phone number is already registered as a donor', 'warning');
        return;
    }
    
    // Create new donor object
    const newDonor = {
        id: bloodDonors.length + 1,
        name: name,
        bloodGroup: bloodGroup,
        age: parseInt(age),
        phone: phone,
        district: district,
        location: location || district,
        registeredDate: new Date().toISOString().split('T')[0],
        lastDonated: null
    };
    
    // Add to donors array
    bloodDonors.push(newDonor);
    
    // Save to localStorage
    saveDonorsToStorage();
    
    // Update total donors
    updateTotalDonors();
    
    // Show success message
    showNotification(`Thank you ${name}! You are now registered as a blood donor.`, 'success');
    
    // Reset form
    donorForm.reset();
    
    // If someone is searching for this blood group/district, update results
    if (searchDistrictSelect.value === district && searchBloodGroupSelect.value === bloodGroup) {
        searchDonors();
    }
}

function saveDonorsToStorage() {
    try {
        localStorage.setItem('pkBloodDonors', JSON.stringify(bloodDonors));
    } catch (e) {
        console.error('Error saving to localStorage:', e);
    }
}

function loadDonorsFromStorage() {
    try {
        const storedDonors = localStorage.getItem('pkBloodDonors');
        if (storedDonors) {
            bloodDonors = JSON.parse(storedDonors);
            updateTotalDonors();
        }
    } catch (e) {
        console.error('Error loading from localStorage:', e);
    }
}

function updateTotalDonors() {
    if (totalDonorsElement) {
        totalDonorsElement.textContent = bloodDonors.length;
    }
}

function showNotification(message, type = 'success') {
    const notification = document.getElementById('bloodNotification');
    const title = document.getElementById('notificationTitle');
    const messageEl = document.getElementById('notificationMessage');
    
    // Set notification content based on type
    switch(type) {
        case 'success':
            title.textContent = 'Success!';
            notification.querySelector('i').className = 'fas fa-check-circle';
            notification.style.background = 'linear-gradient(135deg, #2ecc71, #27ae60)';
            break;
        case 'error':
            title.textContent = 'Error!';
            notification.querySelector('i').className = 'fas fa-exclamation-circle';
            notification.style.background = 'linear-gradient(135deg, #e74c3c, #c0392b)';
            break;
        case 'warning':
            title.textContent = 'Warning!';
            notification.querySelector('i').className = 'fas fa-exclamation-triangle';
            notification.style.background = 'linear-gradient(135deg, #f39c12, #e67e22)';
            break;
    }
    
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

// Export donors array for potential future use
window.getBloodDonors = () => bloodDonors;
window.addBloodDonor = (donor) => {
    bloodDonors.push(donor);
    saveDonorsToStorage();
    updateTotalDonors();
};