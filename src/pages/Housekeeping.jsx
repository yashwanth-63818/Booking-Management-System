import React, { useState, useMemo } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, TextField, InputAdornment,
  MenuItem, Button, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Paper, Chip, IconButton, Tooltip, Dialog, DialogTitle,
  DialogContent, DialogActions, Divider, Avatar
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterListIcon,
  CheckCircle as CheckCircleIcon,
  Build as BuildIcon,
  PersonAdd as PersonAddIcon,
  Visibility as VisibilityIcon,
  PlayArrow as PlayArrowIcon,
  CleaningServices as CleaningServicesIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { useUI } from '../context/UIContext';
import { roomsData as initialRooms } from '../services/dummyData';
import { format, subHours } from 'date-fns';

const staffList = [
  { id: 'S1', name: 'Maria Garcia', role: 'Housekeeper' },
  { id: 'S2', name: 'John Smith', role: 'Housekeeper' },
  { id: 'S3', name: 'Anita Patel', role: 'Supervisor' },
  { id: 'S4', name: 'David Kim', role: 'Maintenance' },
];

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

const Housekeeping = () => {
  const { showSnackbar } = useUI();

  // Augment dummy data with housekeeping fields
  const augmentedRooms = useMemo(() => {
    return initialRooms.map(room => {
      let priority = 'Medium';
      let assignedStaff = null;
      let lastCleaned = format(subHours(new Date(), Math.floor(Math.random() * 48)), 'MMM dd, HH:mm');
      let notes = '';

      if (room.cleaningStatus === 'Dirty') priority = 'High';
      if (room.cleaningStatus === 'In Progress') assignedStaff = staffList[0]; // Mock Maria
      
      return { ...room, priority, assignedStaff, lastCleaned, notes };
    });
  }, []);

  const [rooms, setRooms] = useState(augmentedRooms);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [roomTypeFilter, setRoomTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [floorFilter, setFloorFilter] = useState('All');

  // Modals
  const [currentRoom, setCurrentRoom] = useState(null);
  const [openAssign, setOpenAssign] = useState(false);
  const [openStatus, setOpenStatus] = useState(false);
  const [openMaintenance, setOpenMaintenance] = useState(false);
  const [openDetails, setOpenDetails] = useState(false);

  // Form States
  const [selectedStaff, setSelectedStaff] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [maintenanceNotes, setMaintenanceNotes] = useState('');

  // Derived Stats
  const roomsToClean = rooms.filter(r => r.cleaningStatus === 'Dirty' || r.cleaningStatus === 'Inspection').length;
  const roomsCleaning = rooms.filter(r => r.cleaningStatus === 'In Progress').length;
  const cleanRooms = rooms.filter(r => r.cleaningStatus === 'Clean').length;
  const maintenanceRooms = rooms.filter(r => r.cleaningStatus === 'Maintenance').length;

  // Filtered Rooms
  const filteredRooms = rooms.filter(r => {
    const floor = r.roomNumber.charAt(0);
    const matchesSearch = r.roomNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = roomTypeFilter === 'All' || r.type === roomTypeFilter;
    const matchesStatus = statusFilter === 'All' || r.cleaningStatus === statusFilter;
    const matchesFloor = floorFilter === 'All' || floor === floorFilter;

    return matchesSearch && matchesType && matchesStatus && matchesFloor;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'Clean': return 'success';
      case 'Dirty': return 'error';
      case 'In Progress': return 'info';
      case 'Inspection': return 'warning';
      case 'Maintenance': return 'default';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return '#d32f2f';
      case 'Medium': return '#ed6c02';
      case 'Low': return '#2e7d32';
      default: return 'text.secondary';
    }
  };

  const handleActionClick = (action, room) => {
    setCurrentRoom(room);
    if (action === 'assign') {
      setSelectedStaff(room.assignedStaff?.id || '');
      setOpenAssign(true);
    } else if (action === 'status') {
      setNewStatus(room.cleaningStatus);
      setOpenStatus(true);
    } else if (action === 'maintenance') {
      setMaintenanceNotes(room.notes || '');
      setOpenMaintenance(true);
    } else if (action === 'details') {
      setOpenDetails(true);
    }
  };

  const processAssignStaff = () => {
    if (!selectedStaff) return;
    
    // Validation: Check if staff is already assigned to another "In Progress" room
    const isBusy = rooms.some(r => 
      r.id !== currentRoom.id && 
      r.assignedStaff?.id === selectedStaff && 
      r.cleaningStatus === 'In Progress'
    );

    if (isBusy) {
      showSnackbar('Staff member is currently cleaning another room!', 'error');
      return;
    }

    const staffObj = staffList.find(s => s.id === selectedStaff);
    setRooms(rooms.map(r => r.id === currentRoom.id ? { ...r, assignedStaff: staffObj, priority: 'Medium' } : r));
    setOpenAssign(false);
    showSnackbar(`Assigned ${staffObj.name} to Room ${currentRoom.roomNumber}`, 'success');
  };

  const processUpdateStatus = () => {
    if (!newStatus) return;
    let updates = { cleaningStatus: newStatus };
    if (newStatus === 'Clean') updates.lastCleaned = format(new Date(), 'MMM dd, HH:mm');
    if (newStatus === 'Dirty' || newStatus === 'Maintenance') updates.assignedStaff = null; // Unassign on these statuses

    setRooms(rooms.map(r => r.id === currentRoom.id ? { ...r, ...updates } : r));
    setOpenStatus(false);
    showSnackbar(`Room ${currentRoom.roomNumber} marked as ${newStatus}`, 'success');
  };

  const processMaintenance = () => {
    if (!maintenanceNotes.trim()) {
      showSnackbar('Maintenance notes are required.', 'error');
      return;
    }
    setRooms(rooms.map(r => r.id === currentRoom.id ? { ...r, cleaningStatus: 'Maintenance', notes: maintenanceNotes, assignedStaff: null } : r));
    setOpenMaintenance(false);
    showSnackbar(`Room ${currentRoom.roomNumber} sent to maintenance`, 'success');
  };

  const quickStartCleaning = (room) => {
    if (!room.assignedStaff) {
      showSnackbar('Please assign staff before starting cleaning.', 'warning');
      return;
    }
    setRooms(rooms.map(r => r.id === room.id ? { ...r, cleaningStatus: 'In Progress' } : r));
    showSnackbar(`Cleaning started for Room ${room.roomNumber}`, 'info');
  };

  const quickMarkClean = (room) => {
    setRooms(rooms.map(r => r.id === room.id ? { ...r, cleaningStatus: 'Clean', lastCleaned: format(new Date(), 'MMM dd, HH:mm') } : r));
    showSnackbar(`Room ${room.roomNumber} is now Clean`, 'success');
  };

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" sx={{ color: 'text.primary', mb: 1 }}>
            Housekeeping
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage room cleaning, assignments, and maintenance.
          </Typography>
        </Box>
      </Box>

      {/* Dashboard Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Rooms to Clean" value={roomsToClean} icon={<CleaningServicesIcon fontSize="large" />} color="#d32f2f" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Under Cleaning" value={roomsCleaning} icon={<PlayArrowIcon fontSize="large" />} color="#0288d1" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Clean Rooms" value={cleanRooms} icon={<CheckCircleIcon fontSize="large" />} color="#2e7d32" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Maintenance" value={maintenanceRooms} icon={<BuildIcon fontSize="large" />} color="#ed6c02" />
        </Grid>
      </Grid>

      {/* Search & Filters */}
      <Card sx={{ mb: 4, borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        <CardContent sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
          <TextField
            placeholder="Search Room..."
            variant="outlined"
            size="small"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ flexGrow: 1, minWidth: 200, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            slotProps={{
              input: {
                startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>,
              }
            }}
          />
          <TextField
            select
            size="small"
            value={roomTypeFilter}
            onChange={(e) => setRoomTypeFilter(e.target.value)}
            sx={{ minWidth: 150, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            slotProps={{
              input: {
                startAdornment: <InputAdornment position="start"><FilterListIcon fontSize="small" /></InputAdornment>,
              }
            }}
          >
            <MenuItem value="All">All Types</MenuItem>
            <MenuItem value="Standard">Standard</MenuItem>
            <MenuItem value="Deluxe">Deluxe</MenuItem>
            <MenuItem value="Suite">Suite</MenuItem>
          </TextField>
          <TextField
            select
            size="small"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            sx={{ minWidth: 150, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          >
            <MenuItem value="All">All Statuses</MenuItem>
            <MenuItem value="Clean">Clean</MenuItem>
            <MenuItem value="Dirty">Dirty</MenuItem>
            <MenuItem value="In Progress">In Progress</MenuItem>
            <MenuItem value="Inspection">Inspection</MenuItem>
            <MenuItem value="Maintenance">Maintenance</MenuItem>
          </TextField>
          <TextField
            select
            size="small"
            value={floorFilter}
            onChange={(e) => setFloorFilter(e.target.value)}
            sx={{ minWidth: 120, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          >
            <MenuItem value="All">All Floors</MenuItem>
            <MenuItem value="1">Floor 1</MenuItem>
            <MenuItem value="2">Floor 2</MenuItem>
            <MenuItem value="3">Floor 3</MenuItem>
          </TextField>
        </CardContent>
      </Card>

      {/* Housekeeping Table */}
      <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <Table sx={{ minWidth: 900 }}>
          <TableHead sx={{ bgcolor: 'rgba(111, 78, 55, 0.05)' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 600, color: 'text.secondary', py: 2 }}>Room</TableCell>
              <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Type</TableCell>
              <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Priority</TableCell>
              <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Assigned To</TableCell>
              <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Last Cleaned</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600, color: 'text.secondary' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredRooms.length > 0 ? filteredRooms.map((row) => (
              <TableRow key={row.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                <TableCell sx={{ fontWeight: 500 }}>
                  <Typography variant="body2" fontWeight="bold">
                    {row.roomNumber}
                  </Typography>
                </TableCell>
                <TableCell>{row.type}</TableCell>
                <TableCell>
                  <Chip 
                    label={row.cleaningStatus} 
                    color={getStatusColor(row.cleaningStatus)} 
                    size="small" 
                    sx={{ fontWeight: 600, borderRadius: 1 }}
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ color: getPriorityColor(row.priority), fontWeight: 600 }}>
                    {row.priority}
                  </Typography>
                </TableCell>
                <TableCell>
                  {row.assignedStaff ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ width: 24, height: 24, bgcolor: 'primary.main', fontSize: 12 }}>
                        {row.assignedStaff.name.charAt(0)}
                      </Avatar>
                      <Typography variant="body2">{row.assignedStaff.name}</Typography>
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.disabled" fontStyle="italic">Unassigned</Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">{row.lastCleaned}</Typography>
                </TableCell>
                <TableCell align="right">
                  {row.cleaningStatus === 'Dirty' && (
                    <Tooltip title="Start Cleaning">
                      <span>
                        <IconButton size="small" onClick={() => quickStartCleaning(row)} sx={{ color: 'info.main', mr: 0.5 }}>
                          <PlayArrowIcon fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>
                  )}
                  {row.cleaningStatus === 'In Progress' && (
                    <Tooltip title="Mark Clean">
                      <span>
                        <IconButton size="small" onClick={() => quickMarkClean(row)} sx={{ color: 'success.main', mr: 0.5 }}>
                          <CheckCircleIcon fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>
                  )}
                  <Tooltip title="Assign Staff">
                    <IconButton size="small" onClick={() => handleActionClick('assign', row)} sx={{ color: 'text.secondary', mr: 0.5 }}>
                      <PersonAddIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Update Status">
                    <IconButton size="small" onClick={() => handleActionClick('status', row)} sx={{ color: 'text.secondary', mr: 0.5 }}>
                      <CleaningServicesIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="View Details">
                    <IconButton size="small" onClick={() => handleActionClick('details', row)} sx={{ color: 'primary.main' }}>
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                  <WarningIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">No Rooms Found</Typography>
                  <Typography variant="body2" color="text.disabled">Adjust your filters to see more results.</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Modals */}
      {currentRoom && (
        <>
          {/* Assign Staff Modal */}
          <Dialog open={openAssign} onClose={() => setOpenAssign(false)} maxWidth="xs" fullWidth>
            <DialogTitle fontWeight="bold">Assign Housekeeper</DialogTitle>
            <DialogContent dividers>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Assign a staff member to clean Room {currentRoom.roomNumber}.
              </Typography>
              <TextField
                select
                fullWidth
                label="Select Staff"
                value={selectedStaff}
                onChange={(e) => setSelectedStaff(e.target.value)}
                size="small"
              >
                {staffList.map((staff) => (
                  <MenuItem key={staff.id} value={staff.id}>
                    {staff.name} ({staff.role})
                  </MenuItem>
                ))}
              </TextField>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <Button onClick={() => setOpenAssign(false)} color="inherit">Cancel</Button>
              <Button onClick={processAssignStaff} variant="contained" disableElevation disabled={!selectedStaff}>Assign</Button>
            </DialogActions>
          </Dialog>

          {/* Update Status Modal */}
          <Dialog open={openStatus} onClose={() => setOpenStatus(false)} maxWidth="xs" fullWidth>
            <DialogTitle fontWeight="bold">Update Cleaning Status</DialogTitle>
            <DialogContent dividers>
              <TextField
                select
                fullWidth
                label="Status"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                size="small"
              >
                <MenuItem value="Clean">Clean</MenuItem>
                <MenuItem value="Dirty">Dirty</MenuItem>
                <MenuItem value="In Progress">In Progress</MenuItem>
                <MenuItem value="Inspection">Inspection</MenuItem>
                <MenuItem value="Maintenance">Maintenance</MenuItem>
              </TextField>
              {newStatus === 'Maintenance' && (
                <Typography variant="caption" color="warning.main" sx={{ display: 'block', mt: 1 }}>
                  Use the Maintenance Request action to add detailed notes.
                </Typography>
              )}
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <Button onClick={() => setOpenStatus(false)} color="inherit">Cancel</Button>
              <Button onClick={processUpdateStatus} variant="contained" disableElevation>Update Status</Button>
            </DialogActions>
          </Dialog>

          {/* Maintenance Request Modal */}
          <Dialog open={openMaintenance} onClose={() => setOpenMaintenance(false)} maxWidth="sm" fullWidth>
            <DialogTitle fontWeight="bold">Maintenance Request - Room {currentRoom.roomNumber}</DialogTitle>
            <DialogContent dividers>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Maintenance Issue Description"
                placeholder="Describe the issue (e.g., Leaking faucet, broken AC)..."
                value={maintenanceNotes}
                onChange={(e) => setMaintenanceNotes(e.target.value)}
                required
              />
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <Button onClick={() => setOpenMaintenance(false)} color="inherit">Cancel</Button>
              <Button onClick={processMaintenance} variant="contained" color="warning" disableElevation disabled={!maintenanceNotes.trim()}>
                Submit Request
              </Button>
            </DialogActions>
          </Dialog>

          {/* Room Details Modal */}
          <Dialog open={openDetails} onClose={() => setOpenDetails(false)} maxWidth="sm" fullWidth>
            <DialogTitle fontWeight="bold">Room Details: {currentRoom.roomNumber}</DialogTitle>
            <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">ROOM TYPE</Typography>
                  <Typography variant="body1" fontWeight="bold">{currentRoom.type}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">CAPACITY</Typography>
                  <Typography variant="body1" fontWeight="bold">{currentRoom.capacity} Persons</Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" color="text.secondary">CLEANING STATUS</Typography>
                  <Box sx={{ mt: 0.5 }}>
                    <Chip label={currentRoom.cleaningStatus} color={getStatusColor(currentRoom.cleaningStatus)} size="small" />
                  </Box>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" color="text.secondary">PRIORITY</Typography>
                  <Typography variant="body1" sx={{ color: getPriorityColor(currentRoom.priority), fontWeight: 'bold' }}>{currentRoom.priority}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">ASSIGNED STAFF</Typography>
                  <Typography variant="body1">{currentRoom.assignedStaff ? currentRoom.assignedStaff.name : 'Unassigned'}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">LAST CLEANED</Typography>
                  <Typography variant="body1">{currentRoom.lastCleaned}</Typography>
                </Grid>
                {currentRoom.notes && (
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary">NOTES</Typography>
                    <Paper variant="outlined" sx={{ p: 2, mt: 0.5, bgcolor: 'background.default' }}>
                      <Typography variant="body2">{currentRoom.notes}</Typography>
                    </Paper>
                  </Grid>
                )}
              </Grid>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <Button onClick={() => handleActionClick('maintenance', currentRoom)} color="warning" startIcon={<BuildIcon />}>
                Report Issue
              </Button>
              <Box sx={{ flexGrow: 1 }} />
              <Button onClick={() => setOpenDetails(false)} variant="contained" disableElevation>Close</Button>
            </DialogActions>
          </Dialog>
        </>
      )}
    </Box>
  );
};

export default Housekeeping;
