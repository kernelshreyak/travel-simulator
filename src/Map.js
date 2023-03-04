/* 
    the main map navigation component. 
    Planned to support both 2D and 3D navigation
    Can use any JavaScript map library. Currently uses Leaflet

*/
import React, {useRef } from "react";

import { Map, TileLayer, Marker, Popup,Polyline } from "react-leaflet";

function MapNavigation2D({center,positions,onzoomlevelschange,viewport}){

    const mapref = useRef(null);

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
    MapNavigation2D
}