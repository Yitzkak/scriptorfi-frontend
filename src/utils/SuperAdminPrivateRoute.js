import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../authContext';


const SuperAdminPrivateRoute = ({ children }) => {
    // const { user } = useAuth();
    const accessToken = localStorage.getItem('accessToken');

    // if (!accessToken) {
    //     if (user.role === 'admin') {
    //         return <Navigate to='/superadmin/login'/>
    //     }
    //     else {
    //         return <Navigate to='/login'/>
    //     }
    // }
    // else{ 
    //     return children;
    // }

    return accessToken ? children : <Navigate to="/superadmin/login" />;
};

export default SuperAdminPrivateRoute;
