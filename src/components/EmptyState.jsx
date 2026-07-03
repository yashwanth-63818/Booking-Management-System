import React from 'react';
import { Box, Typography, Button } from '@mui/material';

const EmptyState = ({ icon, title, description, actionText, onAction }) => {
  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center',
        p: 6,
        textAlign: 'center',
        bgcolor: 'background.paper',
        borderRadius: 4,
        boxShadow: 1
      }}
    >
      <Box sx={{ color: 'text.secondary', mb: 2, opacity: 0.5 }}>
        {icon}
      </Box>
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 400 }}>
        {description}
      </Typography>
      {actionText && onAction && (
        <Button variant="contained" color="primary" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </Box>
  );
};

export default EmptyState;
