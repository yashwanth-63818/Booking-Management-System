import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Button, TextField, Grid, Card, CardContent, CardMedia, CardActions, 
  Chip, Dialog, DialogTitle, DialogContent, DialogActions, MenuItem, InputAdornment,
  Divider, IconButton, ToggleButton, ToggleButtonGroup, Skeleton
} from '@mui/material';
import { 
  Add as AddIcon, Search as SearchIcon, KingBed as BedIcon,
  People as PeopleIcon, AcUnit as AcIcon, CleanHands as CleanIcon, Edit as EditIcon,
  Delete as DeleteIcon, Visibility as ViewIcon, EventAvailable as BookIcon,
  Hotel as HotelIcon
} from '@mui/icons-material';
import { roomsData as initialRoomsData } from '../services/dummyData';
import EmptyState from '../components/EmptyState';
import { useUI } from '../context/UIContext';

  const getStatusColor = (status) => {
    switch(status) {
      case 'Available': return 'success.main'; 
      case 'Occupied': return 'error.main'; 
      case 'Reserved': return 'warning.main'; 
      case 'Cleaning': return 'info.main'; 
      default: return 'text.secondary';
    }
  };

const Rooms = () => {
  const [rooms, setRooms] = useState(initialRoomsData);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterAC, setFilterAC] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { showSnackbar, showDialog } = useUI();
  
  // Simulate network request
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  // Dialog state
  const [openDialog, setOpenDialog] = useState(false);
  const [editRoomId, setEditRoomId] = useState(null);
  const [newRoom, setNewRoom] = useState({
    roomNumber: '', type: 'Standard', price: '', capacity: 2, ac: true, description: '', image: ''
  });

  const handleOpenDialog = (roomToEdit = null) => {
    if (roomToEdit) {
      setEditRoomId(roomToEdit.id);
      setNewRoom(roomToEdit);
    } else {
      setEditRoomId(null);
      setNewRoom({ roomNumber: '', type: 'Standard', price: '', capacity: 2, ac: true, description: '', image: '' });
    }
    setOpenDialog(true);
  };
  
  const handleCloseDialog = () => setOpenDialog(false);

  const handleAddRoom = () => {
    if (!newRoom.roomNumber || !newRoom.price) {
      showSnackbar("Please fill in all required fields", "error");
      return;
    }

    if (editRoomId) {
      // Edit existing room
      setRooms(rooms.map(r => r.id === editRoomId ? newRoom : r));
      showSnackbar(`Room ${newRoom.roomNumber} updated successfully!`, "success");
    } else {
      // Add new room
      const newId = (Math.random() * 1000).toFixed(0);
      const roomToAdd = {
        ...newRoom,
        id: newId,
        status: 'Available',
        cleaningStatus: 'Clean',
        image: newRoom.image || 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=500&q=80'
      };
      setRooms([roomToAdd, ...rooms]);
      showSnackbar(`Room ${newRoom.roomNumber} added successfully!`, "success");
    }
    handleCloseDialog();
  };

  const handleDeleteRoom = (roomId, roomNum) => {
    showDialog({
      title: 'Delete Room',
      content: `Are you sure you want to delete room ${roomNum}? This action cannot be undone.`,
      confirmText: 'Delete',
      onConfirm: () => {
        setRooms(rooms.filter(r => r.id !== roomId));
        showSnackbar(`Room ${roomNum} deleted.`, "info");
      }
    });
  };

  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.roomNumber.includes(searchQuery) || room.type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus ? room.status === filterStatus : true;
    const matchesType = filterType ? room.type === filterType : true;
    const matchesAC = filterAC !== '' ? room.ac === (filterAC === 'AC') : true;
    
    return matchesSearch && matchesStatus && matchesType && matchesAC;
  });

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary' }}>
          Room Management
        </Typography>
        <Button 
          variant="contained" 
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add New Room
        </Button>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 4 }}>
        <CardContent sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
          <TextField
            placeholder="Search Room..."
            variant="outlined"
            size="small"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ 
              flexGrow: 1, 
              minWidth: 250,
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
          
          <ToggleButtonGroup
            value={filterStatus}
            exclusive
            onChange={(e, val) => setFilterStatus(val)}
            size="small"
            sx={{ '& .MuiToggleButton-root': { px: 2, borderRadius: 2 } }}
          >
            <ToggleButton value="">All</ToggleButton>
            <ToggleButton value="Available">Available</ToggleButton>
            <ToggleButton value="Occupied">Occupied</ToggleButton>
            <ToggleButton value="Reserved">Reserved</ToggleButton>
          </ToggleButtonGroup>

          <ToggleButtonGroup
            value={filterType}
            exclusive
            onChange={(e, val) => setFilterType(val)}
            size="small"
            sx={{ '& .MuiToggleButton-root': { px: 2, borderRadius: 2 } }}
          >
            <ToggleButton value="Deluxe">Deluxe</ToggleButton>
            <ToggleButton value="Suite">Suite</ToggleButton>
          </ToggleButtonGroup>

          <ToggleButtonGroup
            value={filterAC}
            exclusive
            onChange={(e, val) => setFilterAC(val)}
            size="small"
            sx={{ '& .MuiToggleButton-root': { px: 2, borderRadius: 2 } }}
          >
            <ToggleButton value="AC">AC</ToggleButton>
            <ToggleButton value="NonAC">Non AC</ToggleButton>
          </ToggleButtonGroup>
        </CardContent>
      </Card>

      {/* Skeletons while loading */}
      {isLoading ? (
        <Grid container spacing={3}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Grid item xs={12} sm={6} md={4} xl={3} key={i}>
              <Card sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <Skeleton variant="rectangular" height={220} />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Skeleton variant="text" width="60%" height={40} />
                  <Skeleton variant="text" width="40%" />
                  <Skeleton variant="text" width="80%" />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Grid container spacing={3}>
          {filteredRooms.map((room) => (
            <Grid item xs={12} sm={6} md={4} xl={3} key={room.id}>
              <Card sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <Box sx={{ position: 'relative' }}>
                  <CardMedia
                    component="img"
                    height="220"
                    image={room.image}
                    alt={`Room ${room.roomNumber}`}
                  />
                  <Chip 
                    label={room.status}
                    size="small"
                    sx={{ 
                      position: 'absolute', top: 12, right: 12, bgcolor: getStatusColor(room.status), color: '#fff',
                      fontWeight: 600, fontSize: '0.75rem', px: 1, py: 0.5,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.2)', backdropFilter: 'blur(4px)'
                    }}
                  />
                </Box>
                
                <CardContent sx={{ p: 2.5, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary' }}>
                      {room.roomNumber}
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
                      ${room.price}<Typography component="span" variant="body2" color="text.secondary">/night</Typography>
                    </Typography>
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <BedIcon fontSize="small" /> {room.type}
                  </Typography>

                  <Grid container spacing={1} sx={{ mb: 2 }}>
                    <Grid item xs={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PeopleIcon fontSize="small" color="action" />
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>Capacity: {room.capacity}</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AcIcon fontSize="small" color="action" />
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>{room.ac ? 'AC' : 'Non AC'}</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CleanIcon fontSize="small" color="action" />
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>Cleaning: {room.cleaningStatus}</Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
                <Divider />
                <CardActions sx={{ justifyContent: 'space-between', p: 2, bgcolor: 'background.default', mt: 'auto' }}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton size="small" sx={{ bgcolor: 'rgba(111, 78, 55, 0.08)', color: 'primary.main', '&:hover': { bgcolor: 'primary.main', color: '#fff' } }} title="View"><ViewIcon fontSize="small" /></IconButton>
                    <IconButton size="small" sx={{ bgcolor: 'rgba(2, 136, 209, 0.08)', color: 'info.main', '&:hover': { bgcolor: 'info.main', color: '#fff' } }} title="Edit" onClick={() => handleOpenDialog(room)}><EditIcon fontSize="small" /></IconButton>
                    <IconButton size="small" sx={{ bgcolor: 'rgba(211, 47, 47, 0.08)', color: 'error.main', '&:hover': { bgcolor: 'error.main', color: '#fff' } }} title="Delete" onClick={() => handleDeleteRoom(room.id, room.roomNumber)}><DeleteIcon fontSize="small" /></IconButton>
                  </Box>
                  <Button 
                    variant="contained" 
                    size="small"
                    startIcon={<BookIcon />}
                    disabled={room.status !== 'Available'}
                    disableElevation
                    sx={{ fontWeight: 600, px: 2, borderRadius: 2 }}
                  >
                    Book Room
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
          {filteredRooms.length === 0 && (
            <Grid item xs={12}>
              <EmptyState 
                icon={<HotelIcon sx={{ fontSize: 80 }} />}
                title="No Rooms Found"
                description="We couldn't find any rooms matching your current filters or search query."
                actionText="Clear Filters"
                onAction={() => {
                  setSearchQuery('');
                  setFilterStatus('');
                  setFilterType('');
                  setFilterAC('');
                }}
              />
            </Grid>
          )}
        </Grid>
      )}

      {/* Add / Edit Room Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>{editRoomId ? 'Edit Room' : 'Add New Room'}</DialogTitle>
        <DialogContent dividers sx={{ p: 4 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField 
                fullWidth label="Room Number" variant="outlined" margin="dense" required
                value={newRoom.roomNumber} onChange={e => setNewRoom({...newRoom, roomNumber: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField 
                select fullWidth label="Room Type" variant="outlined" margin="dense"
                value={newRoom.type} onChange={e => setNewRoom({...newRoom, type: e.target.value})}
              >
                <MenuItem value="Standard">Standard</MenuItem>
                <MenuItem value="Deluxe">Deluxe</MenuItem>
                <MenuItem value="Suite">Suite</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField 
                fullWidth label="Price / Night ($)" variant="outlined" margin="dense" type="number" required
                value={newRoom.price} onChange={e => setNewRoom({...newRoom, price: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField 
                fullWidth label="Capacity" variant="outlined" margin="dense" type="number"
                value={newRoom.capacity} onChange={e => setNewRoom({...newRoom, capacity: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField 
                select fullWidth label="AC / Non AC" variant="outlined" margin="dense"
                value={newRoom.ac} onChange={e => setNewRoom({...newRoom, ac: e.target.value === 'true'})}
              >
                <MenuItem value="true">AC</MenuItem>
                <MenuItem value="false">Non AC</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField 
                fullWidth label="Image URL" variant="outlined" margin="dense"
                value={newRoom.image} onChange={e => setNewRoom({...newRoom, image: e.target.value})}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField 
                fullWidth label="Description" variant="outlined" margin="dense" multiline rows={3}
                value={newRoom.description} onChange={e => setNewRoom({...newRoom, description: e.target.value})}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseDialog} color="inherit" sx={{ fontWeight: 600 }}>Cancel</Button>
          <Button onClick={handleAddRoom} variant="contained" color="primary">
            Save Room
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Rooms;
