import React from 'react';
import { Link } from 'react-router-dom';

const FloatingDonate = () => {
  return (
    <Link to="/login" className="floating-donate">
      <i className="fas fa-heart"></i> Donate Now
    </Link>
  );
};

export default FloatingDonate;