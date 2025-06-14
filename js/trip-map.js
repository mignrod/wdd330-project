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



// FUNCION CON GEOLOCALIZACION PARA OBTENER LON Y LAT............................................
// // Simple API query: get info about the Eiffel Tower (Paris)
// async function simpleApiQuery() {
//     // Obtener la geolocalización del usuario
//     const position = await new Promise((resolve, reject) => {
//         if (navigator.geolocation) {
//             navigator.geolocation.getCurrentPosition(resolve, reject);
//         } else {
//             reject(new Error("Geolocalización no soportada"));
//         }
//     });
//     const lon = position.coords.longitude;
//     const lat = position.coords.latitude;
//     try {
//         const res = await fetch(`${baseUrl}autosuggest?kinds=foods&name=don&format=json&limit=10&lon=${lon}&radius=5000&lat=${lat}`, options);
//         const data = await res.json();
//         console.log("API result:", data);
//     } catch (error) {
//         console.error("API error:", error);
//     }
// }
// simpleApiQuery();


// ESTA SECCION ME SIRVE PARA EL EXPLORE//.....................................................
// async function getPopularPlacesByCity(city, country) {
//     try {
//         // Get city coordinates from OpenTripMap Geoname API
//         const geoUrl = `https://opentripmap-places-v1.p.rapidapi.com/en/places/geoname?name=${encodeURIComponent(city)}`;
//         const geoRes = await fetch(geoUrl, options);
//         if (!geoRes.ok) throw new Error("No se pudo obtener coordenadas de la ciudad");
//         const geoData = await geoRes.json();
//         const { lat, lon } = geoData;

//         // Get popular places near the city
//         const radiusUrl = `https://opentripmap-places-v1.p.rapidapi.com/en/places/radius?radius=5000&lon=${lon}&lat=${lat}&rate=3&limit=8`;
//         const placesRes = await fetch(radiusUrl, options);
//         if (!placesRes.ok) throw new Error("No se pudieron obtener lugares populares");
//         const placesData = await placesRes.json();

//         // Mostrar resultados en el contenedor "cards"
//         const cardsContainer = document.getElementById("cards");
//         cardsContainer.innerHTML = "";
//         const placesArray = Array.isArray(placesData.features) ? placesData.features : [];
//         if (placesArray.length === 0) {
//             cardsContainer.innerHTML = "<p>No se encontraron lugares populares.</p>";
//             return;
//         }
//         placesArray.forEach(place => {
//             const name = place.properties?.name || "Sin nombre";
//             const feature = place.properties?.kinds || "Sin detalles";
//             const card = document.createElement("div");
//             card.className = "place-card";
//             card.innerHTML = `
//                 <h3>${name}</h3>
//                 <p><strong>Ciudad:</strong> ${city}</p>
//                 <p><strong>País:</strong> ${country}</p>
//                 <p><strong>Características:</strong> ${feature}</p>
//             `;
//             cardsContainer.appendChild(card);
//         });
//     } catch (error) {
//         console.error(error);
//         const cardsContainer = document.getElementById("cards");
//         if (cardsContainer) {
//             cardsContainer.innerHTML = "<p>Error al obtener los lugares. Intenta de nuevo.</p>";
//         }
//     }
// }

// // Ejemplo de uso: muestra lugares populares de París
// getPopularPlacesByCity("Paris", "France");


// const cityArray = [
//     { city: "Paris", country: "France" },
//     { city: "Rome", country: "Italy" },
//     { city: "Tokyo", country: "Japan" },
//     { city: "New York City", country: "USA" },
//     { city: "London", country: "United Kingdom" },
//     { city: "Lisbon", country: "Portugal" },
//     { city: "Caracas", country: "Venezuela" },
//     { city: "Sydney", country: "Australia" },
//     { city: "Berlin", country: "Germany" },
//     { city: "Barcelona", country: "Spain" },
//     { city: "Moscow", country: "Russia" },
//     { city: "Cairo", country: "Egypt" },
//     { city: "Cape Town", country: "South Africa" },
//     { city: "Rio de Janeiro", country: "Brazil" },
//     { city: "Toronto", country: "Canada" },
//     { city: "Bangkok", country: "Thailand" },
//     { city: "Dubai", country: "United Arab Emirates" },
//     { city: "Istanbul", country: "Turkey" },
//     { city: "Seoul", country: "South Korea" },
//     { city: "Mexico City", country: "Mexico" },
//     { city: "Athens", country: "Greece" }
// ];

async function getRecommendedCity() {
    try {
        const res = await fetch("/json/recommended.json");
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
                    <h3>${cityObj.city || "Ciudad desconocida"}</h3>
                    <p><strong>Country:</strong> ${cityObj.country || "Desconocido"}</p>
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

// Submit button functionality
// const searchBtn = document.getElementById("search-button");
// const searchInput = document.querySelector(".search-container input[type='text']");

// if (searchBtn && searchInput) {
//     searchBtn.addEventListener("click", (e) => {
//         e.preventDefault();
//         const query = searchInput.value;
//         if (query) {
//             window.location.href = `./poi/poi.html?search=${query}`;
//         } else {
//             window.location.href = "./poi/poi.html";
//         }
//     });
// }

//Option 2
document.getElementById("search-button").addEventListener("click", (e) => {
    e.preventDefault();
    const place = document.querySelector(".search-container input[type='text']").value.trim();
    if (place) {
        window.location.href = `./poi/poi.html?place=${encodeURIComponent(place)}`;
        
    }
})


// All requests made with the client will be authenticated


// getCityCoordsFromData(cityArray).then(console.log(cityArray));

// function getRecommendedCities(cityArray, count = 12) {
//     // Shuffle the array and return the first `count` cities
//     const shuffled = cityArray.slice().sort(() => 0.5 - Math.random());
//     return shuffled.slice(0, count);
// }

// // Example usage:
// getCityCoordsFromData(cityArray).then(coordsObj => {
//     // Convert the coords object to an array of city objects with coordinates
//     const citiesWithCoords = Object.entries(coordsObj)
//         .filter(([city, coords]) => coords !== null)
//         .map(([city, coords]) => ({ city, ...coords }));
//     const recommended = getRecommendedCities(citiesWithCoords);
//     console.log(recommended);
// });

// // getData(url, options);
    // const apiKey = 'a7997d0a58msh4b970335eb34949p131620jsn4b16c0e4c9c4';
    // const baseUrl = 'https://opentripmap-places-v1.p.rapidapi.com/en/places/radius';

    // // Genera coordenadas aleatorias válidas en el mundo
    // function getRandomCoords() {
    //     // Latitud: -90 a 90, Longitud: -180 a 180
    //     const lat = (Math.random() * 180 - 90).toFixed(6);
    //     const lon = (Math.random() * 360 - 180).toFixed(6);
    //     console.log(`Random coordinates generated: lat=${lat}, lon=${lon}`);
    //     return { lat, lon };
    // }

    // async function getPopularPlacesRandom() {
    //     const { lat, lon } = getRandomCoords();
    //     const url = `https://opentripmap-places-v1.p.rapidapi.com/en/places/radius?radius=5000&lon=${lon}&lat=${lat}&rate=3&limit=10`;
    //     const options = {
    //         method: 'GET',
    //         headers: {
    //             'x-rapidapi-key': apiKey,
    //             'x-rapidapi-host': 'opentripmap-places-v1.p.rapidapi.com'
    //         }
    //     };
    //     console.log(`Fetching: ${url}`);
    //     const response = await fetch(url, options);
    //     const data = await response.json();
    //     console.log('API response:', data);
    //     return data;
    // }

    // getPopularPlacesRandom().then(async places => {
    //     const cardsContainer = document.getElementById('cards');
    //     // Check if the API returned a valid 'features' array
    //     const placesArray = Array.isArray(places && places.features) ? places.features : [];
    //     cardsContainer.innerHTML = '';

    //     async function getCountry(lat, lon) {
    //         try {
    //             const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
    //             const data = await response.json();
    //             return data.address && data.address.country ? data.address.country : 'Unknown';
    //         } catch {
    //             return 'Unknown';
    //         }
    //     }

    //     if (!places || !places.features || placesArray.length === 0) {
    //         cardsContainer.innerHTML = '<p>No destinations found. Try refreshing the page.</p>';
    //         return;
    //     }

    //     for (const place of placesArray) {
    //         const name = place.properties?.name || 'Unknown';
    //         const feature = place.properties?.kinds || 'No details';
    //         const coordinates = place.geometry?.coordinates || [];
    //         const lon = coordinates[0];
    //         const lat = coordinates[1];
    //         let country = 'Unknown';
    //         if (typeof lat === 'number' && typeof lon === 'number') {
    //             country = await getCountry(lat, lon);
    //         }

    //         const card = document.createElement('div');
    //         card.className = 'place-card';
    //         card.innerHTML = `
    //             <h3>${name}</h3>
    //             <p><strong>Country:</strong> ${country}</p>
    //             <p><strong>Feature:</strong> ${feature}</p>
    //         `;
    //         cardsContainer.appendChild(card);
    //     }
    // }).catch(error => {
    //     const cardsContainer = document.getElementById('cards');
    //     cardsContainer.innerHTML = '<p>Error fetching destinations. Please try again later.</p>';
    //     console.error(error);
    // });