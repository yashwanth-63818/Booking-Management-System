import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Checkbox, FormControlLabel, Paper, InputAdornment, IconButton, Link, CircularProgress, Avatar } from '@mui/material';
import { Visibility, VisibilityOff, Hotel as HotelIcon, LockOutlined as LockOutlinedIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { styled } from '@mui/material/styles';

const LoginContainer = styled(Box)(({ theme }) => ({
  height: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundImage: 'url("https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80")',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  }
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  position: 'relative',
  padding: theme.spacing(6),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  width: '100%',
  maxWidth: 450,
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(10px)',
  animation: 'fadeInUp 0.8s ease-out forwards',
  '@keyframes fadeInUp': {
    from: { opacity: 0, transform: 'translateY(40px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
  }
}));

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('admin@kachinn.com'); // Default for testing
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    
    setLoading(true);
    setError('');
    
    const response = await login(email, password);
    if (response.success) {
      navigate('/');
    } else {
      setError(response.message || 'Invalid email or password');
      setLoading(false);
    }
  };

  return (
    <LoginContainer>
      <StyledPaper elevation={0}>
        <Box sx={{ mb: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Avatar sx={{ 
            m: 1, 
            bgcolor: 'primary.main', 
            color: 'primary.contrastText', 
            width: 56, 
            height: 56 
          }}>
            <HotelIcon fontSize="large" />
          </Avatar>
          <Typography component="h1" variant="h4" sx={{ fontWeight: 800, color: 'text.primary', mb: 1 }}>
            LuxeStay
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Receptionist Management Portal
          </Typography>
        </Box>

        <Box component="form" onSubmit={handleLogin} sx={{ width: '100%' }}>
          {error && (
            <Typography color="error" variant="body2" sx={{ mb: 2, textAlign: 'center', bgcolor: 'error.light', p: 1, borderRadius: 1, color: 'error.dark' }}>
              {error}
            </Typography>
          )}
          
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            sx={{ mb: 2 }}
          />
          
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type={showPassword ? 'text' : 'password'}
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
              startAdornment: (
                <InputAdornment position="start">
                  <LockOutlinedIcon color="action" />
                </InputAdornment>
              ),
            }}
          />
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1, mb: 3 }}>
            <FormControlLabel
              control={<Checkbox value="remember" color="primary" sx={{ '&.Mui-checked': { color: 'primary.main' } }} />}
              label={<Typography variant="body2" color="text.secondary">Remember me</Typography>}
            />
            <Link href="#" variant="body2" sx={{ color: 'primary.main', textDecoration: 'none', fontWeight: 600, '&:hover': { textDecoration: 'underline' } }}>
              Forgot password?
            </Link>
          </Box>
          
          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
            sx={{ 
              mt: 3, 
              mb: 2, 
              py: 1.5, 
              fontWeight: 700,
              fontSize: '1rem'
            }}
          >
            {loading ? <CircularProgress size={26} color="inherit" /> : 'Login'}
          </Button>
        </Box>
      </StyledPaper>
    </LoginContainer>
  );
};

export default Login;
