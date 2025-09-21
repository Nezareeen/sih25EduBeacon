import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminRegisterPage from './pages/AdminRegisterPage';

// Layout component with Navbar
const MainLayout = () => (
  <>
    <Navbar />
    <main>
      <Outlet /> {/* Child routes will render here */}
    </main>
  </>
);

// Layout component without Navbar for auth pages
const AuthLayout = () => (
  <main>
    <Outlet /> {/* Child routes will render here */}
  </main>
);

function App() {
  return (
    <Router>
      <Routes>
        {/* Routes with Navbar */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          {/* Add other main app routes here, e.g., dashboards */}
          <Route path="/student-dashboard" element={<div>Student Dashboard</div>} />
          <Route path="/instructor-dashboard" element={<div>Instructor Dashboard</div>} />
        </Route>

        {/* Routes without Navbar */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/admin-register" element={<AdminRegisterPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;