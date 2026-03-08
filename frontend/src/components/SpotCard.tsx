import { useState } from 'react';
import api from '../api/api';




export interface Spot {
    googlePlaceId: string;
    displayName: string;
    formattedAddress: string;
    rating?: number;
    userRatingCount?: number;
    priceLevel?: string;
    isFavorite?: boolean;
    favoriteId?: number | null;
}

export interface SpotCardProps {
    spot: Spot;
    onRemove?: (googlePlaceId: string) => void;
}

function SpotCard({ spot, onRemove }: SpotCardProps) {
    const [isFavorite, setIsFavorite] = useState<boolean>(spot.isFavorite ?? true);


    const handleRemoveFromFavorites = async () => {
        if (!isFavorite) return;

        try {
            await api.delete(`favorites/${spot.favoriteId}/`);
            setIsFavorite(false);
            spot.isFavorite = false;
            spot.favoriteId = null;
            if (onRemove) {
                onRemove(spot.googlePlaceId);
            }
        } catch (error) {
            console.error('Error removing from favorites:', error);
        }
    };
    const handleAddToFavorites = async () => {
        if (isFavorite) return;

        try {
            const response = await api.post('favorites/', {
                googlePlaceId: spot.googlePlaceId,
                displayName: spot.displayName,
                formattedAddress: spot.formattedAddress,
                rating: spot.rating ?? null,
                userRatingCount: spot.userRatingCount ?? null,
                priceLevel: spot.priceLevel ?? null,
            });
            setIsFavorite(true);
            spot.isFavorite = true;
            spot.favoriteId = response.data.id;
        } catch (error) {
            console.error('Error adding to favorites:', error);
        }
    };
    return (
        <div>
            <h1>{spot.displayName}</h1>
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