import { useState } from 'react';
import api from '../api/api';
import ReservationModal from './Modal/ReservationModal';
import AIChatModal from './Modal/AIChatModal';
import '../css/spotCard.css';


export interface Spot {
    googlePlaceId: string;
    displayName: string;
    formattedAddress: string;
    rating?: number;
    userRatingCount?: number;
    priceLevel?: string;
    spotCategory?: string;
    isFavorite?: boolean;
    favoriteId?: number | null;
}

export interface SpotCardProps {
    spot: Spot;
    onRemove?: (googlePlaceId: string) => void;
}

function SpotCard({ spot, onRemove }: SpotCardProps) {
    const [isFavorite, setIsFavorite] = useState<boolean>(spot.isFavorite ?? true);
    const [isReservationModalOpen, setIsReservationModalOpen] = useState(false);
    const [isAIChatModalOpen, setIsAIChatModalOpen] = useState(false);

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
        <div className="spot-card">
            <h2 className="spot-title">{spot.displayName}</h2>
            <p className="spot-detail"><strong>Address:</strong> {spot.formattedAddress}</p>
            <p className="spot-detail"><strong>Rating:</strong> {spot.rating}</p>
            <p className="spot-detail"><strong>Reviews:</strong> {spot.userRatingCount}</p>
            <p className="spot-detail"><strong>Price:</strong> {spot.priceLevel ?? "No data available"}</p>

            <div className="spot-actions">
                {isFavorite ? (
                    <button className="spot-btn spot-btn-favorite" onClick={handleRemoveFromFavorites}>
                        Remove from favorites 💔
                    </button>
                ) : (
                    <button className="spot-btn spot-btn-favorite" onClick={handleAddToFavorites}>
                        Add to favorites ❤️
                    </button>
                )}
                {spot.spotCategory === 'food_and_drink' && (
                    <button className="spot-btn spot-btn-primary" onClick={() => setIsReservationModalOpen(true)}>
                        Reserve
                    </button>
                )}
                <button className="spot-btn spot-btn-secondary" onClick={() => setIsAIChatModalOpen(true)}>
                    Ask AI
                </button>
            </div>

            <ReservationModal
                isOpen={isReservationModalOpen}
                onClose={() => setIsReservationModalOpen(false)}
                place={spot}
            />

            <AIChatModal
                isOpen={isAIChatModalOpen}
                onClose={() => setIsAIChatModalOpen(false)}
                googlePlaceId={spot.googlePlaceId}
            />

        </div>
    );
}

export default SpotCard;