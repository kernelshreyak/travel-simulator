const {
  generateFixedDistancePointsOnLine,
} = require("./routes/heaversine-functions");

// Example coordinates (New York to Los Angeles)
// const startLat = 40.7128;
// const startLon = -74.006;
// const endLat = 34.0522;
// const endLon = -118.2437;

// Example coordinates (New York to Delhi)
const startLat = 40.7128;
const startLon = -74.006;
const endLat = 28.6139;
const endLon = 77.209;

// Fixed distance between points (in kilometers)
const fixedDistance = 100;

// Generate points that are fixed distance apart on the line segment
const fixedDistancePoints = generateFixedDistancePointsOnLine(
  startLat,
  startLon,
  endLat,
  endLon,
  fixedDistance
);

// Create a GeoJSON LineString object
const geoJSONLineString = {
  type: "LineString",
  coordinates: fixedDistancePoints,
};

// Print the GeoJSON LineString as a JSON string
console.log(JSON.stringify(geoJSONLineString));
