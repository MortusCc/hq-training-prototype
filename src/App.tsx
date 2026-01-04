import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import './App.css'
import { AppLayout } from './components/Layout'
import { useDb } from './state/db'
import { DbProvider } from './state/dbProvider'
import { getSession } from './state/session'
import { DashboardPage } from './pages/Dashboard'
import { LoginPage } from './pages/Login'
import { ManagerCoursesPage } from './pages/manager/ManagerCourses'
import { ManagerRequestsPage } from './pages/manager/ManagerRequests'
import { ExecutorCoursesPage } from './pages/executor/ExecutorCourses'
import { ExecutorEnrollmentsPage } from './pages/executor/ExecutorEnrollments'
import { ExecutorLecturersPage } from './pages/executor/ExecutorLecturers'
import { ExecutorNoticesPage } from './pages/executor/ExecutorNotices'
import { StudentCoursesPage } from './pages/student/StudentCourses'
import { StudentMyPage } from './pages/student/StudentMy'
import { StudentEvaluationPage } from './pages/student/StudentEvaluation'
import { OnsiteCheckinPage } from './pages/onsite/OnsiteCheckin'
import { OnsiteSurveyPage } from './pages/onsite/OnsiteSurvey'
import { CompanyRequestsPage } from './pages/company/CompanyRequests'
import { CompanyMyRequestsPage } from './pages/company/CompanyMyRequests'
import { ReportsPage } from './pages/Reports'
import { NotFoundPage } from './pages/NotFound'

function AppRoutes() {
  const { session, refreshSession } = useDb()
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    refreshSession(getSession())
  }, [refreshSession])

  useEffect(() => {
    if (!session && location.pathname !== '/login') {
      navigate('/login', { replace: true })
    }
  }, [location.pathname, navigate, session])

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<AppLayout />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/manager/requests" element={<ManagerRequestsPage />} />
        <Route path="/manager/courses" element={<ManagerCoursesPage />} />
        <Route path="/executor/courses" element={<ExecutorCoursesPage />} />
        <Route path="/executor/lecturers" element={<ExecutorLecturersPage />} />
        <Route path="/executor/enrollments" element={<ExecutorEnrollmentsPage />} />
        <Route path="/executor/notices" element={<ExecutorNoticesPage />} />
        <Route path="/company/requests" element={<CompanyRequestsPage />} />
        <Route path="/company/my" element={<CompanyMyRequestsPage />} />
        <Route path="/student/courses" element={<StudentCoursesPage />} />
        <Route path="/student/my" element={<StudentMyPage />} />
        <Route path="/student/evaluation" element={<StudentEvaluationPage />} />
        <Route path="/onsite/checkin" element={<OnsiteCheckinPage />} />
        <Route path="/onsite/survey" element={<OnsiteSurveyPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}

export default function App() {
  return (
    <DbProvider>
      <AppRoutes />
    </DbProvider>
  )
}
