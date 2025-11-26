import { memo, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import LoginScreen from './pages/LoginScreen';
import AdminDashboard from './pages/AdminDashboard';
import TransactionLogger from './pages/TransactionLogger';
import RegisterUserPage from './pages/RegisterUserPage';
import UserManagementPage from './pages/UserManagement';

import useAuth from './hooks/useAuth';
import StatusMessage from './components/StatusMessage';

const App = () => {
  const auth = useAuth();
  const [status, setStatusState] = useState({ type: null, message: null });

  const setStatus = (type, message) => {
    setStatusState({ type, message });

    if (type !== 'loading') {
      setTimeout(() => setStatusState({ type: null, message: null }), 3000);
    }
  };

  if (auth.loading) return null;

  // ✅ Not logged in → Only LoginScreen
  if (!auth.user) {
    return (
      <>
        <LoginScreen auth={auth} setStatus={setStatus} />
        <StatusMessage type={status.type} message={status.message} />
      </>
    );
  }

  const role = auth.user.role;

  return (
    <Router>
      <Routes>

        {/* ✅ Admin Routes */}
        {role === 'Admin' && (
          <>
            <Route 
              path="/admin" 
              element={<AdminDashboard auth={auth} setStatus={setStatus} />} 
            />
            <Route 
              path="/admin/register-user" 
              element={<RegisterUserPage auth={auth} setStatus={setStatus} />} 
            />
            {/* Default Admin Redirect */}
            <Route path="*" element={<Navigate to="/admin" />} />
            <Route path="/admin/users" element={<UserManagementPage auth={auth} />} />


          </>
        )}

        {/* ✅ Staff Routes */}
        {role === 'Staff' && (
          <>
            <Route 
              path="/staff" 
              element={<TransactionLogger auth={auth} setStatus={setStatus} />} 
            />
            {/* Default Staff Redirect */}
            <Route path="*" element={<Navigate to="/staff" />} />
          </>
        )}
      </Routes>

      <StatusMessage type={status.type} message={status.message} />
    </Router>
  );
};

export default memo(App);
