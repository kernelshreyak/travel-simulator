export const config = {
  API_URL: "https://world-travel-simulator.herokuapp.com/api",
  // API_URL: "http://localhost:8000/api",
  AUTH0_DOMAIN: "dev-jpr60ht5.us.auth0.com",
  AUTH0_CLIENTID: "s0OzlM1MElFjdjtNgq8fwVBsD2Ko3jiG",
  // APP_URL: "http://localhost:3000",
  APP_URL: "https://world-travel-simulator.vercel.app",
  mapVehicleTypes: {
    INTRACITY: {name: "Intra-City",speed: "Slow",costperkm: 10},
    INTERCITY: {name: "Inter-City",speed: "Fast",costperkm: 15},
    INTERSTATE: {name: "Intra City",speed: "Very Fast",costperkm: 40},
    "INTERCOUNTY - AIRLINE": {name: "Inter-Country Airplane",speed: "Fastest",costperkm: 100},
  }
}