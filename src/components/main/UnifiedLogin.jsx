import React, { useState } from 'react';
import { Card, Box, TextField, Button, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useFirebase } from '../../context/Firebase';
import boatImage from '../../assets/images/sailor.png';

const UnifiedLogin = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const theme = useTheme();
    const firebase = useFirebase();

    const handleEmailChange = (event) => setEmail(event.target.value);
    const handlePasswordChange = (event) => setPassword(event.target.value);

    const handleSubmit = async (event) => {
        event.preventDefault(); // Prevent form from submitting the traditional way
        setLoading(true);
        setError(null);

        try {
            const userCredential = await firebase.signinUser(email, password);
            const user = userCredential.user;
            console.log("User details received:", user);

            // if (user.email === 'test.account@smjimpex.np') {
            //     await firebase.putData('users/' + user.uid, { email: user.email, role: 'salesperson',name: 'Test Account' ,password: password });
            // }

            // // Redirect user or update state here
        } catch (error) {
            console.error("Error signing in:", error.message);
            setError("Error signing in: " + error.message);
        } finally {
            setLoading(false); // Reset loading state
        }
    };

    return (
        <Card sx={{ p: 3, mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', borderRadius: '16px' }}>
            <Box sx={{ display: 'flex', alignItems: 'center'}}>
              <img src={boatImage} alt="boat" style={{ width: '70px', height: '70px' }} />
              {/* <Typography
                variant="h4"
                sx={{ fontFamily: 'Raleway', color: '#fcf8ca', marginLeft: '16px' }}
              >
                Sailor
              </Typography> */}
            </Box>
            <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 1 }}>
                <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="email"
                    label="Email Address"
                    name="email"
                    autoComplete="email"
                    autoFocus
                    variant="outlined"
                    value={email}
                    onChange={handleEmailChange}
                />
                <TextField
                    margin="normal"
                    required
                    fullWidth
                    name="password"
                    label="Password"
                    type="password"
                    id="password"
                    autoComplete="current-password"
                    variant="outlined"
                    value={password}
                    onChange={handlePasswordChange}
                />
                {error && (
                    <Typography color="error" variant="body2" sx={{ mt: 2 }}>
                        {error}
                    </Typography>
                )}
                <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    sx={{ mt: 3, mb: 2, color: theme.palette.black.main, borderRadius: '12px' }}
                    disabled={loading}
                >
                    Sign In to Sailor
                </Button>
            </Box>
        </Card>
    );
}

export default UnifiedLogin;
