const { generateFixedDistancePointsOnLine } = require("./heaversine-functions");
const fs = require("fs");
/**
 * Returns an array of coordinates (compacted) from querying the trainroutes GeoJSON containing a valid route from start to end
 * @param {*} startLat
 * @param {*} startLng
 * @param {*} endLat
 * @param {*} endLng
 * @returns
 */
function findTrainRoute(startLat, startLng, endLat, endLng) {
  let allTrainRoutes = JSON.parse(fs.readFileSync("./trainroutes.geojson"));
  allTrainRoutes = allTrainRoutes.features;
  if (allTrainRoutes.length == 0) throw new Error("No train routes found!");
  console.log("Start: ", startLat, " , ", startLng);
  console.log("End: ", endLat, " , ", endLng);

  // get all linestrings
  const lineStrings = allTrainRoutes.map((o) => {
    return {
      number: o.properties.number,
      coordinates: o.geometry.coordinates,
    };
  });

  // TODO: https://github.com/kernelshreyak/world-travel-simulator/issues/10

  // get linestring containing the start point (departure station)
  let startLS = _.find(lineStrings, (o) => {
    return _.find(o.coordinates, (c) => {
      return c[1] == startLat && c[0] == startLng;
    });
  });

  // get linestring containing the end point (arrival station)
  let endLS = _.find(lineStrings, (o) => {
    return _.find(o.coordinates, (c) => {
      return c[1] == endLat && c[0] == endLng;
    });
  });
  // console.log("startLS: ",startLS);
  // console.log("endLS: ",endLS);

  if (!endLS || !startLS)
    throw new Error("No valid train route found. Message 1");

  // filter coordinates array to start from nearest point to departure/arrival point only
  function filterCoordinatesArray(coordinates_arr, pointLat, pointLng) {
    let filtered_coordinates = [];
    let found_nearest = false;

    for (const element of coordinates_arr) {
      // start only when nearest point reached (exact search)
      if (element[1] == pointLat && element[0] == pointLng) {
        filtered_coordinates.push(element);
        found_nearest = true;
        continue;
      }

      if (found_nearest) filtered_coordinates.push(element); //record all after found
    }

    return filtered_coordinates;
  }

  startLS.coordinates = filterCoordinatesArray(
    startLS.coordinates,
    startLat,
    startLng
  );
  endLS.coordinates = filterCoordinatesArray(endLS.coordinates, endLat, endLng);

  // compactify to 1D array
  const finalTrainRoute = [
    ...startLS.coordinates,
    ...endLS.coordinates.reverse(),
  ];

  if (finalTrainRoute.length === 0)
    throw new Error("No valid train route found. Message 2");
  return finalTrainRoute;
}

/**
 * Generates a fixed number of waypoints on an airline route segment(with 2 end points)
 * @param {*} routePoints (array of start and end point coordinates)
 * @param {*} waypointsCount (number of waypoints to generate)
 * @param {*} random (whether random distance apart)
 * @returns
 */
function generateAirWayPoints(
  startpointLat,
  startpointLng,
  endpointLat,
  endpointLng,
  fixedDistance = 100
) {
  let points = [];

  // generate the points at fixed distance (in kilometers) apart
  points = generateFixedDistancePointsOnLine(
    startpointLat,
    startpointLng,
    endpointLat,
    endpointLng,
    fixedDistance
  );
  //   console.log("Generated waypoints", points);

  if (points.length == 0) throw new Error("Could not generate waypoints");

  return points;
}

module.exports = {
  findTrainRoute: findTrainRoute,
  generateAirWayPoints: generateAirWayPoints,
};
