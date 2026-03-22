import { useState, useEffect } from "react";
import api from "../api/api";
import SpotCard, { Spot } from "../components/SpotCard";
import '../css/home.css';

function Favorites() {

    const [favorites, setFavorites] = useState<Spot[]>([])

    useEffect(() => {
        const fetchFavorites = async () => {
            try {
                const response = await api.get('favorites/');
                const spots: Spot[] = response.data.map((fav: any) => ({
                    ...fav.spotDetails,
                    isFavorite: true,
                    favoriteId: fav.id,
                }));
                setFavorites(spots);
            } catch (error) {
                console.error('Error fetching favorites:', error);
            }
        };

        fetchFavorites();
    }, []);

    const handleRemove = (googlePlaceId: string) => {
        setFavorites((prevFavorites) => prevFavorites.filter(spot => spot.googlePlaceId !== googlePlaceId));
    };

    return (
        <div className="home-container">
            {favorites.length === 0 ? (
                <h1 className="home-header">Brak ulubionych miejsc</h1>
            ) : (
                <h1 className="home-header">Ulubione</h1>
            )}
            <div className="spot-grid">
                {favorites.map((spot) => (
                    <SpotCard key={spot.googlePlaceId} spot={spot} onRemove={handleRemove} />
                ))}
            </div>
        </div>
    );
}

export default Favorites;