import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/LoginPage';
import TeacherDashboard from './pages/TeacherDashboard';
import Layout from './components/Layout';

function App() {
  console.log("React App đang chạy thành công!");
  return (
    <Layout>
      <main>
        <Routes>
          <Route path="/home" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<TeacherDashboard />} />
          <Route path="/" element={<Home />} />
        </Routes>
      </main>
    </Layout>
  );
}

export default App;
