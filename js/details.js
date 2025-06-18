import { searchHotelsByCity } from "../js/amadeus.mjs";
import { loadHeaderFooter } from "./utils.mjs";

loadHeaderFooter();

document.addEventListener("DOMContentLoaded", async () => {
  // Get place from url
  const urlParams = new URLSearchParams(window.location.search);
  const place = urlParams.get('place');
  
  if (place) {
    // SHow place title
    document.getElementById("place-title").textContent = `Hotels in ${place}`;
    
    // Buscar hoteles
    const hotels = await searchHotelsByCity(place);
    displayHotels(hotels);
  }
});

function displayHotels(hotels) {
  const container = document.getElementById("hotels-container");
  container.innerHTML = "";
  
  if (hotels.length === 0) {
    container.innerHTML = "<p>Hotels not found.</p>";
    return;
  }
  
  hotels.forEach(hotel => {
    const hotelElement = document.createElement("div");
    hotelElement.className = "hotel-card";
    hotelElement.innerHTML = `
      <h3>${hotel.name || "No name available"}</h3>
      <p><strong>Address:</strong> ${hotel.address?.lines?.join(", ") || "No Address available"}</p>
      <p><strong>Phone:</strong> ${hotel.contact?.phone || "No Phone available"}</p>
      ${hotel.amenities ? `<p><strong>Services:</strong> ${hotel.amenities.join(", ")}</p>` : ""}
    `;
    container.appendChild(hotelElement);
  });
}
