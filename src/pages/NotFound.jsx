import React from 'react';
import { Box, Typography, Button, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ErrorOutlinedIcon from '@mui/icons-material/ErrorOutlined';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 15, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        <ErrorOutlinedIcon sx={{ fontSize: 100, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h2" sx={{ fontWeight: 700, color: 'text.primary', mb: 1 }}>
          404
        </Typography>
        <Typography variant="h5" sx={{ color: 'text.secondary', mb: 4 }}>
          Oops! The page you're looking for doesn't exist.
        </Typography>
        <Button variant="contained" size="large" onClick={() => navigate('/')} sx={{ bgcolor: 'primary.main', '&:hover': { bgcolor: 'primary.dark' } }}>
          Back to Dashboard
        </Button>
      </Box>
    </Container>
  );
};

export default NotFound;
