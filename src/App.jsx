import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import ConsoleApp from './pages/ConsoleApp';
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/welcome" element={<LandingPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <ConsoleApp />
            </ProtectedRoute>
          }
        />
        <Route path="/console" element={<Navigate to="/" replace />} />
        <Route path="*" element={<Navigate to="/welcome" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
