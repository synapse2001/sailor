import React, { useEffect, useState } from 'react';
import { CssBaseline, Container, CircularProgress, Box } from '@mui/material';
import UnifiedLogin from './components/main/UnifiedLogin';
import { useAuth } from './controllers/userState';
import { useFirebase } from './context/Firebase';
import AdminPortal from './components/main/AdminPortal';
import SalesPortal from './components/main/SalesPortal';
import ClaimAdmin from './components/utils/ClaimAdmin';

function App() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const firebase = useFirebase();
  const [currentUserRole, setCurrentUserRole] = useState(null);

  const fetchUserRole = async (user) => {
    const userRole = await firebase.getUserRole(user.uid);
    setCurrentUserRole(userRole);
    setLoading(false);
    console.log(userRole);
  };

  useEffect(() => {
    if (user !== null) {
      fetchUserRole(user);
    } else {
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    }
  }, [user]);

  if (loading) {
    return (
      <div>
      <CssBaseline />
      <Container component="main" maxWidth="xs" sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <CircularProgress />
      </Container>
      </div>
    );
  }

  if (user === null) {
    return (
      <div>
        <CssBaseline />
        <Container component="main" maxWidth="xs" sx={{ display: 'flex', flexDirection: 'column', height: '100vh', justifyContent: 'center' }}>
          <UnifiedLogin />
        </Container>
      </div>
    );
  } else {
    console.log(currentUserRole);
    switch (currentUserRole) {
      case 'admin':
        return (
          <div>
            <CssBaseline />
            <AdminPortal />
          </div>
        );
      case 'salesperson':
        return (
          <div>
            <CssBaseline />
            <SalesPortal />
          </div>
        );
      case 'customer':
        return (
          <div>
            <CssBaseline />
            <SalesPortal />
          </div>
        );
      case null:
        return (
          <div>
            <CssBaseline />
            <ClaimAdmin user={user} setCurrentUserRole={setCurrentUserRole} />
          </div>
        );
      default:
        return null;
    }
  }
}

export default App;