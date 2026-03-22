import useGeolocation from "../hooks/useGeolocation";
import api from "../api/api";
import { useState, useEffect } from 'react';
import SpotCard, { Spot } from "../components/SpotCard";
import SearchSpot from "../components/SearchSpot";
import '../css/home.css';

function Home() {
    const { address, error: geoError, loading: geoLoading } = useGeolocation();
    const [spots, setSpots] = useState<Spot[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        if (geoLoading) return;
        if (geoError) return;
        if (!address) return;

        const fetchSpots = async () => {
            try {
                const response = await api.post('spots/', {
                    address: address,
                    radius: 1500
                });
                setSpots(response.data.places);
            } catch (error) {
                console.error('Error fetching spots:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchSpots();
    }, [address, geoLoading, geoError]);

    if (loading) {
        return (
            <div className="home-loading-container">
                <div className="home-spinner"></div>
                <p>Loading spots...</p>
            </div>
        );
    }

    if (geoError) {
        return (
            <div className="home-loading-container">
                <p className="auth-error-msg">Error: {geoError}</p>
            </div>
        );
    }

    return (
        <div className="home-container">
            <h1 className="home-header">Discover Spots</h1>
            <SearchSpot onSpotsFetch={setSpots}/>
            
            <div className="spot-grid">
                {spots.map((spot) => (
                    <SpotCard key={spot.googlePlaceId} spot={spot} />
                ))} 
            </div>
        </div>
    );
}

export default Home;