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
import { getRooms, createRoom, updateRoom, deleteRoom } from '../services/api';
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
  const [rooms, setRooms] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterAC, setFilterAC] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { showSnackbar, showDialog } = useUI();
  
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setIsLoading(true);
        const data = await getRooms();
        setRooms(data);
      } catch (error) {
        showSnackbar('Failed to load rooms', 'error');
      } finally {
        setIsLoading(false);
      }
    };
    fetchRooms();
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

  const handleAddRoom = async () => {
    if (!newRoom.roomNumber || !newRoom.price) {
      showSnackbar("Please fill in all required fields", "error");
      return;
    }

    try {
      if (editRoomId) {
        // Edit existing room
        await updateRoom(editRoomId, newRoom);
        setRooms(rooms.map(r => r.id === editRoomId ? { ...r, ...newRoom } : r));
        showSnackbar(`Room ${newRoom.roomNumber} updated successfully!`, "success");
      } else {
        // Add new room
        const roomToAdd = {
          ...newRoom,
          status: 'Available',
          cleaningStatus: 'Clean',
          image: newRoom.image || 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=500&q=80'
        };
        const response = await createRoom(roomToAdd);
        roomToAdd.id = response.id;
        setRooms([roomToAdd, ...rooms]);
        showSnackbar(`Room ${newRoom.roomNumber} added successfully!`, "success");
      }
      handleCloseDialog();
    } catch (error) {
      showSnackbar(error.response?.data?.message || 'Failed to save room', 'error');
    }
  };

  const handleDeleteRoom = (roomId, roomNum) => {
    showDialog({
      title: 'Delete Room',
      content: `Are you sure you want to delete room ${roomNum}? This action cannot be undone.`,
      confirmText: 'Delete',
      onConfirm: async () => {
        try {
          await deleteRoom(roomId);
          setRooms(rooms.filter(r => r.id !== roomId));
          showSnackbar(`Room ${roomNum} deleted.`, "info");
        } catch (error) {
          showSnackbar(error.response?.data?.message || 'Failed to delete room', 'error');
        }
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
      {/* We keep a subtle Add Room button for functionality, though not in the design screenshot */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button size="small" variant="text" startIcon={<AddIcon />} onClick={() => handleOpenDialog()} sx={{ color: '#8C5A35', fontWeight: 600 }}>Add Room</Button>
      </Box>

      {/* Filters */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 4, overflowX: 'auto', pb: 1, '&::-webkit-scrollbar': { display: 'none' } }}>
        <TextField
          placeholder="Search rooms..."
          variant="outlined"
          size="small"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ 
            minWidth: 220,
            '& .MuiOutlinedInput-root': {
              borderRadius: '50px',
              bgcolor: '#fff',
              '& fieldset': { borderColor: '#E0E0E0' },
              '&:hover fieldset': { borderColor: '#CFA365' },
              '&.Mui-focused fieldset': { borderColor: '#8C5A35' },
            }
          }}
          InputProps={{
            startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: '#9e9e9e' }} /></InputAdornment>,
          }}
        />
        
        {['All', 'Available', 'Occupied', 'Reserved', 'Cleaning', 'Maintenance'].map((status) => (
          <Button
            key={status}
            variant={filterStatus === (status === 'All' ? '' : status) ? 'contained' : 'outlined'}
            onClick={() => setFilterStatus(status === 'All' ? '' : status)}
            sx={{
              borderRadius: '50px',
              textTransform: 'none',
              px: 3,
              py: 0.75,
              borderColor: '#E0E0E0',
              fontWeight: 600,
              fontSize: '0.85rem',
              color: filterStatus === (status === 'All' ? '' : status) ? '#fff' : '#555',
              bgcolor: filterStatus === (status === 'All' ? '' : status) ? '#8C5A35' : '#fff',
              boxShadow: 'none',
              '&:hover': {
                bgcolor: filterStatus === (status === 'All' ? '' : status) ? '#7A4A25' : '#f5f5f5',
                borderColor: '#E0E0E0',
                boxShadow: 'none'
              }
            }}
          >
            {status}
          </Button>
        ))}
        <Button
          variant="outlined"
          sx={{
            borderRadius: '50px', textTransform: 'none', px: 3, py: 0.75, borderColor: '#E0E0E0', color: '#555', fontWeight: 600, fontSize: '0.85rem', bgcolor: '#fff', boxShadow: 'none',
            '&:hover': { borderColor: '#E0E0E0', bgcolor: '#f5f5f5' }
          }}
        >
          More ⌄
        </Button>
      </Box>

      {/* Skeletons while loading */}
      {isLoading ? (
        <Grid container spacing={3} alignItems="stretch">
          {[1, 2, 3, 4].map((i) => (
            <Grid item xs={12} md={6} key={i}>
              <Card sx={{ 
                display: 'flex', 
                flexDirection: { xs: 'column', sm: 'row' }, 
                height: '100%', 
                minHeight: '240px', 
                borderRadius: '16px', 
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)', 
                border: '1px solid #f0f0f0',
                overflow: 'hidden'
              }}>
                <Box sx={{ width: { xs: '100%', sm: '45%' }, height: { xs: '200px', sm: 'auto' }, flexShrink: 0, display: 'flex' }}>
                  <Skeleton variant="rectangular" sx={{ width: '100%', height: '100%' }} />
                </Box>
                <Box sx={{ p: 3, width: { xs: '100%', sm: '55%' }, display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                  <Skeleton variant="text" width="40%" height={40} />
                  <Skeleton variant="text" width="60%" />
                  <Skeleton variant="text" width="80%" />
                  <Skeleton variant="text" width="70%" />
                  <Box sx={{ mt: 'auto', pt: 2, display: 'flex', justifyContent: 'space-between' }}>
                    <Skeleton variant="rectangular" width={100} height={36} sx={{ borderRadius: '24px' }} />
                    <Skeleton variant="rectangular" width={120} height={36} sx={{ borderRadius: '24px' }} />
                  </Box>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Grid container spacing={3} alignItems="stretch">
          {filteredRooms.map((room) => (
            <Grid item xs={12} md={6} key={room.id}>
              <Card sx={{ 
                display: 'flex', 
                flexDirection: { xs: 'column', sm: 'row' }, 
                height: '100%',
                minHeight: '240px', 
                borderRadius: '16px', 
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                border: '1px solid #f0f0f0',
                overflow: 'hidden'
              }}>
                <Box sx={{ 
                  position: 'relative', 
                  width: { xs: '100%', sm: '45%' }, 
                  height: { xs: '200px', sm: 'auto' }, 
                  flexShrink: 0, 
                  display: 'flex' 
                }}>
                  <CardMedia
                    component="img"
                    sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    image={room.image}
                    alt={`Room ${room.roomNumber}`}
                  />
                  <Chip 
                    label={room.status}
                    size="small"
                    sx={{ 
                      position: 'absolute', top: 16, left: 16, 
                      bgcolor: room.status === 'Available' ? '#1b8b40' : room.status === 'Occupied' ? '#d32f2f' : room.status === 'Reserved' ? '#e67e22' : '#0288d1',
                      color: '#fff',
                      fontWeight: 600, fontSize: '0.75rem', px: 1, py: 0.5,
                      borderRadius: '8px'
                    }}
                  />
                </Box>
                
                <Box sx={{ p: 3, width: { xs: '100%', sm: '55%' }, display: 'flex', flexDirection: 'column', flexGrow: 1, bgcolor: '#fff' }}>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: '#222', mb: 0.5 }}>
                    {room.roomNumber}
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#333', mb: 1.5, fontSize: '1.1rem' }}>
                    ${room.price}<Typography component="span" variant="body2" sx={{ color: '#777', fontWeight: 500 }}>/night</Typography>
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <BedIcon sx={{ color: '#888', fontSize: 18 }} /> 
                    <Typography variant="body2" sx={{ color: '#555', fontWeight: 500 }}>{room.type}</Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <PeopleIcon sx={{ color: '#888', fontSize: 18 }} />
                    <Typography variant="body2" sx={{ color: '#555', fontWeight: 500 }}>Capacity: {room.capacity}</Typography>
                    <Typography variant="body2" sx={{ color: '#ccc', mx: 0.5 }}>|</Typography>
                    <AcIcon sx={{ color: '#888', fontSize: 18 }} />
                    <Typography variant="body2" sx={{ color: '#555', fontWeight: 500 }}>{room.ac ? 'AC' : 'Non AC'}</Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <CleanIcon sx={{ color: '#888', fontSize: 18 }} />
                    <Typography variant="body2" sx={{ color: '#555', fontWeight: 500 }}>Cleaning: {room.cleaningStatus}</Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto', pt: 2 }}>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton size="small" sx={{ bgcolor: '#f5f5f5', color: '#555', '&:hover': { bgcolor: '#e0e0e0' }, width: 32, height: 32 }} title="View"><ViewIcon sx={{ fontSize: 18 }} /></IconButton>
                      <IconButton size="small" sx={{ bgcolor: '#e3f2fd', color: '#1976d2', '&:hover': { bgcolor: '#bbdefb' }, width: 32, height: 32 }} title="Edit" onClick={() => handleOpenDialog(room)}><EditIcon sx={{ fontSize: 18 }} /></IconButton>
                      <IconButton size="small" sx={{ bgcolor: '#ffebee', color: '#d32f2f', '&:hover': { bgcolor: '#ffcdd2' }, width: 32, height: 32 }} title="Delete" onClick={() => handleDeleteRoom(room.id, room.roomNumber)}><DeleteIcon sx={{ fontSize: 18 }} /></IconButton>
                    </Box>
                    <Button 
                      variant="contained" 
                      size="small"
                      startIcon={<BookIcon sx={{ fontSize: 18 }} />}
                      disableElevation
                      sx={{ 
                        fontWeight: 600, 
                        px: 2, 
                        py: 1,
                        borderRadius: '24px',
                        bgcolor: '#664229', // Dark brown matching "Book Room" in screenshot
                        textTransform: 'none',
                        '&:hover': { bgcolor: '#4a2f1b' }
                      }}
                    >
                      Book Room
                    </Button>
                  </Box>
                </Box>
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
