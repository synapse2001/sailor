import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';

const roles = ['admin', 'salesperson', 'customer'];

const PopupAlterUser = ({ open, handleClose, userData, handleSave }) => {
  const [editedUser, setEditedUser] = useState({ ...userData });

  useEffect(() => {
    // Update editedUser state when userData prop changes
    setEditedUser({ ...userData });
  }, [userData]);

  const handleFieldChange = (field, value) => {
    setEditedUser(prevState => ({
      ...prevState,
      [field]: value,
    }));
  };

  const handleAction = () => {
    handleSave(editedUser);
    handleClose();
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>{userData ? 'Edit User' : 'Add User'}</DialogTitle>
      <DialogContent dividers>
        <TextField
          label="Name"
          value={editedUser.name || ''}
          onChange={(e) => handleFieldChange('name', e.target.value)}
          fullWidth
          variant="outlined"
          style={{ marginBottom: '1rem' }}
        />
        <TextField
          label="Email"
          value={editedUser.email || ''}
          onChange={(e) => handleFieldChange('email', e.target.value)}
          fullWidth
          disabled={!!userData} // Disable for edit mode
          variant="outlined"
          style={{ marginBottom: '1rem' }}
        />
        <FormControl fullWidth variant="outlined" style={{ marginBottom: '1rem' }}>
          <InputLabel>Role</InputLabel>
          <Select
            value={editedUser.role || ''}
            onChange={(e) => handleFieldChange('role', e.target.value)}
            label="Role"
          >
            {roles.map(role => (
              <MenuItem key={role} value={role}>{role}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          label="Password"
          value={editedUser.password || ''}
          onChange={(e) => handleFieldChange('password', e.target.value)}
          fullWidth
          disabled={!!userData} // Disable for edit mode
          variant="outlined"
          type="password"
          style={{ marginBottom: '1rem' }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleAction} color="primary">
          {userData ? 'Save' : 'Add'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PopupAlterUser;
