import { loadHeaderFooter, getParam, getImg, getDescriptions, getCoords } from "./utils.mjs";

loadHeaderFooter();

const place = getParam();
const placeCapiptalized = place ? place.charAt(0).toUpperCase() + place.slice(1).toLowerCase() : "";
const MAP_CENTER = await getCoords(place);
const lon = MAP_CENTER.lon;
const lat = MAP_CENTER.lat;


function dividePlaceDetails(display_name) {
    const cleaned = display_name;
    const parts = cleaned.split(',').filter(part => part.trim() !== '');
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
            <h2><strong>${placeCapiptalized}</strong></h2>
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
        <div class="places-header"><h2>Places and Historic Photos of ${placeCapiptalized}</h2></div>
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

    const slidesWrapper = document.querySelector('.slides-wrapper');
    const prevBtn = document.querySelector('.prev');
    const nextBtn = document.querySelector('.next');
    
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
            alt: `${place} Photo` || 'Placeholder'
        }));
        
    } catch (error) {
        console.error("Error loading images:", error);
        images = [{
            url: 'https://via.placeholder.com/800x400?text=Placeholder',
            alt: 'Placeholder'
        }];
    }
    function renderSlides() {
        slidesWrapper.innerHTML = images.map((img, index) => `
            <div class="slide ${index === 0 ? 'active' : ''}">
                <img src="${img.url}" alt="${img.alt}" class="slide-img">
            </div>
        `).join('');
    }
    async function goToSlide(newIndex) {
        if (isAnimated) return;
        isAnimated = true;
        
        const slides = document.querySelectorAll('.slide');
        const totalSlides = slides.length;
        if (totalSlides === 0) {
            isAnimated = false;
            return;
        }
        
        currentIndex = (newIndex + totalSlides) % totalSlides;
        
        const currentSlide = document.querySelector('.slide.active');
        const nextSlide = slides[currentIndex];
        
        if (currentSlide) {
            currentSlide.style.opacity = '0';
            await new Promise(resolve => setTimeout(resolve, 500));
            currentSlide.classList.remove('active');
        }
        
        nextSlide.style.opacity = '1';
        nextSlide.classList.add('active');
        
        isAnimated = false;
    }

    // Events and rendering
    renderSlides();
    prevBtn.addEventListener('click', () => goToSlide(currentIndex - 1));
    nextBtn.addEventListener('click', () => goToSlide(currentIndex + 1));
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSlideshow);
} else {
    initSlideshow();
}


                    /*** Points of Interest Section ***/
const poiSection = document.querySelector(".poi");
// const poih2 = document.createElement("h2");
// const poiMap = document.createElement("div");
// const poiList = document.createElement("div");
// poih2.textContent = `Points of Interest in ${placeCapiptalized}`;
// poiMap.className = "poi-map";
// poiMap.id = "poiMap";
// poiList.className = "poi-list";
// poiSection.appendChild(poih2);
// poiSection.appendChild(poiMap); 
// poiSection.appendChild(poiList);
