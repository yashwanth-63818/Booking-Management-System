import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

const GlobalLoader = () => {
  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        width: '100vw',
        bgcolor: 'background.default'
      }}
    >
      <CircularProgress size={60} thickness={4} color="primary" />
      <Typography variant="h6" color="text.secondary" sx={{ mt: 3, fontWeight: 500 }}>
        Loading Kach Inn...
      </Typography>
    </Box>
  );
};

export default GlobalLoader;
