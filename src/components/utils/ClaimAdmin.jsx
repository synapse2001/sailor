import React, { useState } from 'react';
import {
    Card,
    CardContent,
    CardActions,
    Typography,
    TextField,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
} from '@mui/material';
import { useFirebase } from '../../context/Firebase';

const roles = ['admin'];

const ClaimAdmin = ({ user,setCurrentUserRole }) => {
    const [adminDetails, setAdminDetails] = useState({
        name: '',
        email: '',
        password: '',
        role: 'admin',
        id: ''
    });
    const firebase = useFirebase();

    const handleFieldChange = (field, value) => {
        setAdminDetails(prevDetails => ({ ...prevDetails, [field]: value }));
    };

    const handleAction = async () => {
        if(user.uid === adminDetails.id && adminDetails.email === user.email){
            await firebase.putData('users/' + user.uid, { email: user.email, role: adminDetails.role,name: adminDetails.name ,password: adminDetails.password });
            setCurrentUserRole(adminDetails.role);
        }
    };
    const menuProps = {
        PaperProps: {
          style: {
            backgroundColor: '#333',
            color: 'primary',
          },
        },
      };

    return (
        <Card style={{ maxWidth: 600, margin: '2rem auto', padding: '1rem' }}>
            <CardContent>
                <Typography variant="h5" component="div" gutterBottom>
                    Claim You are Admin
                </Typography>
                <TextField
                    label="Name"
                    value={adminDetails.name}
                    onChange={(e) => handleFieldChange('name', e.target.value)}
                    fullWidth
                    variant="outlined"
                    style={{ marginBottom: '1rem' }}
                />
                <TextField
                    label="Email"
                    value={adminDetails.email}
                    onChange={(e) => handleFieldChange('email', e.target.value)}
                    fullWidth
                    variant="outlined"
                    style={{ marginBottom: '1rem' }}
                />
                <TextField
                    label="UID"
                    value={adminDetails.id}
                    onChange={(e) => handleFieldChange('id', e.target.value)}
                    fullWidth
                    variant="outlined"
                    style={{ marginBottom: '1rem' }}
                />
                <FormControl fullWidth variant="outlined" style={{ marginBottom: '1rem' }}>
                    <InputLabel>Role</InputLabel>
                    <Select
                        value={adminDetails.role}
                        onChange={(e) => handleFieldChange('role', e.target.value)}
                        label="Role"
                        MenuProps={menuProps}
                    >
                        {roles.map(role => (
                            <MenuItem key={role} value={role}>{role}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <TextField
                    label="Password"
                    value={adminDetails.password}
                    onChange={(e) => handleFieldChange('password', e.target.value)}
                    fullWidth
                    variant="outlined"
                    type="password"
                    style={{ marginBottom: '1rem' }}
                />
            </CardContent>
            <CardActions>
                <Button  sx={{marginLeft:'10px'}} onClick={handleAction} color="primary" variant="contained">
                    <Typography style={{color:'black'}}>
                    Add
                    </Typography>
                </Button>
            </CardActions>
        </Card>
    );
};

export default ClaimAdmin;