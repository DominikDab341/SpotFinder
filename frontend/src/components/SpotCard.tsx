import { useState } from 'react';
import api from '../api/api';

export interface DisplayName {
    text: string;
    languageCode?: string;
}


export interface Spot {
    id: string;
    displayName: DisplayName;
    formattedAddress: string;
    rating?: number;
    userRatingCount?: number;
    priceLevel?: string;
    spot_type?: string;
}

export interface SpotCardProps {
    spot: Spot;
}

function SpotCard({spot}: SpotCardProps) {
    const [isFavorite, setIsFavorite] = useState(false);

    //TODO: Fix removing from favorites
    const handleRemoveFromFavorites = async () => {
        if (!isFavorite) return;

        try {
            const response = await api.delete(`favorites/${spot.id}/`);
            setIsFavorite(false);
        } catch (error) {
            console.error('Error removing from favorites:', error);
        }
    };
    const handleAddToFavorites = async () => {
        if (isFavorite) return;

        try {
            const response = await api.post('favorites/', {
                google_place_id: spot.id,
                name: spot.displayName.text,
                address: spot.formattedAddress,
                spot_type: spot.spot_type || "unknown"
                //TODO: Consider whether this is a good approach
            });
            setIsFavorite(true);
        } catch (error) {
            console.error('Error adding to favorites:', error);
        }
    };
    return (
        <div>
            <h1>{spot.displayName.text}</h1>
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