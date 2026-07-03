import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const OccupancyChart = ({ data }) => {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
          Occupancy Overview
        </Typography>
        <Box sx={{ width: '100%', height: 300 }}>
          <ResponsiveContainer>
            <AreaChart
              data={data}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorOccupied" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#795548" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#795548" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorAvailable" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#888', fontSize: 12}} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#888', fontSize: 12}} />
              <Tooltip 
                contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
              />
              <Area type="monotone" dataKey="available" stroke="#8884d8" fillOpacity={1} fill="url(#colorAvailable)" />
              <Area type="monotone" dataKey="occupied" stroke="#795548" fillOpacity={1} fill="url(#colorOccupied)" />
            </AreaChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
};

export default OccupancyChart;
