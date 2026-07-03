import React from 'react';
import { Card, CardContent, Typography, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Avatar } from '@mui/material';

const getStatusColor = (status) => {
  switch (status) {
    case 'Checked In': return 'success';
    case 'Confirmed': return 'info';
    case 'Pending': return 'warning';
    case 'Checked Out': return 'default';
    default: return 'default';
  }
};

const RecentBookings = ({ bookings }) => {
  return (
    <Card sx={{ overflow: 'hidden' }}>
      <CardContent sx={{ p: 0 }}>
        <Box sx={{ p: 3, borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Recent Bookings
          </Typography>
        </Box>
        <TableContainer sx={{ maxHeight: 400 }}>
          <Table stickyHeader aria-label="recent bookings table">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, color: '#a1a5b7' }}>ID</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#a1a5b7' }}>Guest</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#a1a5b7' }}>Room Type</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#a1a5b7' }}>Check In</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#a1a5b7' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#a1a5b7' }}>Amount</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {bookings.map((row) => (
                <TableRow hover key={row.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell component="th" scope="row" sx={{ fontWeight: 500 }}>
                    {row.id}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar sx={{ width: 30, height: 30, bgcolor: 'primary.main', fontSize: '0.875rem' }}>
                        {row.guestName.charAt(0)}
                      </Avatar>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>{row.guestName}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{row.roomType}</TableCell>
                  <TableCell>{row.checkIn}</TableCell>
                  <TableCell>
                    <Chip 
                      label={row.status} 
                      color={getStatusColor(row.status)} 
                      size="small" 
                      sx={{ borderRadius: 1, fontWeight: 500 }}
                    />
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>${row.amount}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
};

export default RecentBookings;
