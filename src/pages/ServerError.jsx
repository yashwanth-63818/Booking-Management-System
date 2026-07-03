import React from 'react';
import { Box, Typography, Button, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';

const ServerError = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 15, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        <ReportProblemIcon sx={{ fontSize: 100, color: 'error.main', mb: 2 }} />
        <Typography variant="h2" sx={{ fontWeight: 700, color: 'text.primary', mb: 1 }}>
          500
        </Typography>
        <Typography variant="h5" sx={{ color: 'text.secondary', mb: 4 }}>
          Internal Server Error. Our team is on it!
        </Typography>
        <Button variant="contained" size="large" onClick={() => navigate('/')} sx={{ bgcolor: 'primary.main', '&:hover': { bgcolor: 'primary.dark' } }}>
          Back to Dashboard
        </Button>
      </Box>
    </Container>
  );
};

export default ServerError;
