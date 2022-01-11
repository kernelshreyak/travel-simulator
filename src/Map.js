/* 
    the main map navigation component. 
    Planned to support both 2D and 3D navigation
    Can use any JavaScript map library. Currently uses Leaflet

*/
import mapboxgl from "mapbox-gl";
import mapboxGl from "mapbox-gl";
import React, { useEffect, useRef } from "react";

import { Map, TileLayer, Marker, Popup } from "react-leaflet";
import { Polyline } from "react-leaflet";

function MapNavigation2D({center,positions,onzoomlevelschange,viewport}){
    return (
        <Map
          onzoomlevelschange={onzoomlevelschange}
          viewport={viewport}
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

// Uses Mapbox-GL
function MapNavigation3D({center,positions,onzoomlevelschange,viewport}){
    const mapContainer = useRef()
    useEffect(() => {
        mapboxgl.accessToken = "pk.eyJ1Ijoic2hyZXlha2NoYWtyYWJvcnR5IiwiYSI6ImNreWE3NjZvZDAycTQzMG9kZml3ZzY4cDEifQ.tvQsP-1OoCt7YdMLhx2RVQ";
        const map = new mapboxgl.Map({
            container: "map",
            style: "mapbox://styles/mapbox/satellite-streets-v11",
            center: [center[1],center[0]],
            zoom: 14,
            pitch: 60,
        });

        map.on("load", () => {
            map.addSource("mapbox-dem", {
              type: "raster-dem",
              url: "mapbox://mapbox.mapbox-terrain-dem-v1",
              tileSize: 512,
              maxZoom: 16,
            })
            map.setTerrain({ source: "mapbox-dem", exaggeration: 1.5 })
            map.addLayer({
              id: "sky",
              type: "sky",
              paint: {
                "sky-type": "atmosphere",
                "sky-atmosphere-sun": [0.0, 90.0],
                "sky-atmosphere-sun-intensity": 15,
              },
            })
          });
    });

    return(
        <div
        id="map"
        className="leaflet-container"
        ref={mapContainer}
        />
    );
}

export {
    MapNavigation2D,
    MapNavigation3D
}