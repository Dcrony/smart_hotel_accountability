import { memo, useState } from 'react';
import LoginScreen from './pages/LoginScreen';
import AdminDashboard from './pages/AdminDashboard';
import TransactionLogger from './pages/TransactionLogger';
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
    <>
      {role === 'Admin' ? (
        <AdminDashboard auth={auth} setStatus={setStatus} />
      ) : (
        <TransactionLogger auth={auth} setStatus={setStatus} />
      )}

      <StatusMessage type={status.type} message={status.message} />
    </>
  );
};

export default memo(App);
