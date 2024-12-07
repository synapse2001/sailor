import React, { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { useFirebase } from '../../../context/Firebase';
import { Box, Button } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useAuth } from '../../../controllers/userState';
import PopupAlterUser from './PopupAlterUser';

const columns = [
  { field: 'id', headerName: 'ID', width: 500 },
  { field: 'name', headerName: 'Name', width: 200, editable: true },
  { field: 'email', headerName: 'Email', width: 250, editable: true },
  { field: 'role', headerName: 'Role', width: 100, editable: true },
  // { field: 'password', headerName: 'Password', width: 150, editable: true },
];

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editUser, setEditUser] = useState(null);
  const [openAlterUserDialog, setOpenAlterUserDialog] = useState(false);
  const firebase = useFirebase();
  const theme = useTheme();
  const { user } = useAuth();

  useEffect(() => {
    fetchUsers();
  }, [firebase]);

  useEffect(() => {
    setFilteredUsers(users);
  }, [users]);

  const fetchUsers = async () => {
    try {
      // console.log(user)
      const usersData = await firebase.fetchData('users');
      const formattedUsers = Object.keys(usersData).map(key => ({
        id: key,
        ...usersData[key],
      }));
      setUsers(formattedUsers);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      setLoading(false);
    }
  };

  const handleEditCommit = async (updatedUser) => {
    try {
      const updatedUsers = users.map(user =>
        user.id === updatedUser.id ? updatedUser : user
      );
      setUsers(updatedUsers); // Update local state
      await firebase.putData(`users/${updatedUser.id}`, updatedUser); // Update Firebase
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const handleOpenAlterUserDialog = (user) => {
    setEditUser(user);
    setOpenAlterUserDialog(true);
  };

  const handleCloseAlterUserDialog = () => {
    setEditUser(null);
    setOpenAlterUserDialog(false);
  };

  const handleSaveUser = async (userData) => {
    try {
      if (userData.id) {
        // Edit existing user
        await handleEditCommit(userData);
      } else {
        // Add new user (for demo, update Firebase or your state accordingly)
        const currentAdmin = user.uid;
        const adminData = users.filter(user => user.id === currentAdmin);
        const firesponse = await firebase.createUser(userData.email, userData.password);
        // console.log("response is ",firesponse);
        const newuser = firesponse.user;
        await firebase.putData('users/' + newuser.uid, { email: newuser.email, role: userData.role,name: userData.name ,password: userData.password });
        await firebase.signinUser(adminData[0].email, adminData[0].password);
      }
    } catch (error) {
      console.error('Error saving user:', error);
    }
    handleCloseAlterUserDialog();
  };

  return (
    <Box sx={{ height: '100%', width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
        <Button
          variant="contained"
          style={{ borderRadius: '8px', marginLeft: '5px', color: theme.palette.black.main }}
          onClick={() => {
            const filteredUsers = users.filter(user => user.role === 'admin');
            setFilteredUsers(filteredUsers);
          }}
        >
          Admins
        </Button>
        <Button
          variant="contained"
          style={{ borderRadius: '8px', marginLeft: '5px', color: theme.palette.black.main }}
          onClick={() => {
            const filteredUsers = users.filter(user => user.role === 'salesperson');
            setFilteredUsers(filteredUsers);
          }}
        >
          Sales Person
        </Button>
        <Button
          variant="contained"
          style={{ borderRadius: '8px', marginLeft: '5px', color: theme.palette.black.main }}
          onClick={() => {
            const filteredUsers = users.filter(user => user.role === 'customer');
            setFilteredUsers(filteredUsers);
          }}
        >
          Customer
        </Button>
        <Button
          variant="contained"
          style={{ borderRadius: '8px', marginLeft: '5px', color: theme.palette.black.main }}
          onClick={() => setOpenAlterUserDialog(true)}
        >
          Add User
        </Button>
      </Box>
      <Box sx={{ height: 'calc(100vh - 300px)', width: '100%' }}>
        <DataGrid
          rows={filteredUsers}
          columns={columns}
          pageSize={10}
          rowsPerPageOptions={[10, 25, 50]}
          disableSelectionOnClick
          onRowDoubleClick={(params) => handleOpenAlterUserDialog(params.row)}
          sx={{
            '& .MuiDataGrid-menuIconButton': {
              color: theme.palette.primary.main,
            },
            '& .MuiDataGrid-sortIcon': {
              color: theme.palette.primary.main,
            },
            // Add border color customization
            border: `1px solid ${theme.palette.primary.main}`,
            '& .MuiDataGrid-cell': {
              borderColor: theme.palette.primary.main,
            },
            '& .MuiDataGrid-columnHeaders': {
              borderColor: theme.palette.primary.main,
            },
            '& .MuiDataGrid-columnSeparator': {
              color: theme.palette.primary.main,
            },
            '& .MuiDataGrid-row': {
              borderColor: theme.palette.primary.main,
            },
            '& .MuiDataGrid-footerContainer': {
              borderTop: `1px solid ${theme.palette.primary.main}`,
            }
          }}
        />
      </Box>
      <PopupAlterUser
        open={openAlterUserDialog}
        handleClose={handleCloseAlterUserDialog}
        userData={editUser}
        handleSave={handleSaveUser}
      />
      <Box sx={{ display: 'flex', justifyContent: 'flex-start', marginTop: '1rem' }}>
        <Button
          variant="contained"
          style={{ borderRadius: '8px', color: theme.palette.black.main }}
          onClick={fetchUsers}
        >
          Refresh
        </Button>
      </Box>
    </Box>
  );
};

export default UserManagement;
