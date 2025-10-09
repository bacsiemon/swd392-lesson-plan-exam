// web/src/components/Header.jsx

import React from 'react';
import { Link } from 'react-router-dom'; 

function Header() {
  return (
    <header style={{ padding: '10px', backgroundColor: '#f0f0f0' }}>
      <nav>
        <Link to="/" style={{ margin: '0 10px' }}>Trang Chủ</Link>
        {/* Thêm các liên kết khác */}
      </nav>
    </header>
  );
}


export default Header;