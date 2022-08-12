const router = require("express").Router();

const axios = require("axios");

function distance(lat1, lon1, lat2, lon2, unit = "K") {
    const radlat1 = Math.PI * lat1/180
    const radlat2 = Math.PI * lat2/180
    const theta = lon1-lon2
    const radtheta = Math.PI * theta/180
    const dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
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


	else if(vehicle == "airplane"){
		const _ = require("lodash");
		const fs = require("fs");

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