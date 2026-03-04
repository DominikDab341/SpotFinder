import { useState } from 'react';
import api from '../api/api';

export interface DisplayName {
    text: string;
    languageCode?: string;
}


export interface Spot {
    id: string;
    name?: string;
    displayName?: DisplayName;
    formattedAddress: string;
    rating?: number;
    userRatingCount?: number;
    priceLevel?: string;
    spot_type?: string;
    is_favorite: boolean;
    favorite_id: string;
}

export interface SpotCardProps {
    spot: Spot;
}

function SpotCard({ spot }: SpotCardProps) {
    const [isFavorite, setIsFavorite] = useState<boolean>(spot.is_favorite);


    const handleRemoveFromFavorites = async () => {
        if (!isFavorite) return;

        try {
            const response = await api.delete(`favorites/${spot.favorite_id}/`);
            setIsFavorite(false);
            spot.is_favorite = false;
            spot.favorite_id = "";
        } catch (error) {
            console.error('Error removing from favorites:', error);
        }
    };
    const handleAddToFavorites = async () => {
        if (isFavorite) return;

        try {
            const response = await api.post('favorites/', {
                google_place_id: spot.id,
                name: spot.displayName?.text || spot.name,
                address: spot.formattedAddress,
                spot_type: spot.spot_type || "unknown"
            });
            setIsFavorite(true);
            spot.is_favorite = true;
            spot.favorite_id = response.data.id;
        } catch (error) {
            console.error('Error adding to favorites:', error);
        }
    };
    return (
        <div>
            <h1>{spot.displayName?.text || spot.name}</h1>
            <p>Address: {spot.formattedAddress}</p>
            <p>Rating: {spot.rating}</p>
            <p>User Rating Count: {spot.userRatingCount}</p>
            <p>Price Level: {spot.priceLevel ?? "No data available"}</p>
            {isFavorite ? (
                <button onClick={handleRemoveFromFavorites}>
                    Remove from favorites 💔
                </button>
            ) : (
                <button onClick={handleAddToFavorites}>
                    Add to favorites ❤️
                </button>
            )}

        </div>
    );
}

export default SpotCard;