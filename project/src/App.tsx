import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import UploadCV from './pages/UploadCV';
import CreateCV from './pages/CreateCV';
import JobDescription from './pages/JobDescription';
import GeneratedResults from './pages/GeneratedResults';
import Payment from './pages/Payment';
import Success from './pages/Success';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { CVProvider } from './context/CVContext';
import { trackPageView } from './services/analytics';

// Analytics tracker component
const AnalyticsTracker: React.FC = () => {
  const location = useLocation();
  
  useEffect(() => {
    // Track page view on route change
    trackPageView(location.pathname, document.title);
  }, [location]);
  
  return null;
};

function App() {
  return (
    <CVProvider>
      <Router>
        <AnalyticsTracker />
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/upload-cv" element={<UploadCV />} />
              <Route path="/create-cv" element={<CreateCV />} />
              <Route path="/job-description" element={<JobDescription />} />
              <Route path="/generated-results" element={<GeneratedResults />} />
              <Route path="/payment" element={<Payment />} />
              <Route path="/success" element={<Success />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </CVProvider>
  );
}

export default App;