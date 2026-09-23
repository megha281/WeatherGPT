import { Route, Routes, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

import Landing from './pages/Landing';
import Weather from './pages/Weather';
import WeatherGPTChat from './pages/WeatherGPTChat';
import Alerts from './pages/Alerts';
import Climate from './pages/Climate';
import MapPage from './pages/MapPage';
import About from './pages/About';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import VerifyEmail from './pages/VerifyEmail';
import Dashboard from './pages/Dashboard';
import SavedLocations from './pages/SavedLocations';
import ChatHistory from './pages/ChatHistory';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';

/** Every navigation starts at the top of the new page. */
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export default function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <ScrollToTop />
      <Navbar />

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/weather" element={<Weather />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/climate" element={<Climate />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/about" element={<About />} />

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/verify-email/:token" element={<VerifyEmail />} />

          <Route
            path="/weather-gpt"
            element={
              <ProtectedRoute>
                <WeatherGPTChat />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/saved-locations"
            element={
              <ProtectedRoute>
                <SavedLocations />
              </ProtectedRoute>
            }
          />
          <Route
            path="/chat-history"
            element={
              <ProtectedRoute>
                <ChatHistory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}
