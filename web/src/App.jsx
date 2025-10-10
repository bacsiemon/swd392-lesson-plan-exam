// web/src/App.jsx

import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home'; 
import Header from './components/Header'; 
import Login from './pages/LoginPage';

function App() {
  console.log("React App đang chạy thành công!");
  return (
    <>
      <Header /> {/* Thanh điều hướng chung */}
      <main>
        <Routes>
          <Route path="/Home" element={<Home />} />
    
        </Routes>
        <Routes>
          <Route path="/LoginPage" element={<Login />} />
    
        </Routes>

      </main>
    </>
  );
}

export default App;