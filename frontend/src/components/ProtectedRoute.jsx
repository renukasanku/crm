import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { admin, loading } = useAuth();

  if (loading) return <div className="center-page">Loading...</div>;
  if (!admin) return <Navigate to="/login" replace />;

  return children;
};

export default ProtectedRoute;
