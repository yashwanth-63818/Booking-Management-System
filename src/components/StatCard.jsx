import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';

const StatCard = ({ title, value, icon, color }) => {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
        <Box sx={{ 
          bgcolor: `${color}15`, 
          width: 60,
          height: 60,
          borderRadius: 3, 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          mr: 2.5,
          color: color,
          flexShrink: 0
        }}>
          {icon}
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0, flex: 1 }}>
          <Typography variant="subtitle2" color="text.secondary" sx={{ textTransform: 'uppercase', mb: 0.25, opacity: 0.9 }} noWrap>
            {title}
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary', letterSpacing: '-0.02em' }} noWrap>
            {value}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default StatCard;
