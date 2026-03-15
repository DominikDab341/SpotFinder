import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/navbar.css';

function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    navigate('/login');
  };

  const handleFavorites = () => {
    navigate('/favorites');
  };

  const handleReservations = () => {
    navigate('/reservations');
  };

  return (
    <>
      <nav className="navbar">
        <div className="navbar-left">
        </div>

        <div className="navbar-center">
          <span className="navbar-title">SpotFinder</span>
        </div>

        <div className="navbar-right">
          <button className="navbar-button" onClick={handleFavorites}>
            Favorites
          </button>
          <button className="navbar-button" onClick={handleReservations}>
            My Reservations
          </button>
          <button className="navbar-button" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </nav>
    </>
  );
}

export default Navbar;