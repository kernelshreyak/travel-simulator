export const config = {
  API_URL: "http://localhost:8000/api",
  AUTH0_CLIENTID: "hRGzWQKeaYbGv4XZcGo7m471ZU9Is9jl",
  mapVehicleTypes: {
    INTRACITY: {name: "Intra-City",speed: "Slow",costperkm: 10},
    INTERCITY: {name: "Inter-City",speed: "Fast",costperkm: 15},
    INTERSTATE: {name: "Intra City",speed: "Very Fast",costperkm: 40},
    "INTERCOUNTY - AIRLINE": {name: "Inter-Country Airplane",speed: "Fastest",costperkm: 100},
  }
}