import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-trackplayer';
import Box from '@mui/material/Box';
import Slider from '@mui/material/Slider';

import "./styles.css";

let flightDataCache = null; // Cache variable

function Map() {
    const mapRef = useRef(null);
    const mapInstance = useRef(null);
    const trackInstance = useRef(null);
    const prevIndexRef = useRef(null);
    const [playbackVal, setPlaybackVal] = useState(0);
    const [flightData, setFlightData] = useState([]);
    const [latLngArray, setLatLngArray] = useState([]);
    const [speedArray, setSpeedArray] = useState([]);
    const [headingArray, setHeadingArray] = useState([]);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentSpeed, setCurrentSpeed] = useState(0);
    const speedState = useRef(1);
    const headingRef = useRef(0);
    const [isLoading, setIsLoading] = useState(true);

    const loadMap = useCallback(() => {
        if (mapInstance.current) return;

        const map = L.map(mapRef.current, {
            center: [50.3168118, -4.2199061],
            zoom: 18,
            preferCanvas: true,
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 15
        }).addTo(map);

        mapInstance.current = map;
    }, []);

    useEffect(() => {
        loadMap();
    }, [loadMap]);

    useEffect(() => {
        if (flightDataCache) {
            setFlightData(flightDataCache);
            setIsLoading(false);
        } else {
            fetch('http://127.0.0.1:5000/flight-data')
                .then(res => res.json())
                .then(data => {
                    flightDataCache = data; // Store data in cache
                    setFlightData(data);
                    setIsLoading(false);
                });
        }
    }, []);

    useEffect(() => {
        if (flightData.length > 0) {
            setLatLngArray(flightData.map(point => [point.lat, point.lon]));
            setSpeedArray(flightData.map(point => point.speed));
            setHeadingArray(flightData.map(point => point.heading));
        }
    }, [flightData]);

    useEffect(() => {
        if (!mapInstance.current || latLngArray.length === 0 || speedArray.length === 0) return;

        if (trackInstance.current) {
            trackInstance.current.remove();
            trackInstance.current = null;
        }

        trackInstance.current = new L.TrackPlayer(latLngArray, {
            markerIcon: L.icon({ iconUrl: "/drone.ico" }),
            markerRotation: true,
            panTo: true,
            speed: speedArray[0],
            weight: 5,
        }).addTo(mapInstance.current);

        return () => {
            if (trackInstance.current) {
                trackInstance.current.off("progress");
            }
        };
    }, [latLngArray, speedArray]);

    const togglePlayback = () => {
        if (isPlaying) {
            trackInstance.current?.pause();
        } else {
            trackInstance.current?.start();

            trackInstance.current.on("progress", (progress, { lat, lng }, index) => {
                if (prevIndexRef.current !== index) {
                    if (speedArray[index] !== undefined) {
                        const actualSpeed = speedArray[index] * 3.6;

                        trackInstance.current.setSpeed(actualSpeed * speedState.current);

                        prevIndexRef.current = index;

                        if (speedArray[index] !== null && speedArray[index] !== undefined) {
                            setCurrentSpeed(speedArray[index]);
                        }

                        console.log(`Actual Speed (km/h): ${actualSpeed}`, index);
                        console.log(`Track Speed (km/h) in options: ${trackInstance.current.options.speed}`);

                        if (headingArray[index] !== undefined) {
                            headingRef.current = headingArray[index];
                        }
                    }
                }

                setPlaybackVal(progress * 100);
            });
        }
        setIsPlaying(!isPlaying);
    };

    const increaseSpeedX1 = () => {
        speedState.current = 1;
    };

    const increaseSpeedX2 = () => {
        speedState.current = 2;
    };

    const increaseSpeedX3 = () => {
        speedState.current = 3;
    };

    return (
        <div className='map-container'>
            <div ref={mapRef} className='map' />
            <div>
                <div className='control-panel'>
                    {isLoading ? (
                        <div style={{ color: 'white' }}>Loading...</div>
                    ) : (
                        <>
                            <button onClick={togglePlayback}>{isPlaying ? "⏸" : "▶"}</button>

                            <Box sx={{ width: 300 }}>
                                <Slider
                                    aria-label="Playback Progress"
                                    value={playbackVal}
                                    min={0}
                                    max={100}
                                    step={1}
                                    onChange={(e, newValue) => {
                                        const progress = newValue / 100;
                                        trackInstance.current?.setProgress(progress);
                                        setPlaybackVal(newValue);
                                    }}
                                    sx={{ color: '#53C4CA' }}
                                />
                            </Box>

                            <button onClick={increaseSpeedX1}>x1</button>
                            <button onClick={increaseSpeedX2}>x2</button>
                            <button onClick={increaseSpeedX3}>x3</button>
                            <button style={{ fontSize: 24, transform: `rotate(${headingRef.current}deg)` }}>&#8673;</button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Map;