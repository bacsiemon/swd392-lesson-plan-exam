import { Routes, Route, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/LoginPage';
import Register from './pages/RegisterPage';
import ForgotPassword from './pages/ForgotPasswordPage';
import TeacherDashboard from './pages/TeacherDashboard';
import StudentDashboard from './pages/StudentDashboard';
import ManageTestPage from './pages/ManageTestPage';
import QuestionBankManagement from './pages/QuestionBankManagement';
import ExamMatrixManagement from './pages/ExamMatrixManagement';
import Layout from './components/Layout';
import CreateLessonPlanPage from './pages/CreateLessonPlanPage';
import AdminUserManagement from './pages/AdminUserManagement';
import LessonPlansPage from './pages/LessonPlansPage';
import LessonPlanDetails from './pages/LessonPlanDetails';
import TeacherProfile from './pages/TeacherProfile';
import StudentTestPage from './pages/StudentTestPage';

function App() {
  const location = useLocation();
  
  // Auth pages that should not have Layout wrapper
  const authPages = ['/login', '/register', '/forgot-password'];
  const isAuthPage = authPages.includes(location.pathname);

  return (
    <>
      {isAuthPage ? (
        <main>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
          </Routes>
        </main>
      ) : (
        <Layout>
          <main>
            <Routes>
              <Route path="/home" element={<Home />} />
              <Route path="/dashboard" element={<TeacherDashboard />} />
              <Route path="/student-dashboard" element={<StudentDashboard />} />
              <Route path="/manage-tests" element={<ManageTestPage />} />
              <Route path="/question-banks" element={<QuestionBankManagement />} />
              <Route path="/exam-matrix" element={<ExamMatrixManagement />} />
              <Route path="/admin/users" element={<AdminUserManagement />} />
              <Route path="/" element={<Home />} />
              <Route path="/create-lesson-plan" element={<CreateLessonPlanPage />} />
              <Route path="/lesson-plans" element={<LessonPlansPage />} />
              <Route path="/lesson/:id" element={<LessonPlanDetails />} />
              <Route path="/profile" element={<TeacherProfile />} />
              <Route path="/student-test" element={<StudentTestPage />} />
            </Routes>
          </main>
        </Layout>
      )}
    </>
  );
}

export default App;
