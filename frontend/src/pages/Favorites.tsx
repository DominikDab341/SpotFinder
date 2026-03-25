import { useState, useEffect } from "react";
import api from "../api/api";
import SpotCard, { Spot } from "../components/SpotCard";
import '../css/home.css';
import Pagination from "../components/Pagination";

function Favorites() {

    const [favorites, setFavorites] = useState<Spot[]>([])
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(0);

    useEffect(() => {
        const fetchFavorites = async () => {
            try {
                const response = await api.get(`favorites/?page=${currentPage}`);
                const spots: Spot[] = response.data.results.map((fav: any) => ({
                    ...fav.spotDetails,
                    isFavorite: true,
                    favoriteId: fav.id,
                }));
                setFavorites(spots);
                
                const totalItems = response.data.count || 0;
                setTotalPages(Math.ceil(totalItems / 9));
            } catch (error) {
                console.error('Error fetching favorites:', error);
            }
        };

        fetchFavorites();
    }, [currentPage]);

    const handleRemove = (googlePlaceId: string) => {
        setFavorites((prevFavorites) => prevFavorites.filter(spot => spot.googlePlaceId !== googlePlaceId));
    };

    return (
        <div className="home-container">
            {favorites.length === 0 ? (
                <h1 className="home-header">No favorites</h1>
            ) : (
                <h1 className="home-header">Favorites</h1>
            )}
            <div className="spot-grid">
                {favorites.map((spot) => (
                    <SpotCard key={spot.googlePlaceId} spot={spot} onRemove={handleRemove} />
                ))}
            </div>
            {totalPages > 1 && (
                <Pagination 
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage} 
                />
            )}
        </div>
    );
}

export default Favorites;