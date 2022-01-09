const express = require("express");
const app = express();
const cors = require("cors");

require("dotenv").config();

app.use(cors())

app.get("/",(req,res) => {
	res.json({message:"Welcome to World Travel Simulator backend"});
});

const api_routes = require("./routes/api");
app.use("/api",api_routes);

const PORT = process.env.PORT || 8000;

app.listen(PORT,() => console.log("World Travel Simulator backend started"));