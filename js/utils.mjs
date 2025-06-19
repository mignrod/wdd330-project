const API_KEY_OPENTRIP = "a7997d0a58msh4b970335eb34949p131620jsn4b16c0e4c9c4";
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
    const footerTemplate = await loadTemplate("https://mignrod.github.io/wdd330-project/partials/footer.html");
    const headerTemplate = await loadTemplate("https://mignrod.github.io/wdd330-project/partials/header.html");

    const footerElement = document.querySelector("#footer");
    const headerElement = document.querySelector("#header");

    headerElement.innerHTML = headerTemplate;
    footerElement.innerHTML = footerTemplate;
    

}

export async function getFavInfo(place) {
  if (!place) {
    console.error("No place parameter found.");
    return;
  }

  const url = `${baseUrl}geoname?name=${place}`;
  const options = {
    method: 'GET',
    headers: {
      "x-rapidapi-key": API_KEY_OPENTRIP,
      "x-rapidapi-host": "opentripmap-places-v1.p.rapidapi.com"
    }
  };

  try {
    const response = await fetch(url, options);
    const result = await response.json();
    return result;

  } catch (error) {
    console.error(error);
  } 
} 

document.addEventListener("DOMContentLoaded", () => {
  // Usamos querySelectorAll para debuggear
  const buttons = document.querySelectorAll('.add-destiny');
  console.log("Botones encontrados:", buttons.length);

  if (buttons.length > 0) {
    const button = buttons[0]; // Tomamos el primer botón
    
    // Limpiamos listeners existentes
    const newButton = button.cloneNode(true);
    button.replaceWith(newButton);
    
    newButton.addEventListener('click', function(e) {
      console.log("Click registrado en:", e.target);
      e.stopImmediatePropagation();
      
      // Redirección con validación
      const targetUrl = new URL("https://mignrod.github.io/wdd330-project/comparison/comparison.html");
      console.log("URL válida:", targetUrl.href);
      
      window.location.href = targetUrl.href;
    }, true);
  } else {
    console.error("Error: No se encontró el botón con clase 'add-destiny'");
    console.log("Clases de todos los botones en la página:",
      Array.from(document.querySelectorAll('button')).map(b => b.className));
  }
});

function initButton() {
  const button = document.querySelector(".add-destiny");
  
  if (button) {
    button.addEventListener("click", () => {
      window.location.href = "https://mignrod.github.io/wdd330-project/comparison/comparison.html";
    });
  } else {
    console.error("Botton not found...");
    setTimeout(initButton, 500); 
  }
}

document.addEventListener('DOMContentLoaded', initButton);