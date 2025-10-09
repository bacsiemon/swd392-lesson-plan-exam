// web/src/App.jsx

import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home'; 
import Header from './components/Header'; 


function App() {
  console.log("React App đang chạy thành công!");
  return (
    <>
      <Header /> {/* Thanh điều hướng chung */}
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
    
        </Routes>
      </main>
    </>
  );
}

export default App;