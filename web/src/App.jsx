import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/LoginPage';
import TeacherDashboard from './pages/TeacherDashboard';
import QuestionBankManagement from './pages/QuestionBankManagement';
import Layout from './components/Layout';
import CreateSlidePage from './pages/CreateSlidePage';
import CreateLessonPlanPage from './pages/CreateLessonPlanPage';

function App() {
 
  return (
    <Layout>
      <main>
        <Routes>
          <Route path="/home" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<TeacherDashboard />} />
          <Route path="/question-banks" element={<QuestionBankManagement />} />
          <Route path="/" element={<Home />} />
          <Route path="/create-slide" element={<CreateSlidePage />} />
          <Route path="/create-lesson-plan" element={<CreateLessonPlanPage />} />
        </Routes>
      </main>
    </Layout>
  );
}

export default App;
