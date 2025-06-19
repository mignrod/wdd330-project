import { loadHeaderFooter, getParam, getImg, getDescriptions, getCoords } from "./utils.mjs";

loadHeaderFooter();

const place = getParam();
const placeCapitalized = place ? place.charAt(0).toUpperCase() + place.slice(1).toLowerCase() : "";
const MAP_CENTER = await getCoords(place);
const lon = MAP_CENTER.lon;
const lat = MAP_CENTER.lat;
const radius = 2000;
const API_KEY_OPENTRIP = "a7997d0a58msh4b970335eb34949p131620jsn4b16c0e4c9c4";
const baseUrl = "https://opentripmap-places-v1.p.rapidapi.com/en/places/";
const categories = {
    "museums": "museums",
    "food": "food",
    "historic": "historic",
    "religion": "religion",
    "natural": "natural",
    "adult": "adult",
    "shops": "shops",
    "accommodations": "accommodations"
};

let selectedCategories = new Set();

function dividePlaceDetails(display_name) {
    const cleaned = display_name;
    const parts = cleaned.split(",").filter(part => part.trim() !== "");
    if (parts.length >= 2) {
        return `${parts[0].trim()}, ${parts[parts.length - 1].trim()}`;
    }
    return display_name;
}

async function getDetails(place) {
    const result = await getCoords(place);
    
    // Get Images
    if (place) {
        const viewCard = document.createElement("div");
        const cardPhoto = document.createElement("img");
        const images = await getImg(place);
        cardPhoto.src = images[0];
        cardPhoto.alt = `${place} Photo`;
        cardPhoto.setAttribute("loading", "lazy");
        cardPhoto.className = "cardPhoto";
        viewCard.className = "place-details"
        const placeCard = document.querySelector(".country-view");
        placeCard.appendChild(cardPhoto);
        placeCard.appendChild(viewCard);

    } else {
        document.querySelector(".country-view").innerHTML = "<p>Place not found.</p>";
    }
        
    try {
        const wiki = await getDescriptions(place);
        const reference = dividePlaceDetails(result.display_name);
        
        let html = `
            <h2><strong>${placeCapitalized}</strong><span class="heart-icon" id="heart-icon" data-place-id="${place}">
            &#9825;
            </span></h2>
            <p><strong>Name:</strong> ${reference}</p>
            <p><strong>Coords:</strong> Lat ${lat}, Lon ${lon}</p>
        `;

        if (wiki.extract) {
            html += `<p><strong>Description:</strong> ${wiki.extract}</p>`;
        }

        document.querySelector(".place-details").innerHTML = html;
    } catch (error) {
        console.error("Error getting data from Wikipedia:", error);
        document.querySelector(".country-view").innerHTML +=
            "<p>Aditional data not found.</p>";
    }
}
getDetails(place);

// Create the slideshow structure
function createSlideShow() {
    const elements = `
        <div class="places-header"><h2>Places and Historic Photos of ${placeCapitalized}</h2></div>
        <div class="slideshow-container">
            <button class="slide-btn prev" aria-label="Prev">&#10094;</button>
            <button class="slide-btn next" aria-label="Next">&#10095;</button>
            <div class="slides-wrapper"></div>
        </div>
    `;
    const placesBox = document.querySelector(".places");
    if (placesBox) {
        placesBox.innerHTML = elements;
    } else {
        console.error("Error: Places box not found");
    }
}

async function initSlideshow() {
    // Create structure
    createSlideShow();

    const slidesWrapper = document.querySelector(".slides-wrapper");
    const prevBtn = document.querySelector(".prev");
    const nextBtn = document.querySelector(".next");
    
    if (!slidesWrapper || !prevBtn || !nextBtn) {
        console.error("Error: Slideshow elements not found");
        return;
    }
    let currentIndex = 0;
    let isAnimated = false;

    // Load images with error handling
    let images = [];
    try {
        const imgUrls = await getImg(place);
        images = imgUrls.map(url => ({
            url: url,
            alt: `${place} Photo` || "Placeholder"
        }));
        
    } catch (error) {
        console.error("Error loading images:", error);
        images = [{
            url: "https://via.placeholder.com/800x400?text=Placeholder",
            alt: "Placeholder"
        }];
    }
    function renderSlides() {
        slidesWrapper.innerHTML = images.map((img, index) => `
            <div class="slide ${index === 0 ? "active" : ""}">
                <img src="${img.url}" alt="${img.alt}" class="slide-img">
            </div>
        `).join("");
    }
    async function goToSlide(newIndex) {
        if (isAnimated) return;
        isAnimated = true;
        
        const slides = document.querySelectorAll(".slide");
        const totalSlides = slides.length;
        if (totalSlides === 0) {
            isAnimated = false;
            return;
        }
        
        currentIndex = (newIndex + totalSlides) % totalSlides;
        
        const currentSlide = document.querySelector(".slide.active");
        const nextSlide = slides[currentIndex];
        
        if (currentSlide) {
            currentSlide.style.opacity = "0";
            await new Promise(resolve => setTimeout(resolve, 500));
            currentSlide.classList.remove("active");
        }
        
        nextSlide.style.opacity = "1";
        nextSlide.classList.add("active");
        
        isAnimated = false;
    }

    // Events and rendering
    renderSlides();
    prevBtn.addEventListener("click", () => goToSlide(currentIndex - 1));
    nextBtn.addEventListener("click", () => goToSlide(currentIndex + 1));
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initSlideshow);
} else {
    initSlideshow();
}


                    /*** Points of Interest Section ***/
//hasta aqui esta funcionando a la perfeccion guardar este codigo para que no se pierda

const poiSection = document.querySelector(".poi");
const poiElements = `
    <div class="poi-controls">
        <h2>Points of Interest in ${placeCapitalized}</h2>
        <div class="categories">
            <h3>Filter by Category:</h3>
            <div class="category-buttons"></div>
        </div>
    </div>
    <div class="poi-container">
        <div id="poi-map"></div>
        <div class="place-details"></div>
    </div>
    
    <!-- Añade esto para el modal -->
    <div class="poi-modal" id="poiModal">
        <div class="modal-content">
            <span class="close-modal">&times;</span>
            <div id="poi-modal-content"></div>
        </div>
    </div>
`;

let map = null;
let currentMarkers = [];
let mapInitialized = false;

function renderCategoryButtons() {
    const container = document.querySelector(".category-buttons");
    if (!container) return;
    
    container.innerHTML = "";
    
    const allBtn = document.createElement("button");
    allBtn.className = "category-btn active";
    allBtn.textContent = "All";
    allBtn.addEventListener("click", () => {
        document.querySelectorAll(".category-btn").forEach(btn => btn.classList.remove("active"));
        allBtn.classList.add("active");
        selectedCategories.clear();
        loadPOIs();
    });
    container.appendChild(allBtn);
    
    // Category buttons
    Object.entries(categories).forEach(([key, value]) => {
        const btn = document.createElement("button");
        btn.className = "category-btn";
        btn.textContent = key.charAt(0).toUpperCase() + key.slice(1);
        btn.dataset.category = value;
        
        // Add or remove active class on click
        btn.addEventListener("click", function() {
            this.classList.toggle("active");
            
            if (this.classList.contains("active")) {
                selectedCategories.add(value);
                allBtn.classList.remove("active");
            } else {
                selectedCategories.delete(value);
            }
            
            loadPOIs();
        });
        
        container.appendChild(btn);
    });
}

// Clear markers function
function clearMarkers() {
    currentMarkers.forEach(marker => map.removeLayer(marker));
    currentMarkers = [];
}

function showMessage(msg, isError = false) {
    const detailsContainer = document.querySelector(".place-details");
    if (detailsContainer) {
        detailsContainer.innerHTML = `<p class="${isError ? "error" : ""}">${msg}</p>`;
    }
}

export async function getDetailsMap(xid, name) {
    try {
        const modalContent = document.getElementById("poi-modal-content");
        modalContent.innerHTML = `<div class="loading">Loading...</div>`;
        openModal();

        const options = {
            method: "GET",
            headers: {
                "X-RapidAPI-Key": API_KEY_OPENTRIP,
                "X-RapidAPI-Host": "opentripmap-places-v1.p.rapidapi.com"
            }
        };

        const response = await fetch(`${baseUrl}xid/${xid}`, options);
        
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const data = await response.json(); 
        
        renderDetails(data);

    } catch (error) {
        console.error("Error:", error);
        document.getElementById("poi-modal-content").innerHTML = `
            <div class="error">Error loading data: ${error.message}</div>
        `;
    }
}

function openModal() {
    const modal = document.getElementById("poiModal");
    if (modal) {
        modal.style.display = "block";
        document.body.style.overflow = "hidden";
    }
}

// Render details
function renderDetails(place) {
    let html = `
        <h3>${place.name || "No name available"}</h3>
        ${place.kinds ? `<p class="categories">${place.kinds.split(",").join(" • ")}</p>` : ""}
    `;
    
    // Imagen si está disponible
    if (place.preview?.source) {
        html += `
            <div class="image-container">
                <img src="${place.preview.source}" 
                     alt="${place.name}" 
                     class="preview-image"
                     onerror="this.style.display="none"">
                ${place.preview.width && place.preview.height ? 
                  `<span class="image-dimensions">${place.preview.width}×${place.preview.height}px</span>` : ""}
            </div>
        `;
    }
    
    // Descripción de Wikipedia
    if (place.wikipedia_extracts?.text) {
        html += `<div class="description">${place.wikipedia_extracts.text}</div>`;
    }
    
    // Enlaces externos
    html += `<div class="external-links">`;
    
    if (place.wikidata) {
        html += `<a href="https://www.wikidata.org/wiki/${place.wikidata}" target="_blank" class="external-link">View on Wikidata</a>`;
    }
    
    if (place.wikipedia) {
        html += `<a href="${place.wikipedia}" target="_blank" class="external-link">View on Wikipedia</a>`;
    }
    
    if (place.otm) {
        html += `<a href="${place.otm}" target="_blank" class="external-link">View on OpenTripMap</a>`;
    }
    
    html += `</div>`;
    
    document.getElementById("poi-modal-content").innerHTML = html;
}

// Load points of interest
async function loadPOIs() {
    try {
        // showMessage("Loading points of interest...");
        clearMarkers();
        
        const kindsParam = selectedCategories.size > 0 ?
            `&kinds=${Array.from(selectedCategories).join(",")}` : "";
        
        const options = {
            method: "GET",
            headers: {
                "X-RapidAPI-Key": API_KEY_OPENTRIP,
                "X-RapidAPI-Host": "opentripmap-places-v1.p.rapidapi.com"
            }
        };
        
        const response = await fetch(
            `${baseUrl}radius?radius=${radius}&lon=${lon}&lat=${lat}${kindsParam}`,
            options
        );
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();

        if (data.features && data.features.length > 0) {
            data.features.forEach(feature => {
                const { coordinates } = feature.geometry;
                const { name, kinds, xid } = feature.properties;
                
                const marker = L.marker([coordinates[1], coordinates[0]])
                    .addTo(map)
                    .bindPopup(`
                        <div class="poi-popup">
                            <strong>${name || "Point of Interest"}</strong><br>
                            <small>${kinds ? kinds.split(",").join(", ") : ""}</small><br>
                            <button class="view-details" data-id="${xid}">View Details</button>
                        </div>
                    `);
                
                currentMarkers.push(marker);
                
                marker.on("popupopen", () => {
                    document.querySelector(`.view-details[data-id="${xid}"]`)
                        .addEventListener("click", () => getDetailsMap(xid, name));
                });
            });
            showMessage("");
        } else {
            showMessage("No points of interest found with current filters.");
        }
    } catch (error) {
        console.error("Error loading POIs:", error);
        showMessage("Error loading points of interest. Please try again later.", true);
    }
}

// Inicialize the map
function initMap() {
    if (mapInitialized) return;
    
    const mapContainer = document.getElementById("poi-map");
    if (!mapContainer) {
        console.error("Map container not found");
        return;
    }
    
    if (map) {
        map.remove();
        map = null;
        currentMarkers = [];
    }
    
    map = L.map(mapContainer).setView([lat, lon], 14);
    
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    L.marker([lat, lon]).addTo(map)
        .bindPopup(`${placeCapitalized} Center`)
        .openPopup();

    L.circle([lat, lon], {
        color: "#149CB6",
        fillColor: "#356EC9",
        fillOpacity: 0.1,
        radius: 1500
    }).addTo(map);

    renderCategoryButtons();
    loadPOIs();
    
    mapInitialized = true;
    
    // Adjust map size on window resize
    window.addEventListener("resize", () => {
        map.invalidateSize();
    });
}

function preparePOISection() {
    if (!poiSection) {
        console.error("POI section not found");
        return;
    }
    
    poiSection.innerHTML = "";
    poiSection.innerHTML = poiElements;
    mapInitialized = false;

    const closeModal = document.querySelector(".close-modal");
    if (closeModal) {
        closeModal.addEventListener("click", () => {
            document.getElementById("poiModal").style.display = "none";
            document.body.style.overflow = "auto";
        });
    }
        
    // Cerrar modal al hacer clic fuera del contenido
    document.getElementById("poiModal")?.addEventListener("click", function (e) {
        if (e.target === this) {
            this.style.display = "none";
            document.body.style.overflow = "auto";
        }
    });
}

preparePOISection();
initMap();

// Add favorite (heart icon) toggle functionality
document.addEventListener("click", function (event) {
    if (event.target.closest(".add-destiny")) return;
    if (event.target.id === "heart-icon") {
        event.target.classList.toggle("favorite");

    }

    // Save favorite places on a list in the localStorage
    const placeId = event.target.dataset.placeId;
    const placeData = {
        id: placeId,
        name: placeCapitalized, 
        lat: lat || null,
        lon: lon || null
      };
      
      let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
      
      if (event.target.classList.contains("favorite")) {
        
        const exists = favorites.some(fav => fav.id === placeId);
        
        if (!exists) {
          favorites.push(placeData); 
          localStorage.setItem("favorites", JSON.stringify(favorites));
          showPopup(`${placeCapitalized} added to favorites.`);
        }
      } else {
        // Eliminar por 'id'
        favorites = favorites.filter(fav => fav.id !== placeId);
        localStorage.setItem("favorites", JSON.stringify(favorites));
        showPopup(`${placeCapitalized} removed from favorites.`);
    }
    

    function showPopup(message) {
        let popup = document.createElement("div");
        popup.className = "favorite-popup";
        popup.textContent = message;
        document.body.appendChild(popup);
        setTimeout(() => {
            popup.classList.add("show");
        }, 10);
        setTimeout(() => {
            popup.classList.remove("show");
            setTimeout(() => popup.remove(), 300);
        }, 1500);
    }

});
