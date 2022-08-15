// convert external data to formats suitable to be used by the backend 

const csv = require("csvtojson");
const fs = require("fs");

csv()
.fromFile("./stations.csv")
.then((jsonObj)=>{
    // console.log(jsonObj);
    fs.writeFileSync("./stations.json",JSON.stringify(jsonObj));
    console.log("Completed")
})


// convert GeoJSON to custom CSV

// const stationsData = require("./stations");
// // console.log(stationsData);

// const csvRows = [];
// let writeStream = fs.createWriteStream('./stations.csv');
// writeStream.write(["name","id","longitude_deg","latitude_deg"].join(',')+ '\n');
// stationsData.stationsData.features.forEach(station => {
//     // if(station.properties.name) console.log(station.properties.name);
//     writeStream.write([station.properties.name ?? "Station",station.properties.id ?? "NOID",parseFloat(station.geometry.coordinates[0]).toFixed(7),
//     parseFloat(station.geometry.coordinates[1]).toFixed(7)].join(',')+ '\n');
// });
// writeStream.end();
// writeStream.on('finish', () => {
//     console.log('CSV created')
// }).on('error', (err) => {
//     console.log(err)
// })