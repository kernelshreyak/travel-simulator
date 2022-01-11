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

        map.on('load', () => {
            // Insert the layer beneath any symbol layer.
            const layers = map.getStyle().layers;
            const labelLayerId = layers.find(
                (layer) => layer.type === 'symbol' && layer.layout['text-field']
            ).id;
             
            // The 'building' layer in the Mapbox Streets
            // vector tileset contains building height data
            // from OpenStreetMap.
            map.addLayer(
                {
                    'id': 'add-3d-buildings',
                    'source': 'composite',
                    'source-layer': 'building',
                    'filter': ['==', 'extrude', 'true'],
                    'type': 'fill-extrusion',
                    'minzoom': 15,
                    'paint': {
                        'fill-extrusion-color': '#aaa',
                        
                        // Use an 'interpolate' expression to
                        // add a smooth transition effect to
                        // the buildings as the user zooms in.
                        'fill-extrusion-height': [
                        'interpolate',
                        ['linear'],
                        ['zoom'],
                        15,
                        0,
                        15.05,
                        ['get', 'height']
                        ],
                        'fill-extrusion-base': [
                            'interpolate',
                            ['linear'],
                            ['zoom'],
                            15,
                            0,
                            15.05,
                            ['get', 'min_height']
                        ],
                        'fill-extrusion-opacity': 0.6
                    }
                },
                labelLayerId
            );
            
            const el = document.createElement('div');
            el.className = 'marker';
            new mapboxgl.Marker(el)
            .setLngLat(center)
            .addTo(map);
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