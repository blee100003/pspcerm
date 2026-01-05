import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import HR from './pages/HR';
import Finance from './pages/Finance';
import Invoicing from './pages/Invoicing';
import Projects from './pages/Projects';
import UsersPage from './pages/Users';

import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Layout />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="hr" element={<HR />} />
              <Route path="projects" element={<Projects />} />
              <Route path="finance" element={<Finance />} />
              <Route path="invoicing" element={<Invoicing />} />
              <Route path="users" element={<UsersPage />} />
            </Route>
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
