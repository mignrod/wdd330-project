import { getImg, loadHeaderFooter } from "./utils.mjs";

const API_KEY = "a7997d0a58msh4b970335eb34949p131620jsn4b16c0e4c9c4";
const baseUrl = "https://opentripmap-places-v1.p.rapidapi.com/en/places/";
const options = {
    method: 'GET',
    headers: {
        'x-rapidapi-key': API_KEY,
        'x-rapidapi-host': 'opentripmap-places-v1.p.rapidapi.com'
    }
};

loadHeaderFooter();

async function getRecommendedCity() {
    try {
        const res = await fetch("json/recommended.json");
        if (!res.ok) {
            throw new Error("Failed to fetch recommended.json");
        }
        const data = await res.json();
        let cities = Object.values(data);
        if (!Array.isArray(cities)) {
            throw new Error("JSON data does not contain a valid array");
        }
        // Taking 12 element randomly
        cities = cities.sort(() => 0.5 - Math.random()).slice(0, 12);
        const cardsContainer = document.getElementById("cards");
        if (cardsContainer) {
            cardsContainer.innerHTML = "";
            cities.forEach(cityObj => {
                const card = document.createElement("div");
                card.className = "city-card";
                card.innerHTML = `
                    <img id="photoCountry">
                    <h3>${cityObj.city || "City Unknow"}</h3>
                    <p><strong>Country:</strong> ${cityObj.country || "Unknow"}</p>
                    <p>${cityObj.xid}</p>
                    <button id="fav"><img class="plus-icon" src="images/plus.svg" alt="Add" loading="lazy"> Add to Favorites</button>
                `;
                const a = cityObj.city;
                getImg(a).then(imgElement => {
                    if (imgElement) {
                        const photo = card.querySelector("#photoCountry");
                        photo.src = imgElement;
                    }
                }).catch(err => {
                    console.error("Error loading image:", err);
                });
                
                cardsContainer.appendChild(card);
            });
        }
    } catch (error) {
        console.error(error);
    }
}
getRecommendedCity();

document.getElementById("search-button").addEventListener("click", (e) => {
    e.preventDefault();
    const place = document.querySelector(".search-container input[type='text']").value.trim();
    if (place) {
        window.location.href = `./poi/poi.html?place=${encodeURIComponent(place)}`;
        
    }
});