import { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import AuthContext from '../../services/authentication/AuthContext';
import PropTypes from 'prop-types';
import { Alert } from 'react-bootstrap';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, role, loading } = useContext(AuthContext);
  const location = useLocation();

  console.log('ProtectedRoute - User:', user);
  console.log('ProtectedRoute - User role:', role);
  console.log('ProtectedRoute - Current location:', location.pathname);


  if (loading) {
    return <p>Please wait while loading...</p>; 
}

  // Si no hay usuario, redirigir al login
  if (!user) {
    console.log('ProtectedRoute - No user, redirecting to login');
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Si el rol del usuario no está permitido, mostrar alerta
  if (allowedRoles && !allowedRoles.includes(role)) {
    console.log('ProtectedRoute - User does not have required role');
    return (
      <div className="mt-4">
        <Alert variant="danger" className="text-center">
          <strong>Access Denied!</strong> You do not have the required permissions to view this page.
          <br />
          <Alert.Link href="/" className="mt-2 d-block">
            Return to Home Page
          </Alert.Link>
        </Alert>
      </div>
    );
  }

  // Acceso permitido
  console.log('ProtectedRoute - Access granted');
  return children;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  allowedRoles: PropTypes.arrayOf(PropTypes.string),
};

export default ProtectedRoute;
