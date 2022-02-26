const router = require("express").Router();

const axios = require("axios");


router.get("/geocode",(req,res) => {
	const locationstring = req.query.locationstring;
	const url = `https://graphhopper.com/api/1/geocode?q=${locationstring}&locale=de&debug=true&key=${process.env.GRAPHHOPPER_KEY}`;
	axios.get(url)
	.then(resp => {
		res.json({
			status: "success",
			data: resp.data
		});
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
	const vehicle = req.query.vehicle;

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
		res.send(500).json({
			status: "error",
			message: err.message
		});
	})
});

// get a route for airline travelling between airports stored in system
router.get("/get_airline_route",async (req,res) => {
	try{

	}
	catch(err){
		
	}
});

module.exports = router;