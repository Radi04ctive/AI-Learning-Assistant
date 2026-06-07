import { Navigate, Outlet } from 'react-router-dom';
import AppLayout from '../layout/AppLayout';
import { useAuth } from '../../hooks/useAuth.js';

const ProtectedRoute = () => {
    const { isAuthenticated, isLoading} = useAuth()
    if (isLoading) {
        return <div>Loading...</div>
    }

  return isAuthenticated ? (
    <AppLayout>
        <Outlet/>
    </AppLayout>
  ) : (
    <Navigate to='/login' replace/>
  )
}

export default ProtectedRoute