const API_KEY_OPENTRIP = "a7997d0a58msh4b970335eb34949p131620jsn4b16c0e4c9c4";
const API_KEY_AMADEUS = "hZscHuKA9cIEcrHu2AsteLvHvLryAfp0";
const baseUrl = "https://opentripmap-places-v1.p.rapidapi.com/en/places/";


async function convertToJson(res) {
  const respond = await res.json();
  if (res.ok) {
    return respond;
  } else {
    throw { name: "servicesError", message: respond };
  };
}

export function getParam() {
  const params = new URLSearchParams(window.location.search);
  const query = params.get("place");
  return query;
  
}

export async function getImg(place) {
  // wikimedia API
  const url = `https://en.wikipedia.org/api/rest_v1/page/media-list/${encodeURIComponent(place)}`;
    
    try {
        const response = await fetch(url);
        const data = await convertToJson(response);
        
        // 1. Filtrar imágenes válidas y extraer nombres de archivo
        const imageFiles = data.items
            .filter(item => item.type === "image" && !item.title.startsWith("File:Commons-logo"))
            .map(item => item.title.replace("File:", ""));
        
        if (imageFiles.length === 0) return [];
        
        // 2. Generar URLs directas en WebP con tamaño optimizado (ej: 800px de ancho)
        const optimizedUrls = imageFiles.slice(0, 8).map(file => 
            `https://commons.wikimedia.org/w/thumb.php?f=${encodeURIComponent(file)}&w=800&format=webp`
        );
        
        return optimizedUrls;
    } catch (error) {
        console.error("Error fetching images:", error);
        return [];
    }
}

export async function getCoords(place) {
  const resOSM = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(place)}&addressdetails=0&accept-language=en`
  );
  const dataOSM = await convertToJson(resOSM);
    
  if (dataOSM.length === 0) {
    document.querySelector(".place-details").innerHTML = "<p>Place not found.</p>";
    return;
  }
  // Pick the first result
  const result = dataOSM[0];
  const { lat, lon, display_name } = result;
  return { lat, lon, display_name };
}

// function initMap() {
//   const map = L.map("poi-map").setView(MAP_CENTER, 13);
//   L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
//   return map;
// }
// initMap();

// async function fetchPOIs() {
//   const radius = 5000;
//   const url = `${baseUrl}radius?radius=${radius}&lon=${MAP_CENTER[1]}&lat=${MAP_CENTER[0]}&apikey=${API_KEY_OPENTRIP}`;
  
//   try {
//       const response = await fetch(url);
//       const data = await convertToJson(response);
//       return data.features || [];
//   } catch (error) {
//       console.error("Error fetching POIs:", error);
//       return [];
//   }
// }

// async function renderPOIs() {
//   const map = initMap();
//   const pois = await fetchPOIs();
//   const poiList = document.querySelector('.poi-list');
  
//   pois.forEach(poi => {
//       // Añadir marcador al mapa
//       const marker = L.marker([poi.geometry.coordinates[1], poi.geometry.coordinates[0]])
//           .addTo(map)
//           .bindPopup(poi.properties.name);
      
//       // Crear tarjeta en lista
//       const card = document.createElement('div');
//       card.className = 'poi-card';
//       card.innerHTML = `
//           <h3>${poi.properties.name}</h3>
//           <p>${poi.properties.kind || 'Punto de interés'}</p>
//           <button class="view-details" data-id="${poi.properties.xid}">Ver detalles</button>
//       `;
//       poiList.appendChild(card);
//   });
// }

// // Inicializar al cargar la página
// document.addEventListener('DOMContentLoaded', renderPOIs);





// A function to get details from the user input
async function searchDetails(city, country, data) {
  const query = `${data}, ${city}, ${country}`.trim();
  
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`;
  
  try {
      const respuesta = await fetch(url);
      if (!respuesta.ok) {
          throw new Error("Error Searching");
      }
      const datos = await respuesta.json();
      
      if (datos.length === 0) {
          console.log("Results not found");
          return null;
      }
      return datos[0];
  } catch (error) {
      console.error("Error en la búsqueda:", error);
      return null;
  }
}

export async function getDescriptions(place) {
  const resWiki = await fetch(
    `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(place)}`
  );
  const dataWiki = await resWiki.json();
  return dataWiki;
}


async function loadTemplate(path) {
    const response = await fetch(path);
    const template = await response.text();
    return template;
  }
  
export async function loadHeaderFooter() {
    const footerTemplate = await loadTemplate("./partials/footer.html");
    const headerTemplate = await loadTemplate("./partials/header.html");

    const footerElement = document.querySelector("#footer");
    const headerElement = document.querySelector("#header");

    headerElement.innerHTML = headerTemplate;
    footerElement.innerHTML = footerTemplate;
    

}

