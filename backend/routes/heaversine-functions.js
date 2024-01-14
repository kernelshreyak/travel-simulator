// Function to calculate the distance between two coordinates using Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Function to generate points that are fixed distance apart on a line segment
function generateFixedDistancePointsOnLine(lat1, lon1, lat2, lon2, distance) {
  lat1 = parseFloat(lat1);
  lon1 = parseFloat(lon1);
  lat2 = parseFloat(lat2);
  lon2 = parseFloat(lon2);
  const points = [];
  const totalDistance = calculateDistance(lat1, lon1, lat2, lon2);

  for (let d = 0; d <= totalDistance; d += distance) {
    const fraction = d / totalDistance;
    const lat = lat1 + fraction * (lat2 - lat1);
    const lon = lon1 + fraction * (lon2 - lon1);
    points.push([lon, lat]);
  }

  return points;
}

module.exports = {
  calculateDistance: calculateDistance,
  generateFixedDistancePointsOnLine: generateFixedDistancePointsOnLine,
};
