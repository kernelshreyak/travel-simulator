import React, { Component } from "react";
import ReactDOM from "react-dom";
import "./styles.css";

import axios from "axios";

import swal from "sweetalert";
import { config } from "./config";
import MapNavigation, { MapNavigation2D, MapNavigation3D } from "./Map";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      speed: 0.0001,
      route_polyline: [],
      travelprocess: null,
      travel_ongoing: false,
      vehicletype: "INTRACITY", // Intra-City, Inter-City and Inter-State
      totalcost: 0, //Rupees
      currentcost: 0,
      totaldistance: 0, //kilometers
      currentdistance: 0,
      current_routepoint: 0,
      startpoint: [],
      endpoint: [],
      viewport: {
        center: [28.6828, 77.3121],
        zoom: 13
      }
    };
  }

  convertPolyLine = (polyline) => {
    const converted_polyline = [];
    for (let i = 0; i < polyline.length; i++) {
      converted_polyline.push([polyline[i][1], polyline[i][0]]);
    }
    // console.log("converted polyline", converted_polyline);
    return converted_polyline;
  };

  getRoute = async () => {
    
    try {
      const routeresponse = await axios.get(`${config.API_URL}/get_route?vehicle=car&startpointLat=${this.state.startpoint[0]}&startpointLng=${this.state.startpoint[1]}&endpointLat=${this.state.endpoint[0]}&endpointLng=${this.state.endpoint[1]}`);
      console.log(routeresponse.data);
      const routeData = this.convertPolyLine(
        routeresponse.data.data.paths[0].points.coordinates
      );
      console.log(routeData);

      const distance = routeresponse.data.data.paths[0].distance;
      let vehicletype = this.state.vehicletype;

      if(distance >= 60000){
        vehicletype = "INTERCITY";
      }
      else if(distance > 100000){
        vehicletype = "INTERSTATE";
      }
      
      this.setState({ 
        route_polyline: routeData,
        vehicletype: vehicletype,
        currentdistance: distance,
        currentcost: (distance/1000) * config.mapVehicleTypes[this.state.vehicletype].costperkm
      });
    } catch (error) {
      console.error(error);
      swal("Error", "Route error. Invalid end points", "error");
    }
  };

  setStartPoint = () => {
    let locationstring = document.getElementById("startpoint").value;
    if (locationstring === "currentlocation") {
      // set current location as starting point
      let newpoint = this.state.viewport.center;
      console.log("startpoint set: " + newpoint);
      swal("Success", "Start Point set", "success");
      this.setState({ startpoint: newpoint });
      return;
    }

    axios
      .get(config.API_URL + "/geocode?locationstring="+locationstring)
      .then((res) => {
        let data = res.data.data;

        // console.log(data.hits[0].point);
        let newpoint = [data.hits[0].point.lat, data.hits[0].point.lng];
        console.log("startpoint set: " + newpoint);
        swal("Success", "Start Point set", "success");
        this.setState({
          viewport: {
            center: newpoint
          },
          startpoint: newpoint
        });
      })
      .catch((err) => {
        console.error(err);
        swal("Error", "Map error. Invalid start point", "error");
      });
  };

  setEndPoint = () => {
    let locationstring = document.getElementById("endpoint").value;
    axios
      .get(config.API_URL + "/geocode?locationstring="+locationstring)
      .then((res) => {
        let data = res.data.data;

        // console.log(data.hits[0].point);
        let newpoint = [data.hits[0].point.lat, data.hits[0].point.lng];
        console.log("endpoint set: " + newpoint);
        swal("Success", "End Point set", "success");
        this.setState({
          endpoint: newpoint
        });
      })
      .catch((err) => {
        console.error(err);
        swal("Error", "Map error. Invalid end point", "error");
      });
  };

  walk = (direction = "up") => {
    let newcenter = [
      this.state.viewport.center[0] + this.state.speed,
      this.state.viewport.center[1]
    ];
    if (direction === "up") {
    } else if (direction === "down") {
      newcenter = [
        this.state.viewport.center[0] - this.state.speed,
        this.state.viewport.center[1]
      ];
    } else if (direction === "left") {
      newcenter = [
        this.state.viewport.center[0],
        this.state.viewport.center[1] - this.state.speed
      ];
    } else if (direction === "right") {
      newcenter = [
        this.state.viewport.center[0],
        this.state.viewport.center[1] + this.state.speed
      ];
    }

    this.setState({
      viewport: {
        center: newcenter
      }
    });
  };

  handleZoomChanged = (viewport) => {
    console.log("zoom changed");
    this.setState({
      viewport: { center: this.state.viewport.center, zoom: viewport.zoom }
    });
  };

  startTravel = () => {
    if (this.state.route_polyline.length === 0) {
      swal("Cannot start travel","Route not set. Click on Get Route", "warning");
      return;
    }

    clearInterval(this.state.travelprocess);

    this.setState({
      viewport: {
        center: this.state.route_polyline[0]
      },
      current_routepoint: 0,
      travel_ongoing: true,
      travelprocess: setInterval(() => {
        this.moveVehicle();
      },1000)
    });
    swal(
      "Success",
      "Travel Started. Happy Journey!",
      "success"
    );
  };

  completeTravel = () => {
    clearInterval(this.state.travelprocess);

    this.setState({
      travelprocess: null,
      route_polyline: [],
      travel_ongoing: false,
      current_routepoint: 0,
      totaldistance: this.state.totaldistance + this.state.currentdistance,
      totalcost: this.state.totalcost + this.state.currentcost,
      currentdistance: 0,
      currentcost: 0
    });

    window.localStorage.setItem("totaldistance",this.state.totaldistance);
    window.localStorage.setItem("totalcost",this.state.totalcost);

    swal("Success", "Travel Completed! Thanks for travelling with us", "success");
  };

  endTravel = () => {
    clearInterval(this.state.travelprocess);

    this.setState({
      travelprocess: null,
      route_polyline: [],
      travel_ongoing: false,
      current_routepoint: 0,
      currentdistance: 0,
      currentcost: 0
    });
    swal("Success", "Travel Ended", "success");
  };

  moveVehicle = () => {
    let speed = 1;

    if(this.state.vehicletype === "INTERCITY"){
      speed = 10;
    }
    else if(this.state.vehicletype === "INTERSTATE"){
      speed = 20;
    }

    const new_routepoint =
      this.state.current_routepoint + Math.floor(Math.random() * (speed + 1) + 1);

    if (new_routepoint >= this.state.route_polyline.length - 1) {
      // reached destination
      this.completeTravel();
      return;
    }
    this.setState({
      viewport: {
        center: this.state.route_polyline[new_routepoint]
      },
      current_routepoint: new_routepoint
    });
    // console.log("New route point: ", new_routepoint);
  };

  render() {
    return (
      <div className="maincontainer">
        <h3>World Travel Simulator</h3>
        <div>
          <p>
            Set Starting Point:
            <input type="text" id="startpoint" defaultValue="" />
            <button onClick={this.setStartPoint}>Set</button>
            <button onClick={() => {
              document.getElementById("startpoint").value = "currentlocation";
              this.setStartPoint();

            }}>Set Current Location</button>
          </p>
          <p>
            Set Destination:
            <input type="text" id="endpoint" />
            <button onClick={this.setEndPoint}>Get</button>
          </p>
          <p>
            <button className="btn btn-info" onClick={this.getRoute}>Get route</button>
          </p>
        </div>

        {!this.state.travel_ongoing && (
          <div className="navigation">
            <b>Simulate Walking</b>
            <button className="btn btn-secondary"
              onClick={() => {
                this.walk("up");
              }}
            >
              Walk Up
            </button>
            <button className="btn btn-secondary"
              onClick={() => {
                this.walk("down");
              }}
            >
              Walk Down
            </button>
            <button className="btn btn-secondary"
              onClick={() => {
                this.walk("left");
              }}
            >
              Walk Left
            </button>
            <button className="btn btn-secondary"
              onClick={() => {
                this.walk("right");
              }}
            >
              Walk Right
            </button>
          </div>
        )}

        <div className="navigation">
          <b>Current Distance: </b> {(this.state.currentdistance/1000).toFixed(2)} KM <br />
          <b>Vehicle Type: </b> {this.state.vehicletype} <br />
          <b>Current Cost: </b> {(this.state.currentcost).toFixed(2)} INR <br />
          {!this.state.travel_ongoing && (
            <button className="btn btn-success"
              onClick={() => {
                this.startTravel();
              }}
            >
              Start Travel
            </button>
          )}

          {this.state.travel_ongoing && (
            <div>
              
              <button className="btn btn-danger"
                onClick={() => {
                  this.endTravel();
                }}
              >
                End Travel
              </button>
            </div>
          )}
        </div>

        {/* <MapNavigation2D 
          onzoomlevelschange={this.handleZoomChanged} 
          viewport={this.state.viewport}
          center={this.state.viewport.center}
          positions={this.state.route_polyline}
        /> */}

        <MapNavigation3D 
          onzoomlevelschange={this.handleZoomChanged} 
          viewport={this.state.viewport}
          center={this.state.viewport.center}
          positions={this.state.route_polyline}
        />
      </div>
    );
  }
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
