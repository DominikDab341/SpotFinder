import { useState, useEffect } from "react";
import api from "../api/api";
import SpotCard, { Spot } from "../components/SpotCard";

function Favorites() {

    const [favorites, setFavorites] = useState<Spot[]>([])

    useEffect(() => {
        const fetchFavorites = async () => {
            try {
                const response = await api.get('favorites/');
                setFavorites(response.data);
            } catch (error) {
                console.error('Error fetching favorites:', error);
            }
        };

        fetchFavorites();
    }, []);

    return (
        <div>
            <h1>Ulubione</h1>
            {favorites.map((spot) => (
                <SpotCard key={spot.id} spot={spot} />
            ))}
        </div>
    );
}

export default Favorites;