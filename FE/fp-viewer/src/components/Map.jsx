import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-kml';
import omnivore from '@mapbox/leaflet-omnivore'

function Map() {
  const mapRef = useRef(null);
  const kmlUrl = '/flight_path.kml';

  useEffect(() => {
    if (!mapRef.current) return;

    const map = L.map(mapRef.current, {
      center: new L.LatLng(50.32, -4.2),
      zoom: 11,
      preferCanvas: true,
    });

    const osm = new L.TileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png');
    map.addLayer(osm);

    // Fetch the KML file
    omnivore.kml(kmlUrl).addTo(map);
    omnivore.kml(kmlUrl).on('ready', function () {
      const layer = this; 
      const latLngs = layer.getLayers()[0]._latlngs;
      console.log(latLngs);
    })
    
    return () => {
      map.remove();
    };
  }, [kmlUrl]);

  return (
    <div
      ref={mapRef}
      style={{ width: '100%', height: '80vh', borderRadius: '10px' }}
    />
  );
}

export default Map;
