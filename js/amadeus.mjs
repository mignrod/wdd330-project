const AMADEUS_API_KEY = "hZscHuKA9cIEcrHu2AsteLvHvLryAfp0";
const AMADEUS_API_SECRET = "AL8ZGgyawQomPkTz";

let accessToken = "";
let tokenExpiration = 0;

// Token access function
async function getAmadeusToken() {
  const now = Math.floor(Date.now() / 1000);
  
  if (accessToken && now < tokenExpiration) {
    return accessToken;
  }

  const response = await fetch("https://test.api.amadeus.com/v1/security/oauth2/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: `grant_type=client_credentials&client_id=${encodeURIComponent(AMADEUS_API_KEY)}&client_secret=${encodeURIComponent(AMADEUS_API_SECRET)}`
  });

  const data = await response.json();
  accessToken = data.access_token;
  tokenExpiration = now + data.expires_in - 300;
  
  return accessToken;
}

// Search hotels by city name
export async function searchHotelsByCity(cityName, limit = 5) {
  try {
    const token = await getAmadeusToken();
    
    // ATA code from city name
    const cityCodeResponse = await fetch(`https://test.api.amadeus.com/v1/reference-data/locations?subType=CITY&keyword=${encodeURIComponent(cityName)}`, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });
    
    const cityData = await cityCodeResponse.json();
    if (!cityData.data || cityData.data.length === 0) {
      throw new Error("City not found.");
    }
    
    const cityCode = cityData.data[0].iataCode;
    
    const hotelsResponse = await fetch(`https://test.api.amadeus.com/v1/reference-data/locations/hotels/by-city?cityCode=${cityCode}`, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });
    
      const hotelsData = await hotelsResponse.json();
      console.log(hotelsData);
    return hotelsData.data ? hotelsData.data.slice(0, limit) : [];
    
  } catch (error) {
    console.error("Error searching hotels:", error);
    return [];
  }
}

export async function searchFlights(originCity, destinationCity, departureDate, returnDate = null, adults = 1) {
    try {
      const token = await getAmadeusToken();
      
      //  IATA codes
      const [originCode, destinationCode] = await Promise.all([
        getCityIataCode(originCity, token),
        getCityIataCode(destinationCity, token)
      ]);
      
      if (!originCode || !destinationCode) {
        throw new Error("Error");
      }
      
      //  Url
      let url = `https://test.api.amadeus.com/v2/shopping/flight-offers?originLocationCode=${originCode}&destinationLocationCode=${destinationCode}&departureDate=${departureDate}&adults=${adults}`;
      
      if (returnDate) {
        url += `&returnDate=${returnDate}`;
      }
      
      // Make request
      const response = await fetch(url, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      
      const flightData = await response.json();
      
      return processFlightData(flightData.data || []);
      
    } catch (error) {
      console.error("Error searching flights:", error);
      return [];
    }
  }
  
  async function getCityIataCode(cityName, token) {
    const response = await fetch(`https://test.api.amadeus.com/v1/reference-data/locations?subType=CITY,AIRPORT&keyword=${encodeURIComponent(cityName)}`, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    return data.data?.[0]?.iataCode || null;
  }

  function processFlightData(flights) {
    return flights.map(flight => {
      const itineraries = flight.itineraries.map(it => ({
        duration: it.duration,
        segments: it.segments.map(seg => ({
          departure: {
            airport: seg.departure.iataCode,
            time: seg.departure.at
          },
          arrival: {
            airport: seg.arrival.iataCode,
            time: seg.arrival.at
          },
          airline: seg.carrierCode,
          flightNumber: seg.number
        }))
      }));
      
      return {
        price: {
          total: flight.price.total,
          currency: flight.price.currency
        },
        itineraries,
        lastTicketingDate: flight.lastTicketingDate,
        numberOfBookableSeats: flight.numberOfBookableSeats
      };
    });
}