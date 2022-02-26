// convert external data to formats suitable to be used by the backend 

const csv = require("csvtojson");
const fs = require("fs");

csv()
.fromFile("./airports.csv")
.then((jsonObj)=>{
    // console.log(jsonObj);
    fs.writeFileSync("./airports.json",JSON.stringify(jsonObj));
    console.log("Completed")
})