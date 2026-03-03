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
            Ulubione
          </button>
          <button className="navbar-button" onClick={handleLogout}>
            Wyloguj
          </button>
        </div>
      </nav>
    </>
  );
}

export default Navbar;