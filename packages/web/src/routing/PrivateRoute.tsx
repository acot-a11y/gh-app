import React from 'react';
import { Navigate } from 'react-location';
import { useAuth } from '../states/auth';

export const PrivateRoute: React.FC = ({ children }) => {
  const { user } = useAuth();

  if (user != null) {
    return <>{children}</>;
  }

  return <Navigate replace to="/login" />;
};
