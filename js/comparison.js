import { loadHeaderFooter, getFavInfo, getImg } from "./utils.mjs";

loadHeaderFooter();

// Get favorites list from local storage
function getFavorites() {
    const favorites = localStorage.getItem("favorites");
    return favorites ? JSON.parse(favorites) : [];
}

let favoriteList = getFavorites();
console.log("Initial Favorites List:", favoriteList);

// Render the favorites list
function renderFavorites() {
    const favoritesContainer = document.getElementById("favorites-container");
    favoritesContainer.innerHTML = "";

    if (favoriteList.length === 0) {
        favoritesContainer.innerHTML = "<p>No favorites added yet.</p>";
        return;
    }

    favoriteList.forEach(favorite => {
        const favoriteItem = document.createElement("div");
        favoriteItem.className = "favorite-item";
        
        // Usamos el mismo nombre de propiedad (id en lugar de placeId)
        const itemId = favorite.id || favorite.placeId; // Compatibilidad con ambas versiones
        
        getImg(favorite.name).then(src => {
            favoriteItem.innerHTML = `
                <h1>${favorite.name}</h1>
                <p>LAT: ${favorite.lat}</p>
                <p>LON: ${favorite.lon}</p>
                <img src="${src[0]}" alt="${favorite.name}" loading="lazy">
                <button class="remove-favorite" data-id="${itemId}">Remove</button>
                <button class="planTrip" data-id="${itemId}">Plan Trip</button>
            `;
            favoritesContainer.appendChild(favoriteItem);
            
            // Añadir event listener directamente al botón recién creado
            favoriteItem.querySelector(".remove-favorite").addEventListener("click", removeFavorite);
        });
    });
}

function removeFavorite(event) {
    const itemId = event.target.dataset.id;
    
    // Filtrar usando ambas posibles propiedades (id o placeId)
    favoriteList = favoriteList.filter(favorite => 
        (favorite.id !== itemId) && (favorite.placeId !== itemId)
    );
    
    // Actualizar el localStorage
    localStorage.setItem("favorites", JSON.stringify(favoriteList));
    
    // Volver a renderizar la lista
    renderFavorites();
    
    // Mostrar notificación
    showPopup("Favorite removed");
}

function showPopup(message) {
    const popup = document.createElement("div");
    popup.className = "favorite-popup";
    popup.textContent = message;
    document.body.appendChild(popup);
    
    setTimeout(() => {
        popup.classList.add("show");
        setTimeout(() => {
            popup.classList.remove("show");
            setTimeout(() => popup.remove(), 300);
        }, 1500);
    }, 10);
}

// Render inicial
document.addEventListener("DOMContentLoaded", renderFavorites);

document.getElementById("search-button").addEventListener("click", (e) => {
    e.preventDefault();
    const place = document.querySelector(".search-container input[type='text']").value.trim();
    if (place) {
        window.location.href = `../poi/poi.html?place=${encodeURIComponent(place)}`;
        
    }
});

// Event listener for the "Plan Trip" button
document.getElementById("favorites-container").addEventListener("click", function(e) {
    if (e.target.classList.contains("planTrip")) {
        e.preventDefault();
        
        const favoriteItem = e.target.closest(".favorite-item");
        const place = favoriteItem.querySelector("h1").textContent.trim();
        window.location.href = `../comparison/details.html?place=${encodeURIComponent(place)}`;
    }
});