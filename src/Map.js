/* 
    the main map navigation component. 
    Planned to support both 2D and 3D navigation
    Can use any JavaScript map library. Currently uses Leaflet

*/
// import mapboxgl from "mapbox-gl";
// import mapboxGl from "mapbox-gl";
import React, {useEffect, useRef } from "react";

import { Map, TileLayer, Marker, Popup,Polyline, useLeaflet } from "react-leaflet";

import * as GeoUtil from "leaflet-geometryutil";
import {latLng,Icon,GeoJSON,marker} from "leaflet";
import hash from "object-hash";
import { config } from "./config";


function MapNavigation2D({center,positions,onzoomlevelschange,viewport,additional_waypoints=[]}){

    const leaflet = useLeaflet();

    const mapref = useRef(null);
    
    useEffect(() => {
        const map = mapref.current.contextValue.map;

        // console.log("positions",positions);
        // console.log("map",map);
        // if(additional_waypoints.length > 0){
        //     console.log("map",leaflet);
        //     positions = generateAirWayPoints(map,positions);
        // }
            
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
            {/* <GeoJSON key={hash(stationsData)} data={stationsData}  /> */}

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