import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Landing from './pages/Landing';
import Citizen from './pages/Citizen';
import Politician from './pages/Politician';
import Moderator from './pages/Moderator';
import Admin from './pages/Admin';

function ProtectedRoute({ children, allowedRoles }) {
  const { currentUser } = useAuth();

  // ✅ WAIT until auth loads
  if (currentUser === undefined) {
    return <div>Loading...</div>;
  }

  // ❌ Not logged in
  if (!currentUser) {
    return <Navigate to="/" replace />;
  }

  // ❌ Wrong role
  if (allowedRoles && !allowedRoles.includes(currentUser.role?.toLowerCase())) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />

        <Route path="/citizen" element={
          <ProtectedRoute allowedRoles={['citizen']}>
            <Citizen />
          </ProtectedRoute>
        } />

        <Route path="/politician" element={
          <ProtectedRoute allowedRoles={['politician']}>
            <Politician />
          </ProtectedRoute>
        } />

        <Route path="/moderator" element={
          <ProtectedRoute allowedRoles={['moderator']}>
            <Moderator />
          </ProtectedRoute>
        } />

        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Admin />
          </ProtectedRoute>
        } />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;