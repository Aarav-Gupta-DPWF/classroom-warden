import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import ConsoleApp from './pages/ConsoleApp';
import CAADemoPage from './pages/CAADemoPage';
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route
          path="/console"
          element={
            <ProtectedRoute>
              <ConsoleApp />
            </ProtectedRoute>
          }
        />
        <Route path="/caa" element={<CAADemoPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
