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
import UserProfile from './pages/UserProfile';
import StudentTestPage from './pages/StudentTestPage';
import StudentTestResultPage from './pages/StudentTestResultPage';
import StudentTestAnalytics from './pages/StudentTestAnalytics';
import StudentTestAnalyticsList from './pages/StudentTestAnalyticsList';
import StudentTestListPage from './pages/StudentTestListPage';
import CalendarPage from './pages/CalendarPage';
import TestScoresPage from './pages/TestScoresPage';
import AdminActivityStatus from './pages/AdminActivityStatus';
import PeriodicTablePage from './pages/PeriodicTablePage';
import ChemistryPageLoader from './components/ChemistryPageLoader';
import usePageTransition from './hooks/usePageTransition';

function App() {
  const location = useLocation();
  const isLoading = usePageTransition(1000);
  
  // Auth pages that should not have Layout wrapper
  const authPages = ['/login', '/register', '/forgot-password'];
  const isAuthPage = authPages.includes(location.pathname);

  return (
    <>
      {isLoading && <ChemistryPageLoader />}
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
              <Route path="/profile" element={<UserProfile />} />
              <Route path="/exams" element={<StudentTestListPage />} />
              <Route path="/student-test" element={<StudentTestPage />} />
              <Route path="/student-test/result" element={<StudentTestResultPage />} />
              <Route path="/student-test/analytics" element={<StudentTestAnalyticsList />} />
              <Route path="/student-test/analytics/:id" element={<StudentTestAnalytics />} />
              <Route path="/calendar" element={<CalendarPage />} />
              <Route path="/test-scores" element={<TestScoresPage />} />
              <Route path="/admin/activity-status" element={<AdminActivityStatus />} />
              <Route path="/periodic-table" element={<PeriodicTablePage />} />
            </Routes>
          </main>
        </Layout>
      )}
    </>
  );
}

export default App;
