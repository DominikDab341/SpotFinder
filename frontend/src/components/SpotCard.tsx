
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
}

export interface SpotCardProps {
    spot: Spot;
}

function SpotCard({spot}: SpotCardProps) {
    return (
        <div>
            <h1>{spot.displayName.text}</h1>
            <p>Address: {spot.formattedAddress}</p>
            <p>Rating: {spot.rating}</p>
            <p>User Rating Count: {spot.userRatingCount}</p>
            <p>Price Level: {spot.priceLevel ?? "No data available"}</p>
        </div>
    );
}

export default SpotCard;