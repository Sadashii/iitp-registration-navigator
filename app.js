// IIT Patna Registration Navigator - Core Application Logic

// Helper to derive clean URL-friendly IDs from location names
function deriveId(name) {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

// 1. Dynamic Card Rendering
function renderCards(dataList) {
    const cardsContainer = document.getElementById("cardsContainer");
    cardsContainer.innerHTML = "";
    
    dataList.forEach(loc => {
        const id = deriveId(loc.name);
        const card = document.createElement("div");
        card.className = `location-card`;
        card.id = `card-${id}`;
        card.setAttribute("onclick", `highlightCard('${id}')`);
        
        // Generate Maps URL
        const gmapsUrl = `https://www.google.com/maps/search/?api=1&query=${loc.lat},${loc.lng}`;

        const roomFloorHtml = (loc.room && loc.floor) ? `
            <div class="detail-item">
                <i class="fa-solid fa-door-open"></i>
                <span>Room: ${loc.room} Floor: ${loc.floor}</span>
            </div>
        ` : '';

        card.innerHTML = `
            <div class="card-top">
                <h3>${loc.name}</h3>
                <i class="fa-solid fa-chevron-down accordion-icon"></i>
            </div>
            <div class="card-details">
                <div class="detail-item">
                    <i class="fa-solid fa-building"></i>
                    <span>${loc.building}</span>
                </div>
                ${roomFloorHtml}
            </div>
            <div class="card-actions">
                <a class="card-btn card-btn-primary" href="${gmapsUrl}" target="_blank" onclick="event.stopPropagation();" rel="noopener noreferrer">
                    <i class="fa-solid fa-map-location-dot"></i> Get directions on Google Maps
                </a>
            </div>
        `;
        cardsContainer.appendChild(card);
    });
}

// 2. Expand/Collapse Card Accordion Toggle
function highlightCard(id) {
    const selectedCard = document.getElementById(`card-${id}`);
    const isAlreadyActive = selectedCard && selectedCard.classList.contains("active");

    // Reset all card active classes
    const allCards = document.querySelectorAll(".location-card");
    allCards.forEach(c => c.classList.remove("active"));

    // If it was already expanded, collapse it
    if (isAlreadyActive) {
        return;
    }

    // Otherwise expand the selected card
    if (selectedCard) {
        selectedCard.classList.add("active");
        selectedCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

// 3. Document Checklist local-storage tracking
function initChecklist() {
    const checkboxes = document.querySelectorAll('.checkbox-container input[type="checkbox"]');
    
    checkboxes.forEach(checkbox => {
        const isChecked = localStorage.getItem(checkbox.id) === 'true';
        checkbox.checked = isChecked;
        
        checkbox.addEventListener('change', () => {
            localStorage.setItem(checkbox.id, checkbox.checked);
            updateChecklistProgress();
        });
    });

    updateChecklistProgress();
}

function updateChecklistProgress() {
    const checkboxes = document.querySelectorAll('.checkbox-container input[type="checkbox"]');
    const checkedCount = Array.from(checkboxes).filter(cb => cb.checked).length;
    const totalCount = checkboxes.length;
    
    const progressPercent = totalCount > 0 ? (checkedCount / totalCount) * 100 : 0;
    
    document.getElementById("checklistProgress").textContent = `${checkedCount} of ${totalCount} completed`;
    document.getElementById("progressBar").style.width = `${progressPercent}%`;
}

// 4. Visitor Counter API Integration
async function initVisitorCounter() {
    const namespace = "iitp-registration-navigator";
    const key = "visits";
    const hostname = window.location.hostname;
    
    // Determine whether to increment (production) or just read (localhost development)
    const isLocalhost = hostname === "localhost" || hostname === "127.0.0.1" || hostname === "";
    const endpoint = isLocalhost 
        ? `https://api.counterapi.dev/v1/${namespace}/${key}`
        : `https://api.counterapi.dev/v1/${namespace}/${key}/up`;
        
    try {
        const response = await fetch(endpoint);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const data = await response.json();
        const container = document.getElementById("visitorCounter");
        const countSpan = document.getElementById("visitorCount");
        
        if (container && countSpan && typeof data.value !== "undefined") {
            countSpan.textContent = data.value.toLocaleString();
            container.style.display = "inline-flex"; // Show only after loading successfully
        }
    } catch (error) {
        console.warn("Could not load or update visitor count:", error);
        // Fail silently and leave the visitor-counter container hidden
    }
}

// 5. Initial Setup and Event Listeners
document.addEventListener("DOMContentLoaded", () => {
    renderCards(locations);
    initChecklist();
    initVisitorCounter();
});
