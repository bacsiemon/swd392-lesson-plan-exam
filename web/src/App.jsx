import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/LoginPage';
import Register from './pages/RegisterPage';
import ForgotPassword from './pages/ForgotPasswordPage';
import TeacherDashboard from './pages/TeacherDashboard';
import StudentDashboard from './pages/StudentDashboard';
import ClassEnrollmentPage from './pages/ClassEnrollmentPage';
import ManageClassesPage from './pages/ManageClassesPage';
import QuestionBankManagement from './pages/QuestionBankManagement';
import ExamMatrixManagement from './pages/ExamMatrixManagement';
import Layout from './components/Layout';
import CreateSlidePage from './pages/CreateSlidePage';
import CreateLessonPlanPage from './pages/CreateLessonPlanPage';
import AdminUserManagement from './pages/AdminUserManagement';

function App() {

  return (
    <Layout>
      <main>
        <Routes>
          <Route path="/home" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/dashboard" element={<TeacherDashboard />} />
          <Route path="/student-dashboard" element={<StudentDashboard />} />
          <Route path="/enroll-class" element={<ClassEnrollmentPage />} />
          <Route path="/manage-classes" element={<ManageClassesPage />} />
          <Route path="/question-banks" element={<QuestionBankManagement />} />
          <Route path="/exam-matrix" element={<ExamMatrixManagement />} />
          <Route path="/admin/users" element={<AdminUserManagement />} />
          <Route path="/" element={<Home />} />
          <Route path="/create-slide" element={<CreateSlidePage />} />
          <Route path="/create-lesson-plan" element={<CreateLessonPlanPage />} />
        </Routes>
      </main>
    </Layout>
  );
}

export default App;
