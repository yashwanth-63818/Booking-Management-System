import React, { useState, useMemo, useEffect } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, TextField, InputAdornment,
  MenuItem, Button, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Paper, Chip, IconButton, Tooltip, Dialog, DialogTitle,
  DialogContent, DialogActions, Divider
} from '@mui/material';
import {
  Search as SearchIcon,
  Login as CheckInIcon,
  Logout as CheckOutIcon,
  Event as ExtendIcon,
  SyncAlt as ChangeRoomIcon,
  Visibility as ViewIcon,
  Receipt as ReceiptIcon,
  Hotel as HotelIcon,
  People as PeopleIcon,
  EventAvailable as EventAvailableIcon,
  EventNote as EventNoteIcon
} from '@mui/icons-material';

import { useUI } from '../context/UIContext';
import { bookingsData as initialBookings, roomsData } from '../services/dummyData';
import EmptyState from '../components/EmptyState';

// Helper functions for colors
const getStatusColor = (status) => {
  switch (status) {
    case 'Confirmed': return 'info.main';
    case 'Checked In': return 'success.main';
    case 'Checked Out': return 'text.secondary';
    case 'Pending': return 'warning.main';
    case 'Cancelled': return 'error.main';
    default: return 'text.secondary';
  }
};

const getPaymentColor = (balance) => {
  if (balance <= 0) return 'success.main'; // Paid
  if (balance > 0 && balance < 500) return 'warning.main'; // Partial (assuming some advance)
  return 'error.main'; // Pending
};

const getPaymentLabel = (balance, grandTotal) => {
  if (balance <= 0) return 'Paid';
  if (balance < grandTotal) return 'Partial';
  return 'Pending';
};

const StatCard = ({ title, value, icon, color }) => (
  <Card sx={{ height: '100%', borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
    <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 3 }}>
      <Box>
        <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600, mb: 1, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          {title}
        </Typography>
        <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary' }}>
          {value}
        </Typography>
      </Box>
      <Box sx={{ width: 56, height: 56, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: `${color}15`, color }}>
        {icon}
      </Box>
    </CardContent>
  </Card>
);

const Reception = () => {
  const { showSnackbar, showDialog } = useUI();
  const [bookings, setBookings] = useState(initialBookings);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modals state
  const [openCheckIn, setOpenCheckIn] = useState(false);
  const [openCheckOut, setOpenCheckOut] = useState(false);
  const [openExtend, setOpenExtend] = useState(false);
  const [openChangeRoom, setOpenChangeRoom] = useState(false);
  const [openView, setOpenView] = useState(false);

  const [currentBooking, setCurrentBooking] = useState(null);
  const [extendDate, setExtendDate] = useState('');
  const [newRoom, setNewRoom] = useState('');

  // Dashboard Stats
  const todayStr = '2026-07-06'; // Since we are in 2026-07-06 according to metadata
  const todaysCheckIns = bookings.filter(b => b.checkIn === todayStr).length;
  const todaysCheckOuts = bookings.filter(b => b.checkOut === todayStr).length;
  const currentGuestsCount = bookings.filter(b => b.status === 'Checked In').reduce((acc, b) => acc + b.guests, 0);
  const upcomingArrivals = bookings.filter(b => b.status === 'Confirmed').length;

  // Handlers
  const handleActionClick = (action, booking) => {
    setCurrentBooking(booking);
    if (action === 'checkin') {
      if (booking.status === 'Checked In') {
         showSnackbar('Guest is already checked in.', 'warning');
         return;
      }
      setOpenCheckIn(true);
    }
    if (action === 'checkout') setOpenCheckOut(true);
    if (action === 'extend') {
      setExtendDate(booking.checkOut);
      setOpenExtend(true);
    }
    if (action === 'changeRoom') {
      setNewRoom(booking.room);
      setOpenChangeRoom(true);
    }
    if (action === 'view') setOpenView(true);
    if (action === 'receipt') {
      showSnackbar('Receipt downloading...', 'info');
    }
  };

  const confirmCheckIn = () => {
    // Basic validation
    if (!currentBooking.room) {
      showSnackbar('Please assign a room first.', 'error');
      return;
    }
    setBookings(bookings.map(b => b.id === currentBooking.id ? { ...b, status: 'Checked In' } : b));
    setOpenCheckIn(false);
    showSnackbar(`${currentBooking.customerName} checked in successfully.`, 'success');
  };

  const confirmCheckOut = () => {
    if (currentBooking.balance > 0) {
       showDialog({
         title: 'Pending Payment',
         content: `Guest has a pending balance of $${currentBooking.balance}. Continue with checkout?`,
         confirmText: 'Yes, Checkout',
         onConfirm: () => processCheckOut()
       });
       return;
    }
    processCheckOut();
  };

  const processCheckOut = () => {
    setBookings(bookings.map(b => b.id === currentBooking.id ? { ...b, status: 'Checked Out' } : b));
    setOpenCheckOut(false);
    showSnackbar(`${currentBooking.customerName} checked out successfully.`, 'success');
  };

  const confirmExtend = () => {
    if (!extendDate) return showSnackbar('Please select a date', 'error');
    if (new Date(extendDate) <= new Date(currentBooking.checkOut)) {
      return showSnackbar('New check-out date must be after current check-out date', 'error');
    }
    setBookings(bookings.map(b => b.id === currentBooking.id ? { ...b, checkOut: extendDate } : b));
    setOpenExtend(false);
    showSnackbar('Stay extended successfully', 'success');
  };

  const confirmChangeRoom = () => {
    if (!newRoom) return showSnackbar('Please select a room', 'error');
    if (newRoom === currentBooking.room) return showSnackbar('Please select a different room', 'warning');
    
    // Check if new room is available
    const roomIsAvailable = roomsData.find(r => r.roomNumber === newRoom)?.status === 'Available';
    if (!roomIsAvailable) {
       // Just a warning for mock purpose, we will allow it
       showSnackbar('Selected room might not be available.', 'warning');
    }

    setBookings(bookings.map(b => b.id === currentBooking.id ? { ...b, room: newRoom } : b));
    setOpenChangeRoom(false);
    showSnackbar(`Room changed to ${newRoom}`, 'success');
  };

  const filteredBookings = useMemo(() => {
    return bookings.filter(b => {
      const matchesSearch = 
        b.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.room.includes(searchQuery) ||
        b.phone.includes(searchQuery);
      
      const matchesDate = dateFilter ? (b.checkIn === dateFilter || b.checkOut === dateFilter) : true;
      const matchesStatus = statusFilter === 'All' ? true : b.status === statusFilter;
      
      return matchesSearch && matchesDate && matchesStatus;
    });
  }, [bookings, searchQuery, dateFilter, statusFilter]);

  const availableRooms = roomsData.filter(r => r.status === 'Available' || r.status === 'Cleaning');


  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary' }}>
          Reception
        </Typography>
      </Box>

      {/* Dashboard Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Today's Check-ins" value={todaysCheckIns} icon={<CheckInIcon fontSize="large" />} color="#2e7d32" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Today's Check-outs" value={todaysCheckOuts} icon={<CheckOutIcon fontSize="large" />} color="#d32f2f" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Current Guests" value={currentGuestsCount} icon={<PeopleIcon fontSize="large" />} color="#1976d2" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Upcoming Arrivals" value={upcomingArrivals} icon={<EventAvailableIcon fontSize="large" />} color="#ed6c02" />
        </Grid>
      </Grid>

      {/* Search & Filters */}
      <Card sx={{ mb: 4, borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        <CardContent sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
          <TextField
            placeholder="Search Name, Booking ID, Room..."
            variant="outlined"
            size="small"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ flexGrow: 1, minWidth: 250, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            InputProps={{
              startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>,
            }}
          />
          <TextField
            type="date"
            size="small"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            sx={{ minWidth: 150, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          />
          <TextField
            select
            size="small"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            sx={{ minWidth: 150, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          >
            {['All', 'Confirmed', 'Checked In', 'Checked Out', 'Pending'].map(option => (
              <MenuItem key={option} value={option}>{option}</MenuItem>
            ))}
          </TextField>
        </CardContent>
      </Card>

      {/* Table */}
      <Card sx={{ borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        <TableContainer>
          <Table sx={{ minWidth: 1000 }}>
            <TableHead>
              <TableRow sx={{ bgcolor: 'rgba(111, 78, 55, 0.05)' }}>
                <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>BOOKING ID</TableCell>
                <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>GUEST NAME</TableCell>
                <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>ROOM</TableCell>
                <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>DATES</TableCell>
                <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>STATUS</TableCell>
                <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>PAYMENT</TableCell>
                <TableCell sx={{ fontWeight: 600, color: 'text.secondary', textAlign: 'right' }}>ACTIONS</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredBookings.length > 0 ? filteredBookings.map((row) => (
                <TableRow key={row.id} hover>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main' }}>
                      {row.id}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{row.customerName}</Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>{row.phone}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={row.room} size="small" sx={{ fontWeight: 600, bgcolor: 'background.default' }} />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ color: 'text.primary', fontSize: '0.8rem' }}>In: {row.checkIn}</Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>Out: {row.checkOut}</Typography>
                  </TableCell>
                  <TableCell>
                     <Chip 
                        label={row.status} 
                        size="small" 
                        sx={{ bgcolor: getStatusColor(row.status), color: '#fff', fontWeight: 600, fontSize: '0.7rem' }} 
                     />
                  </TableCell>
                  <TableCell>
                    <Chip 
                        label={getPaymentLabel(row.balance, row.grandTotal)} 
                        size="small" 
                        sx={{ bgcolor: getPaymentColor(row.balance), color: '#fff', fontWeight: 600, fontSize: '0.7rem' }} 
                     />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Check In">
                      <span>
                        <IconButton size="small" onClick={() => handleActionClick('checkin', row)} disabled={row.status === 'Checked In' || row.status === 'Checked Out'} sx={{ color: 'success.main', mr: 0.5 }}>
                          <CheckInIcon fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>
                    <Tooltip title="Check Out">
                       <span>
                        <IconButton size="small" onClick={() => handleActionClick('checkout', row)} disabled={row.status !== 'Checked In'} sx={{ color: 'error.main', mr: 0.5 }}>
                          <CheckOutIcon fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>
                    <Tooltip title="Extend Stay">
                      <span>
                        <IconButton size="small" onClick={() => handleActionClick('extend', row)} disabled={row.status === 'Checked Out'} sx={{ color: 'primary.main', mr: 0.5 }}>
                          <ExtendIcon fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>
                    <Tooltip title="Change Room">
                      <span>
                        <IconButton size="small" onClick={() => handleActionClick('changeRoom', row)} disabled={row.status === 'Checked Out'} sx={{ color: 'warning.main', mr: 0.5 }}>
                          <ChangeRoomIcon fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>
                    <Tooltip title="View Details">
                      <IconButton size="small" onClick={() => handleActionClick('view', row)} sx={{ color: 'info.main', mr: 0.5 }}>
                        <ViewIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Print Receipt">
                      <IconButton size="small" onClick={() => handleActionClick('receipt', row)} sx={{ color: 'text.secondary' }}>
                        <ReceiptIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={7} sx={{ py: 5 }}>
                    <EmptyState icon={<HotelIcon sx={{ fontSize: 60 }} />} title="No Bookings Found" description="Try adjusting your search or filters." />
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Modals */}
      {currentBooking && (
        <>
          {/* Check-In Modal */}
          <Dialog open={openCheckIn} onClose={() => setOpenCheckIn(false)} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ fontWeight: 700, borderBottom: '1px solid', borderColor: 'divider' }}>Check In Guest</DialogTitle>
            <DialogContent sx={{ p: 3, pt: 4 }}>
              <Typography variant="body1" sx={{ mb: 2 }}>
                Confirm check-in for <strong>{currentBooking.customerName}</strong> to Room <strong>{currentBooking.room}</strong>?
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
                Check-out Date: {currentBooking.checkOut} <br/>
                Balance Due: ${currentBooking.balance}
              </Typography>
            </DialogContent>
            <DialogActions sx={{ p: 3, pt: 0 }}>
              <Button onClick={() => setOpenCheckIn(false)} color="inherit">Cancel</Button>
              <Button onClick={confirmCheckIn} variant="contained" color="success">Confirm Check-in</Button>
            </DialogActions>
          </Dialog>

          {/* Check-Out Modal */}
          <Dialog open={openCheckOut} onClose={() => setOpenCheckOut(false)} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ fontWeight: 700, borderBottom: '1px solid', borderColor: 'divider' }}>Check Out Guest</DialogTitle>
            <DialogContent sx={{ p: 3, pt: 4 }}>
               <Typography variant="body1" sx={{ mb: 2 }}>
                Ready to check out <strong>{currentBooking.customerName}</strong> from Room <strong>{currentBooking.room}</strong>?
              </Typography>
              {currentBooking.balance > 0 && (
                <Box sx={{ p: 2, bgcolor: 'warning.light', color: 'warning.contrastText', borderRadius: 2, mb: 2 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    Warning: Guest has an outstanding balance of ${currentBooking.balance}.
                  </Typography>
                </Box>
              )}
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Total Charges: ${currentBooking.grandTotal} <br/>
              </Typography>
            </DialogContent>
            <DialogActions sx={{ p: 3, pt: 0 }}>
              <Button onClick={() => setOpenCheckOut(false)} color="inherit">Cancel</Button>
              <Button onClick={confirmCheckOut} variant="contained" color="error">Complete Check-out</Button>
            </DialogActions>
          </Dialog>

          {/* Extend Stay Modal */}
          <Dialog open={openExtend} onClose={() => setOpenExtend(false)} maxWidth="xs" fullWidth>
            <DialogTitle sx={{ fontWeight: 700, borderBottom: '1px solid', borderColor: 'divider' }}>Extend Stay</DialogTitle>
            <DialogContent sx={{ p: 3, pt: 4 }}>
              <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
                Current Check-out: <strong>{currentBooking.checkOut}</strong>
              </Typography>
              <TextField 
                fullWidth 
                type="date" 
                label="New Check-out Date" 
                size="small" 
                value={extendDate} 
                onChange={(e) => setExtendDate(e.target.value)} 
                InputLabelProps={{ shrink: true }}
                required 
              />
            </DialogContent>
            <DialogActions sx={{ p: 3, pt: 0 }}>
              <Button onClick={() => setOpenExtend(false)} color="inherit">Cancel</Button>
              <Button onClick={confirmExtend} variant="contained" color="primary">Extend</Button>
            </DialogActions>
          </Dialog>

          {/* Change Room Modal */}
          <Dialog open={openChangeRoom} onClose={() => setOpenChangeRoom(false)} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ fontWeight: 700, borderBottom: '1px solid', borderColor: 'divider' }}>Change Room</DialogTitle>
            <DialogContent sx={{ p: 3, pt: 4 }}>
              <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
                Current Room: <strong>{currentBooking.room}</strong>
              </Typography>
              <TextField 
                fullWidth 
                select
                label="Select New Room" 
                size="small" 
                value={newRoom} 
                onChange={(e) => setNewRoom(e.target.value)} 
              >
                {availableRooms.map(r => (
                  <MenuItem key={r.id} value={r.roomNumber}>
                    Room {r.roomNumber} - {r.type} (${r.price}/night)
                  </MenuItem>
                ))}
              </TextField>
            </DialogContent>
            <DialogActions sx={{ p: 3, pt: 0 }}>
              <Button onClick={() => setOpenChangeRoom(false)} color="inherit">Cancel</Button>
              <Button onClick={confirmChangeRoom} variant="contained" color="primary">Change Room</Button>
            </DialogActions>
          </Dialog>

          {/* View Booking Modal */}
          <Dialog open={openView} onClose={() => setOpenView(false)} maxWidth="md" fullWidth>
            <DialogTitle sx={{ fontWeight: 700, borderBottom: '1px solid', borderColor: 'divider' }}>
              Booking Details - {currentBooking.id}
            </DialogTitle>
            <DialogContent sx={{ p: 4 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="overline" color="text.secondary">Guest Information</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>{currentBooking.customerName}</Typography>
                  <Typography variant="body2" color="text.secondary">{currentBooking.phone}</Typography>
                  <Typography variant="body2" color="text.secondary">{currentBooking.email}</Typography>
                  <Typography variant="body2" color="text.secondary">ID: {currentBooking.idProofType} ({currentBooking.idNumber})</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="overline" color="text.secondary">Stay Details</Typography>
                  <Typography variant="body2"><strong>Room:</strong> {currentBooking.room}</Typography>
                  <Typography variant="body2"><strong>Check-in:</strong> {currentBooking.checkIn}</Typography>
                  <Typography variant="body2"><strong>Check-out:</strong> {currentBooking.checkOut}</Typography>
                  <Typography variant="body2"><strong>Guests:</strong> {currentBooking.guests}</Typography>
                  <Typography variant="body2"><strong>Status:</strong> {currentBooking.status}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                </Grid>
                <Grid item xs={12}>
                   <Typography variant="overline" color="text.secondary">Payment Summary</Typography>
                   <Grid container spacing={2}>
                      <Grid item xs={4}>
                         <Typography variant="body2" color="text.secondary">Room Charges</Typography>
                         <Typography variant="body1" sx={{ fontWeight: 600 }}>${currentBooking.roomCharges}</Typography>
                      </Grid>
                      <Grid item xs={4}>
                         <Typography variant="body2" color="text.secondary">Taxes</Typography>
                         <Typography variant="body1" sx={{ fontWeight: 600 }}>${currentBooking.gst}</Typography>
                      </Grid>
                      <Grid item xs={4}>
                         <Typography variant="body2" color="text.secondary">Total</Typography>
                         <Typography variant="body1" sx={{ fontWeight: 600 }}>${currentBooking.grandTotal}</Typography>
                      </Grid>
                      <Grid item xs={4}>
                         <Typography variant="body2" color="text.secondary">Advance Paid</Typography>
                         <Typography variant="body1" sx={{ fontWeight: 600, color: 'success.main' }}>${currentBooking.advance}</Typography>
                      </Grid>
                      <Grid item xs={4}>
                         <Typography variant="body2" color="text.secondary">Balance Due</Typography>
                         <Typography variant="body1" sx={{ fontWeight: 600, color: currentBooking.balance > 0 ? 'error.main' : 'text.primary' }}>${currentBooking.balance}</Typography>
                      </Grid>
                   </Grid>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions sx={{ p: 3, pt: 0 }}>
              <Button onClick={() => setOpenView(false)} variant="contained" color="inherit" sx={{ fontWeight: 600 }}>Close</Button>
            </DialogActions>
          </Dialog>
        </>
      )}
    </Box>
  );
};

export default Reception;
