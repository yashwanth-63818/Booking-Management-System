import React, { useState, useMemo, useEffect } from 'react';
import {
  Box, Typography, Button, TextField, Grid, Card, CardContent,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Chip, Dialog, DialogTitle, DialogContent, DialogActions, MenuItem, InputAdornment,
  IconButton, Tooltip, Divider, ToggleButton, ToggleButtonGroup, Avatar, Menu,
  Skeleton
} from '@mui/material';
import {
  Add as AddIcon, Search as SearchIcon, Edit as EditIcon,
  ViewModule as GridIcon, ViewList as ListIcon, MoreVert as MoreVertIcon,
  Visibility as ViewIcon, ExitToApp as CheckOutIcon, Event as ExtendIcon,
  Group as GroupIcon
} from '@mui/icons-material';
import { guestsData as initialGuestsData } from '../services/dummyData';
import EmptyState from '../components/EmptyState';
import { useUI } from '../context/UIContext';

const getPaymentStatusColor = (status) => {
  switch(status) {
    case 'Paid': return 'success.main'; 
    case 'Pending': return 'error.main'; 
    case 'Partial': return 'warning.main'; 
    default: return 'text.secondary';
  }
};

const getBookingStatusColor = (status) => {
  switch(status) {
    case 'In-House': return 'info.main'; 
    case 'Checked-out': return 'text.secondary'; 
    default: return 'text.secondary';
  }
};

const defaultGuest = {
  id: '', photo: '', name: '', phone: '', email: '',
  roomNumber: '', checkIn: '', checkOut: '', paymentStatus: 'Pending', status: 'In-House'
};

const Guests = () => {
  const [guests, setGuests] = useState(initialGuestsData);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [viewMode, setViewMode] = useState('grid');
  const [isLoading, setIsLoading] = useState(true);
  const { showSnackbar, showDialog } = useUI();

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  // Dialogs state
  const [openView, setOpenView] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openExtend, setOpenExtend] = useState(false);
  
  const [currentGuest, setCurrentGuest] = useState(defaultGuest);
  const [extendDate, setExtendDate] = useState('');

  // Action Menu state (for Grid view)
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuGuestId, setMenuGuestId] = useState(null);
  const openMenu = Boolean(anchorEl);

  const handleMenuClick = (event, guest) => {
    setAnchorEl(event.currentTarget);
    setMenuGuestId(guest.id);
    setCurrentGuest(guest);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuGuestId(null);
  };

  const handleOpenView = (guest) => {
    setCurrentGuest(guest);
    setOpenView(true);
    handleMenuClose();
  };

  const handleOpenEdit = (guest) => {
    setCurrentGuest(guest);
    setOpenEdit(true);
    handleMenuClose();
  };

  const handleOpenExtend = (guest) => {
    setCurrentGuest(guest);
    setExtendDate(guest.checkOut);
    setOpenExtend(true);
    handleMenuClose();
  };

  const handleCheckOut = (guest) => {
    handleMenuClose();
    showDialog({
      title: 'Check Out Guest',
      content: `Are you sure you want to check out ${guest.name}?`,
      confirmText: 'Check Out',
      onConfirm: () => {
        setGuests(guests.map(g => g.id === guest.id ? { ...g, status: 'Checked-out' } : g));
        showSnackbar(`${guest.name} checked out successfully`, "info");
      }
    });
  };

  const handleSaveEdit = () => {
    setGuests(guests.map(g => g.id === currentGuest.id ? currentGuest : g));
    setOpenEdit(false);
    showSnackbar("Guest details updated", "success");
  };

  const handleSaveExtend = () => {
    setGuests(guests.map(g => g.id === currentGuest.id ? { ...g, checkOut: extendDate } : g));
    setOpenExtend(false);
    showSnackbar(`Stay extended to ${extendDate}`, "success");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCurrentGuest(prev => ({ ...prev, [name]: value }));
  };

  const filteredGuests = useMemo(() => {
    return guests.filter(g => {
      const matchesSearch = g.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            g.roomNumber.includes(searchQuery) ||
                            g.phone.includes(searchQuery);
      const matchesStatus = filterStatus === 'All' ? true : g.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [guests, searchQuery, filterStatus]);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary' }}>
          Guest Management
        </Typography>
      </Box>

      {/* Filters/Search/View Controls */}
      <Card sx={{ mb: 4 }}>
        <CardContent sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', flexGrow: 1 }}>
            <TextField
              placeholder="Search Name, Room, or Phone..."
              variant="outlined"
              size="small"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ 
                minWidth: 250,
                flexGrow: 1,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                  bgcolor: 'rgba(111, 78, 55, 0.04)',
                  '&:hover fieldset': { borderColor: 'primary.main' },
                }
              }}
              InputProps={{
                startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>,
              }}
            />
            <TextField
              select
              size="small"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              sx={{ minWidth: 150 }}
            >
              {['All', 'In-House', 'Checked-out'].map(option => (
                <MenuItem key={option} value={option}>{option}</MenuItem>
              ))}
            </TextField>
          </Box>
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(e, val) => val && setViewMode(val)}
            size="small"
          >
            <ToggleButton value="grid" aria-label="grid view">
              <GridIcon />
            </ToggleButton>
            <ToggleButton value="list" aria-label="list view">
              <ListIcon />
            </ToggleButton>
          </ToggleButtonGroup>
        </CardContent>
      </Card>

      {/* Card View */}
      {viewMode === 'grid' && (
        isLoading ? (
          <Grid container spacing={3}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={i}>
                <Card sx={{ height: '100%' }}>
                  <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', pt: 4 }}>
                    <Skeleton variant="circular" width={80} height={80} sx={{ mb: 2 }} />
                    <Skeleton variant="text" width="60%" height={30} />
                    <Skeleton variant="text" width="40%" />
                    <Skeleton variant="rectangular" width="80%" height={24} sx={{ my: 2 }} />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Grid container spacing={3}>
            {filteredGuests.map(guest => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={guest.id}>
                <Card sx={{ height: '100%', position: 'relative' }}>
                  <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', pt: 4 }}>
                    <IconButton 
                      size="small" 
                      onClick={(e) => handleMenuClick(e, guest)}
                      sx={{ position: 'absolute', top: 8, right: 8 }}
                    >
                      <MoreVertIcon />
                    </IconButton>
                    
                    <Avatar src={guest.photo} sx={{ width: 80, height: 80, mb: 2 }} />
                    
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>{guest.name}</Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>{guest.email}</Typography>
                    
                    <Box sx={{ display: 'flex', gap: 1, mb: 2, width: '100%', justifyContent: 'center' }}>
                      <Chip label={`Room ${guest.roomNumber}`} size="small" sx={{ bgcolor: 'background.default', fontWeight: 600 }} />
                      <Chip 
                        label={guest.status} 
                        size="small" 
                        sx={{ bgcolor: `${getBookingStatusColor(guest.status)}`, color: 'primary.contrastText', fontWeight: 600 }} 
                      />
                    </Box>
                    
                    <Divider sx={{ width: '100%', my: 1.5 }} />
                    
                    <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>Check In</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{guest.checkIn}</Typography>
                    </Box>
                    <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>Check Out</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{guest.checkOut}</Typography>
                    </Box>
                    
                    <Chip 
                      label={guest.paymentStatus} 
                      size="small" 
                      sx={{ 
                        width: '100%',
                        bgcolor: `${getPaymentStatusColor(guest.paymentStatus)}`, 
                        color: 'primary.contrastText', 
                        fontWeight: 600
                      }} 
                    />
                  </CardContent>
                </Card>
              </Grid>
            ))}
            {filteredGuests.length === 0 && (
               <Grid item xs={12}>
                 <EmptyState 
                    icon={<GroupIcon sx={{ fontSize: 80 }} />}
                    title="No Guests Found"
                    description="There are no guests matching your criteria."
                    actionText="Clear Search"
                    onAction={() => setSearchQuery('')}
                  />
               </Grid>
            )}
          </Grid>
        )
      )}

      {/* Grid Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={openMenu}
        onClose={handleMenuClose}
        PaperProps={{ sx: { minWidth: 150 } }}
      >
        <MenuItem onClick={() => handleOpenView(currentGuest)}><ViewIcon sx={{ mr: 1, fontSize: 20, color: 'info.main' }}/> View Profile</MenuItem>
        <MenuItem onClick={() => handleOpenEdit(currentGuest)}><EditIcon sx={{ mr: 1, fontSize: 20, color: 'warning.main' }}/> Edit Details</MenuItem>
        <MenuItem onClick={() => handleOpenExtend(currentGuest)} disabled={currentGuest.status === 'Checked-out'}><ExtendIcon sx={{ mr: 1, fontSize: 20, color: 'primary.main' }}/> Extend Stay</MenuItem>
        <Divider />
        <MenuItem onClick={() => handleCheckOut(currentGuest)} disabled={currentGuest.status === 'Checked-out'}><CheckOutIcon sx={{ mr: 1, fontSize: 20, color: 'error.main' }}/> Check Out</MenuItem>
      </Menu>

      {/* Table View */}
      {viewMode === 'list' && (
        <Card>
          <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 0 }}>
            <Table sx={{ minWidth: 800 }}>
              <TableHead>
                <TableRow sx={{ bgcolor: 'background.default' }}>
                  <TableCell sx={{ fontWeight: 700, color: 'text.secondary', letterSpacing: '0.05em' }}>GUEST</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: 'text.secondary', letterSpacing: '0.05em' }}>CONTACT</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: 'text.secondary', letterSpacing: '0.05em' }}>ROOM</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: 'text.secondary', letterSpacing: '0.05em' }}>CHECK IN/OUT</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: 'text.secondary', letterSpacing: '0.05em' }}>STATUS</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: 'text.secondary', textAlign: 'right', letterSpacing: '0.05em' }}>ACTIONS</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading ? (
                  Array.from(new Array(5)).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell><Box display="flex" alignItems="center" gap={2}><Skeleton variant="circular" width={40} height={40} /><Box><Skeleton width={100} /><Skeleton width={60} /></Box></Box></TableCell>
                      <TableCell><Skeleton width="80%" /><Skeleton width="60%" /></TableCell>
                      <TableCell><Skeleton width="50%" /></TableCell>
                      <TableCell><Skeleton width="80%" /><Skeleton width="80%" /></TableCell>
                      <TableCell><Skeleton width="80%" height={24} sx={{ mb: 1 }} /><Skeleton width="60%" height={20} /></TableCell>
                      <TableCell align="right"><Skeleton width={120} sx={{ ml: 'auto' }} /></TableCell>
                    </TableRow>
                  ))
                ) : filteredGuests.length > 0 ? (
                  filteredGuests.map((row) => (
                    <TableRow key={row.id} sx={{ '&:last-child td, &:last-child th': { border: 0 }, '&:hover': { bgcolor: 'action.hover' } }}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar src={row.photo} sx={{ width: 40, height: 40 }} />
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>{row.name}</Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>{row.id}</Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ color: 'text.primary' }}>{row.phone}</Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>{row.email}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: 'info.main' }}>{row.roomNumber}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ color: 'text.primary' }}>In: {row.checkIn}</Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>Out: {row.checkOut}</Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, alignItems: 'flex-start' }}>
                          <Chip label={row.status} size="small" sx={{ bgcolor: getBookingStatusColor(row.status), color: 'primary.contrastText', fontWeight: 600 }} />
                          <Chip label={row.paymentStatus} size="small" sx={{ bgcolor: getPaymentStatusColor(row.paymentStatus), color: 'primary.contrastText', fontWeight: 600, fontSize: '0.7rem', height: 20 }} />
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="View Profile">
                          <IconButton size="small" onClick={() => handleOpenView(row)} sx={{ bgcolor: 'rgba(2, 136, 209, 0.08)', color: 'info.main', '&:hover': { bgcolor: 'info.main', color: '#fff' }, mr: 0.5 }}>
                            <ViewIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit">
                          <IconButton size="small" onClick={() => handleOpenEdit(row)} sx={{ bgcolor: 'rgba(237, 108, 2, 0.08)', color: 'warning.main', '&:hover': { bgcolor: 'warning.main', color: '#fff' }, mr: 0.5 }}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Extend Stay">
                          <span>
                            <IconButton size="small" onClick={() => handleOpenExtend(row)} disabled={row.status === 'Checked-out'} sx={{ bgcolor: 'rgba(111, 78, 55, 0.08)', color: 'primary.main', '&:hover': { bgcolor: 'primary.main', color: '#fff' }, mr: 0.5 }}>
                              <ExtendIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                        <Tooltip title="Check Out">
                           <span>
                            <IconButton size="small" onClick={() => handleCheckOut(row)} disabled={row.status === 'Checked-out'} sx={{ bgcolor: 'rgba(211, 47, 47, 0.08)', color: 'error.main', '&:hover': { bgcolor: 'error.main', color: '#fff' } }}>
                              <CheckOutIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                      <EmptyState 
                        icon={<GroupIcon sx={{ fontSize: 80 }} />}
                        title="No Guests Found"
                        description="There are no guests matching your criteria."
                        actionText="Clear Search"
                        onAction={() => setSearchQuery('')}
                      />
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      {/* View Profile Dialog */}
      <Dialog open={openView} onClose={() => setOpenView(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ borderBottom: '1px solid', borderColor: 'divider', pb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>Guest Profile</Typography>
        </DialogTitle>
        <DialogContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
             <Avatar src={currentGuest.photo} sx={{ width: 100, height: 100, mb: 2 }} />
             <Typography variant="h5" sx={{ fontWeight: 700 }}>{currentGuest.name}</Typography>
             <Typography variant="body1" sx={{ color: 'text.secondary' }}>{currentGuest.id}</Typography>
          </Box>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>PHONE</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>{currentGuest.phone}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>EMAIL</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>{currentGuest.email}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>ROOM NUMBER</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>{currentGuest.roomNumber}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>STATUS</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600, color: getBookingStatusColor(currentGuest.status) }}>{currentGuest.status}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>CHECK IN</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>{currentGuest.checkIn}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>CHECK OUT</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>{currentGuest.checkOut}</Typography>
            </Grid>
            <Grid item xs={12}>
               <Divider sx={{ my: 1 }} />
            </Grid>
             <Grid item xs={12}>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>PAYMENT STATUS</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600, color: getPaymentStatusColor(currentGuest.paymentStatus) }}>{currentGuest.paymentStatus}</Typography>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button onClick={() => setOpenView(false)} color="inherit" sx={{ fontWeight: 600 }}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Guest Dialog */}
      <Dialog open={openEdit} onClose={() => setOpenEdit(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>Edit Guest Details</Typography>
        </DialogTitle>
        <DialogContent sx={{ p: 4 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField fullWidth label="Name" name="name" size="small" value={currentGuest.name} onChange={handleChange} required />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Phone" name="phone" size="small" value={currentGuest.phone} onChange={handleChange} required />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Email" name="email" type="email" size="small" value={currentGuest.email} onChange={handleChange} />
            </Grid>
             <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Room Number" name="roomNumber" size="small" value={currentGuest.roomNumber} onChange={handleChange} required />
            </Grid>
             <Grid item xs={12} sm={6}>
              <TextField fullWidth select label="Payment Status" name="paymentStatus" size="small" value={currentGuest.paymentStatus} onChange={handleChange}>
                {['Paid', 'Pending', 'Partial'].map(option => (
                  <MenuItem key={option} value={option}>{option}</MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={() => setOpenEdit(false)} color="inherit" sx={{ fontWeight: 600 }}>Cancel</Button>
          <Button onClick={handleSaveEdit} variant="contained" color="primary" sx={{ fontWeight: 600 }}>
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Extend Stay Dialog */}
      <Dialog open={openExtend} onClose={() => setOpenExtend(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>Extend Stay</Typography>
        </DialogTitle>
        <DialogContent sx={{ p: 4 }}>
          <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
            Current Check-out: <strong>{currentGuest.checkOut}</strong>
          </Typography>
          <TextField 
            fullWidth 
            type="date" 
            label="New Check-out Date" 
            size="small" 
            value={extendDate} 
            onChange={(e) => setExtendDate(e.target.value)} 
            InputLabelProps={{ shrink: true }} 
            slotProps={{ inputLabel: { shrink: true } }}
            required 
          />
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={() => setOpenExtend(false)} color="inherit" sx={{ fontWeight: 600 }}>Cancel</Button>
          <Button onClick={handleSaveExtend} variant="contained" color="primary" sx={{ fontWeight: 600 }}>
            Confirm Extension
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Guests;
