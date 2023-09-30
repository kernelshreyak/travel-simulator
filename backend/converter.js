// convert external data to formats suitable to be used by the backend 

const csv = require("csvtojson");
const fs = require("fs");

csv()
.fromFile("./stations.csv")
.then((jsonObj)=>{
    fs.writeFileSync("./stations.json",JSON.stringify(jsonObj));
    console.log("Completed")
});