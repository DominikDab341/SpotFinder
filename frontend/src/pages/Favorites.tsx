import { useState, useEffect } from "react";
import api from "../api/api";
import SpotCard, { Spot } from "../components/SpotCard";

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
        <div>
            {favorites.length === 0 ? (
                <h1>Brak ulubionych miejsc</h1>
            ) : (
                <h1>Ulubione</h1>
            )}
            {favorites.map((spot) => (
                <SpotCard key={spot.googlePlaceId} spot={spot} onRemove={handleRemove} />
            ))}
        </div>
    );
}

export default Favorites;