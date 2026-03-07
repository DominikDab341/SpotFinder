import useGeolocation from "../hooks/useGeolocation";
import api from "../api/api";
import { useState, useEffect } from 'react';
import SpotCard, { Spot } from "../components/SpotCard";


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
        return <div>Loading...</div>;
    }

    if (geoError) {
        return <div>Error: {geoError}</div>;
    }

    return (
        <div>
            <h1>Home</h1>
            {spots.map((spot) => (
                <SpotCard key={spot.googlePlaceId} spot={spot} />
            ))} 
        </div>
    );
}

export default Home;