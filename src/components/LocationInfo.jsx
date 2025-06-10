import React, { useState, useEffect } from 'react';
import { getUserLocation } from '../utils/locationUtils';
import { getAuth } from 'firebase/auth';
import '../style.scss';

const OPENWEATHER_API_KEY = process.env.REACT_APP_OPENWEATHER_API_KEY;
const OPENCAGE_API_KEY = process.env.REACT_APP_OPENCAGE_API_KEY;

const LocationInfo = () => {
    const [weather, setWeather] = useState(null);
    const [places, setPlaces] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const auth = getAuth();

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (!OPENWEATHER_API_KEY || !OPENCAGE_API_KEY) {
                    throw new Error('API keys are not configured. Please check your environment variables.');
                }

                const userId = auth.currentUser?.uid;
                if (!userId) return;

                getUserLocation(userId, async (location) => {
                    if (location) {
                        try {
                            // Fetch weather data
                            const weatherResponse = await fetch(
                                `https://api.openweathermap.org/data/2.5/weather?lat=${location.latitude}&lon=${location.longitude}&appid=${OPENWEATHER_API_KEY}&units=metric`
                            );
                            
                            if (!weatherResponse.ok) {
                                throw new Error('Weather API request failed');
                            }
                            
                            const weatherData = await weatherResponse.json();
                            setWeather(weatherData);

                            // Fetch nearby places with more parameters
                            const placesResponse = await fetch(
                                `https://api.opencagedata.com/geocode/v1/json?q=${location.latitude}+${location.longitude}&key=${OPENCAGE_API_KEY}&limit=10&no_annotations=1&language=en`
                            );
                            
                            if (!placesResponse.ok) {
                                throw new Error('Places API request failed');
                            }
                            
                            const placesData = await placesResponse.json();
                            
                            const filteredPlaces = placesData.results
                                .filter(place => {
                                    const type = place.components.type?.toLowerCase() || '';
                                    const isRelevantType = type.includes('mall') || 
                                                           type.includes('park') || 
                                                           type.includes('restaurant') || 
                                                           type.includes('hotel') || 
                                                           type.includes('museum') || 
                                                           type.includes('attraction') ||
                                                           type.includes('landmark');
                                    
                                    return isRelevantType; // Removed distance check for now
                                })
                                .slice(0, 10); // Display top 10 relevant places
                            
                            setPlaces(filteredPlaces);
                        } catch (apiError) {
                            console.error('API Error:', apiError);
                            setError('Failed to fetch location data. Please try again later.');
                        }
                    }
                    setLoading(false);
                });
            } catch (err) {
                console.error('Error:', err);
                setError(err.message || 'Failed to fetch location data');
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="location-info loading">
                <div className="loading-spinner"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="location-info error">
                <p>{error}</p>
                <small>Please check your API keys configuration.</small>
            </div>
        );
    }

    return (
        <div className="location-info">
            {weather && (
                <div className="weather-card">
                    <div className="weather-header">
                        <h2>Current Weather</h2>
                        <span className="location">{"  -  " + weather.name}</span>
                    </div>
                    <div className="weather-content">
                        <div className="temperature">
                            <span className="temp">{Math.round(weather.main.temp)}°C</span>
                            <span className="feels-like">Feels like {Math.round(weather.main.feels_like)}°C</span>
                        </div>
                        <div className="weather-details">
                            <div className="detail">
                                <span className="label">Humidity</span>
                                <span className="value">{weather.main.humidity}%</span>
                            </div>
                            <div className="detail">
                                <span className="label">Wind</span>
                                <span className="value">{weather.wind.speed} m/s</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {places.length > 0 && (
                <div className="places-card">
                    <h2>Nearby Places</h2>
                    <div className="places-list">
                        {places.map((place, index) => (
                            <div key={index} className="place-item">
                                <div className="place-info">
                                    <span className="place-name">{place.formatted}</span>
                                    <span className="place-type">{place.components.type || 'Landmark'}</span>
                                </div>
                                <div className="place-distance">
                                    {place.distance && (
                                        <span>{Math.round(place.distance * 1000)}m</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default LocationInfo; 