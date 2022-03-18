/* 
    the main map navigation component. 
    Planned to support both 2D and 3D navigation
    Can use any JavaScript map library. Currently uses Leaflet

*/
// import mapboxgl from "mapbox-gl";
// import mapboxGl from "mapbox-gl";
import React, {useEffect, useRef } from "react";

import { Map, TileLayer, Marker, Popup,Polyline, useLeaflet, } from "react-leaflet";

import * as GeoUtil from "leaflet-geometryutil";
import {latLng} from "leaflet";

// Special function to generate a fixed number of waypoints on an airline route segment(with 2 end points)
function generateAirWayPoints(map,routePoints,waypointsCount,random=false){	
    if(!map){
        return [];
    }
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


function MapNavigation2D({center,positions,onzoomlevelschange,viewport,additional_waypoints=[]}){

    const leaflet = useLeaflet();

    const mapref = useRef(null);

    useEffect(() => {
        const map = mapref.current.contextValue.map;

        console.log("positions",positions);
        console.log("map",map);
        if(additional_waypoints.length > 0){
            console.log("map",leaflet);
            positions = generateAirWayPoints(map,positions);
        }
            
    },[positions]);

    return (
        <Map
          onzoomlevelschange={onzoomlevelschange}
          viewport={viewport}
          ref={mapref}
        >
            <TileLayer
                attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.osm.org/{z}/{x}/{y}.png"
            />

            <Marker position={center}>
                <Popup>Your Location</Popup>
            </Marker>

            {positions.length > 0 && (
                <Polyline
                //   pathOptions={{ color: "red", fillColor: "red" }}
                positions={positions}
                />
            )}
        </Map>
    )
}

export {
    MapNavigation2D,
    // MapNavigation3D
}