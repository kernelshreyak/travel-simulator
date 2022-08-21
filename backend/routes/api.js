const router = require("express").Router();

const axios = require("axios");
const _ = require("lodash");
const fs = require("fs");

function distance(lat1, lon1, lat2, lon2, unit = "K") {
    const radlat1 = Math.PI * lat1/180
    const radlat2 = Math.PI * lat2/180
    const theta = lon1-lon2
    const radtheta = Math.PI * theta/180
    let dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
    if (dist > 1) {
        dist = 1;
    }
    dist = Math.acos(dist)
    dist = dist * 180/Math.PI
    dist = dist * 60 * 1.1515
    if (unit=="K") { dist = dist * 1.609344 }
    // if (unit=="N") { dist = dist * 0.8684 }
    return dist
}

/**
 * Generates a fixed number of waypoints on an airline route segment(with 2 end points)
 * @param {*} routePoints (array of start and end point coordinates)
 * @param {*} waypointsCount (number of waypoints to generate)
 * @param {*} random (whether random distance apart)
 * @returns 
 */
function generateAirWayPoints(map,routePoints,waypointsCount,random=false){	
	let points = routePoints;

    const latlngs = routePoints.map((point) => latLng(point[1],point[0]));
    console.log("latlngs",latlngs);

    const lengths = GeoUtil.accumulatedLengths(latlngs);
    const totalLength = lengths.reduce((a, b) => a + b, 0);
    console.log("totalLength",totalLength);


	if(random){
		// generate the points at random distances apart (TODO)
	}
	else{
		// generate the points at fixed distance apart
		const interval = 50000; // 5km
        const totalPoints = Math.floor(totalLength / interval);
        
        const ratios = [];
        for (let i = 0; i <= totalPoints; i++) {
            const ratio = i / totalPoints;
            ratios.push(ratio);
        }
        console.log("ratios",ratios);

        points = ratios.map((ratio) =>
            GeoUtil.interpolateOnLine(map, latlngs, ratio)
        );
	}
    console.log("Generated waypoints",points);
	
	if(points.length == 0) throw new Error("Could not generate waypoints");
  
	return points;
}


/**
 * Returns an array of coordinates (compacted) from querying the trainroutes GeoJSON containing a valid route from start to end
 * @param {*} startLat 
 * @param {*} startLng 
 * @param {*} endLat 
 * @param {*} endLng 
 * @returns 
 */
function findTrainRoute(startLat,startLng,endLat,endLng){
	let allTrainRoutes = JSON.parse(fs.readFileSync("./trainroutes.geojson"));
	allTrainRoutes = allTrainRoutes.features;
	if(allTrainRoutes.length == 0) throw new Error("No train routes found!");
	console.log("Start: ",startLat," , ",startLng);
	console.log("End: ",endLat," , ",endLng);

	// get all linestrings
	const lineStrings = allTrainRoutes.map(o => {
		return {
			number: o.properties.number,
			coordinates: o.geometry.coordinates,
		}
	});
	// console.log(lineStrings)

	// get linestring containing the start point (departure station)
	let startLS = _.find(lineStrings, (o) => {
		return _.find(o.coordinates,(c) => {
			return c[1] == startLat && c[0] == startLng
		})
	});

	// get linestring containing the end point (arrival station)
	let endLS = _.find(lineStrings, (o) => {
		return _.find(o.coordinates,(c) => {
			return c[1] == endLat && c[0] == endLng
		})
	});
	console.log("startLS: ",startLS);
	console.log("endLS: ",endLS);

	if(!endLS || !startLS) throw new Error("No valid train route found. Message 1");

	// filter coordinates array to start from nearest point to departure/arrival point only
	function filterCoordinatesArray(coordinates_arr,pointLat,pointLng){
		let filtered_coordinates = [];
		let found_nearest = false;

		for(let i=0;i < coordinates_arr.length; i++){
			// start only when nearest point reached (exact search)
			if(coordinates_arr[i][1] == pointLat && coordinates_arr[i][0] == pointLng) {
				filtered_coordinates.push(coordinates_arr[i]);
				found_nearest = true;
				continue;
			}

			if(found_nearest) filtered_coordinates.push(coordinates_arr[i]); //record all after found
		}

		return filtered_coordinates;
	}

	startLS.coordinates = filterCoordinatesArray(startLS.coordinates,startLat,startLng);
	endLS.coordinates = filterCoordinatesArray(endLS.coordinates,endLat,endLng);
	

	// compactify to 1D array
	const finalTrainRoute = [...startLS.coordinates,...endLS.coordinates.reverse()];
	// console.log("finalTrainRoute",finalTrainRoute);

	if(finalTrainRoute.length == 0) throw new Error("No valid train route found. Message 2");
	return finalTrainRoute;
}

router.get("/geocode",(req,res) => {
	const locationstring = req.query.locationstring;
	const url = `https://graphhopper.com/api/1/geocode?q=${locationstring}&locale=de&debug=true&key=${process.env.GRAPHHOPPER_KEY}`;
	axios.get(url)
	.then(resp => {
		// Get weather of location using OpenWeatherMap API
		const locationpoint = resp.data.hits[0].point;
		axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${locationpoint.lat}&lon=${locationpoint.lng}&appid=${process.env.OPENWEATHERMAP_KEY}`)
		.then(resp2 => {
			res.json({
				status: "success",
				data: {...resp.data,...resp2.data}
			});
		})
		.catch(err => {throw new Error(err)});
			
	})
	.catch(err => {
		console.error(err);
		res.send(500).json({
			status: "error",
			message: err.message
		});
	})
});

router.get("/get_route",(req,res) => {
	const startpointLat = req.query.startpointLat;
	const startpointLng = req.query.startpointLng;
	const endpointLat = req.query.endpointLat;
	const endpointLng = req.query.endpointLng;
	const departureCountry = req.query.departureCountry;
	const arrivalCounty = req.query.arrivalCounty;
	const vehicle = req.query.vehicle;

	console.log("Route type: ",vehicle);

	if(vehicle == "car"){
		const url = `https://graphhopper.com/api/1/route?point=${startpointLat}%2C${startpointLng}&point=${endpointLat}%2C${endpointLng}1&vehicle=${vehicle}&debug=false&locale=en&points_encoded=false&instructions=false&elevation=false&optimize=false&key=${process.env.GRAPHHOPPER_KEY}`;

		axios.get(url)
		.then(resp => {
			res.json({
				status: "success",
				data: resp.data
			});
		})
		.catch(err => {
			console.error(err);
			res.status(500).json({
				status: "error",
				message: err.message
			});
		})
	}

	else if(vehicle == "train"){
		// get a route for train travelling between stations stored in system
		// NOTE:- only indian railways supported as of now

		try {
			const allStations = JSON.parse(fs.readFileSync("./stations.json"));
			if(allStations.length == 0) throw new Error("No stations found!");
		
			// get nearest station to startpoint, throw error if not found
			const departureStation = _.find(allStations,function(station){
				const d = distance(startpointLat,startpointLng,station.latitude_deg,station.longitude_deg);
				// console.log(`Distance from ${station.name} = ${d}`)
				if(station.name == "Station") return false;
				return d <= 5 || d <= 10 || d <= 15 || d <= 20 || d <= 25;
			});
			console.log("departureStation",departureStation);
			if(!departureStation) throw new Error("Departure station not found");

			// get nearest station to endpoint, throw error if not found
			const arrivalStation = _.find(allStations,function(station){
				const d = distance(endpointLat,endpointLng,station.latitude_deg,station.longitude_deg);
				// console.log(`Distance from ${station.name} = ${d}`)
				if(station.name == "Station") return false;
				return d <= 5 || d <= 10 || d <= 15 || d <= 20 || d <= 25;
			});
			console.log("arrivalStation",arrivalStation);
			if(!arrivalStation) throw new Error("Arrival station not found");

			res.json({
				status: "success",
				points: 
					findTrainRoute(departureStation.latitude_deg,departureStation.longitude_deg,arrivalStation.latitude_deg,arrivalStation.longitude_deg),
				// [
				// 	[departureStation.longitude_deg,departureStation.latitude_deg],
				// 	[arrivalStation.longitude_deg,arrivalStation.latitude_deg],
				// ],
				totaldistance: distance(departureStation.latitude_deg,departureStation.longitude_deg,
					arrivalStation.latitude_deg,arrivalStation.longitude_deg) * 1000
			});

		} catch (error) {
			console.error(error)
			res.status(500).json({
				status: "error",
				message: error.message
			});
		}
	}

	else if(vehicle == "airplane"){

		const allAirPorts = JSON.parse(fs.readFileSync("./airports.json"));
		if(allAirPorts.length == 0) throw new Error("No airports found!");

		// get a route for airline travelling between airports stored in system

		try{
			// get nearest airport to startpoint, throw error if not found
			const airportsInStartCountry = _.filter(allAirPorts,{iso_country: departureCountry});
			// console.log("airportsInStartCountry",airportsInStartCountry);
			const departureAirport = _.find(allAirPorts,function(airport){
				const d = distance(startpointLat,startpointLng,airport.latitude_deg,airport.longitude_deg);
				// console.log(`Distance from ${airport.name} = ${d}`)
				return d <= 50 && (airport.type == "medium_airport" || airport.type == "large_airport")
			});
			console.log("departureAirport",departureAirport);
			if(!departureAirport) throw new Error("Departure airport not found");

			// get nearest airport to endpoint, throw error if not found
			const airportsInEndCountry = _.filter(allAirPorts,{iso_country: arrivalCounty});
			// console.log("airportsInEndCountry",airportsInEndCountry);
			const arrivalAirport = _.find(allAirPorts,function(airport){
				const d = distance(endpointLat,endpointLng,airport.latitude_deg,airport.longitude_deg);
				// console.log(`Distance from ${airport.name} = ${d}`)
				return d <= 50 && (airport.type == "medium_airport" || airport.type == "large_airport")
			});
			console.log("arrivalAirport",arrivalAirport);
			if(!arrivalAirport) throw new Error("Arrival airport not found");

			res.json({
				status: "success",
				points: [
					[departureAirport.longitude_deg,departureAirport.latitude_deg],
					[arrivalAirport.longitude_deg,arrivalAirport.latitude_deg],
				],
				totaldistance: distance(departureAirport.latitude_deg,departureAirport.longitude_deg,
					arrivalAirport.latitude_deg,arrivalAirport.longitude_deg) * 1000
			});
		}
		catch(err){
			console.error(err);
			res.status(500).json({
				status: "error",
				message: err.message
			});
		}
	}


	else{
		res.status(400).json({
			status: "error",
			message: "Invalid vehicle"
		});
	}
		
});

module.exports = router;