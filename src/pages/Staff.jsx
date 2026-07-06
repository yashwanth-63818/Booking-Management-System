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
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Add as AddIcon,
  Badge as BadgeIcon,
  People as PeopleIcon,
  Business as WorkOutlineIcon,
  BeachAccess as BeachAccessIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { useUI } from '../context/UIContext';

// Initial Mock Data
const initialStaff = [
  { id: 'EMP-001', name: 'Maria Garcia', department: 'Housekeeping', role: 'Housekeeping Staff', phone: '1234567890', email: 'maria@kachinn.com', joiningDate: '2025-01-15', status: 'Active' },
  { id: 'EMP-002', name: 'John Smith', department: 'Housekeeping', role: 'Housekeeping Staff', phone: '1234567891', email: 'john@kachinn.com', joiningDate: '2025-02-20', status: 'On Leave' },
  { id: 'EMP-003', name: 'Anita Patel', department: 'Housekeeping', role: 'Manager', phone: '1234567892', email: 'anita@kachinn.com', joiningDate: '2024-11-10', status: 'Active' },
  { id: 'EMP-004', name: 'David Kim', department: 'Maintenance', role: 'Maintenance Staff', phone: '1234567893', email: 'david@kachinn.com', joiningDate: '2025-03-05', status: 'Active' },
  { id: 'EMP-005', name: 'Sarah Connor', department: 'Security', role: 'Manager', phone: '1234567894', email: 'sarah@kachinn.com', joiningDate: '2024-06-12', status: 'Active' },
  { id: 'EMP-006', name: 'James Wilson', department: 'Reception', role: 'Receptionist', phone: '1234567895', email: 'james@kachinn.com', joiningDate: '2025-05-01', status: 'Active' },
  { id: 'EMP-007', name: 'Linda Brown', department: 'Administration', role: 'Admin', phone: '1234567896', email: 'linda@kachinn.com', joiningDate: '2023-08-22', status: 'Inactive' },
];

const DEPARTMENTS = ['Reception', 'Housekeeping', 'Maintenance', 'Administration', 'Security'];
const ROLES = ['Admin', 'Manager', 'Receptionist', 'Housekeeping Staff', 'Maintenance Staff'];
const STATUSES = ['Active', 'On Leave', 'Inactive'];

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

const Staff = () => {
  const { showSnackbar, showDialog } = useUI();

  const [staffList, setStaffList] = useState(initialStaff);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modals
  const [currentStaff, setCurrentStaff] = useState(null);
  const [openForm, setOpenForm] = useState(false);
  const [openDetails, setOpenDetails] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    id: '', name: '', department: '', role: '', phone: '', email: '', joiningDate: '', status: 'Active'
  });

  // Derived Stats
  const totalStaff = staffList.length;
  const activeStaff = staffList.filter(s => s.status === 'Active').length;
  const onLeaveStaff = staffList.filter(s => s.status === 'On Leave').length;
  const uniqueDepartments = new Set(staffList.map(s => s.department)).size;

  // Filtered Staff
  const filteredStaff = staffList.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = departmentFilter === 'All' || s.department === departmentFilter;
    const matchesRole = roleFilter === 'All' || s.role === roleFilter;
    const matchesStatus = statusFilter === 'All' || s.status === statusFilter;
    return matchesSearch && matchesDept && matchesRole && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'success';
      case 'On Leave': return 'warning';
      case 'Inactive': return 'error';
      default: return 'default';
    }
  };

  const handleOpenForm = (staff = null) => {
    if (staff) {
      setIsEditing(true);
      setFormData(staff);
    } else {
      setIsEditing(false);
      setFormData({
        id: '', name: '', department: '', role: '', phone: '', email: '', joiningDate: '', status: 'Active'
      });
    }
    setOpenForm(true);
  };

  const handleActionClick = (action, staff) => {
    setCurrentStaff(staff);
    if (action === 'edit') {
      handleOpenForm(staff);
    } else if (action === 'details') {
      setOpenDetails(true);
    } else if (action === 'delete') {
      showDialog({
        title: 'Delete Staff Member',
        content: `Are you sure you want to delete ${staff.name} (${staff.id})? This action cannot be undone.`,
        confirmText: 'Delete',
        onConfirm: () => {
          setStaffList(prev => prev.filter(s => s.id !== staff.id));
          showSnackbar(`${staff.name} has been deleted.`, 'success');
        }
      });
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveStaff = (e) => {
    e.preventDefault();
    
    // Validation
    const idExists = staffList.some(s => s.id === formData.id && (!isEditing || s.id !== currentStaff?.id));
    if (idExists) {
      showSnackbar('Employee ID must be unique.', 'error');
      return;
    }

    const emailExists = staffList.some(s => s.email === formData.email && (!isEditing || s.id !== currentStaff?.id));
    if (emailExists) {
      showSnackbar('Email must be unique.', 'error');
      return;
    }

    if (isEditing) {
      setStaffList(prev => prev.map(s => s.id === currentStaff.id ? { ...formData } : s));
      showSnackbar('Staff member updated successfully.', 'success');
    } else {
      setStaffList(prev => [{ ...formData }, ...prev]);
      showSnackbar('Staff member added successfully.', 'success');
    }
    setOpenForm(false);
  };

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" sx={{ color: 'text.primary', mb: 1 }}>
            Staff Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage employee records, roles, and departments.
          </Typography>
        </Box>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={() => handleOpenForm()}
          disableElevation
          sx={{ borderRadius: 2, px: 3, py: 1 }}
        >
          Add Staff
        </Button>
      </Box>

      {/* Dashboard Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Total Staff" value={totalStaff} icon={<PeopleIcon fontSize="large" />} color="#1976d2" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Active Staff" value={activeStaff} icon={<BadgeIcon fontSize="large" />} color="#2e7d32" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="On Leave" value={onLeaveStaff} icon={<BeachAccessIcon fontSize="large" />} color="#ed6c02" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Departments" value={uniqueDepartments} icon={<WorkOutlineIcon fontSize="large" />} color="#9c27b0" />
        </Grid>
      </Grid>

      {/* Search & Filters */}
      <Card sx={{ mb: 4, borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        <CardContent sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
          <TextField
            placeholder="Search Name or ID..."
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
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            sx={{ minWidth: 160, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            slotProps={{
              input: {
                startAdornment: <InputAdornment position="start"><FilterListIcon fontSize="small" /></InputAdornment>,
              }
            }}
          >
            <MenuItem value="All">All Departments</MenuItem>
            {DEPARTMENTS.map(d => <MenuItem key={d} value={d}>{d}</MenuItem>)}
          </TextField>
          <TextField
            select
            size="small"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            sx={{ minWidth: 160, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          >
            <MenuItem value="All">All Roles</MenuItem>
            {ROLES.map(r => <MenuItem key={r} value={r}>{r}</MenuItem>)}
          </TextField>
          <TextField
            select
            size="small"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            sx={{ minWidth: 140, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          >
            <MenuItem value="All">All Statuses</MenuItem>
            {STATUSES.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
          </TextField>
        </CardContent>
      </Card>

      {/* Staff Table */}
      <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <Table sx={{ minWidth: 900 }}>
          <TableHead sx={{ bgcolor: 'rgba(111, 78, 55, 0.05)' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 600, color: 'text.secondary', py: 2 }}>ID</TableCell>
              <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Name</TableCell>
              <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Department</TableCell>
              <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Role</TableCell>
              <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Contact</TableCell>
              <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Joined</TableCell>
              <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Status</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600, color: 'text.secondary' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredStaff.length > 0 ? filteredStaff.map((row) => (
              <TableRow key={row.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                <TableCell sx={{ fontWeight: 500 }}>
                  <Typography variant="body2" color="text.secondary">
                    {row.id}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: 14 }}>
                      {row.name.charAt(0)}
                    </Avatar>
                    <Typography variant="body2" fontWeight="bold">{row.name}</Typography>
                  </Box>
                </TableCell>
                <TableCell>{row.department}</TableCell>
                <TableCell>{row.role}</TableCell>
                <TableCell>
                  <Typography variant="body2">{row.phone}</Typography>
                  <Typography variant="caption" color="text.secondary">{row.email}</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">{row.joiningDate}</Typography>
                </TableCell>
                <TableCell>
                  <Chip 
                    label={row.status} 
                    color={getStatusColor(row.status)} 
                    size="small" 
                    sx={{ fontWeight: 600, borderRadius: 1 }}
                  />
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="View Details">
                    <IconButton size="small" onClick={() => handleActionClick('details', row)} sx={{ color: 'primary.main', mr: 0.5 }}>
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Edit Staff">
                    <IconButton size="small" onClick={() => handleActionClick('edit', row)} sx={{ color: 'text.secondary', mr: 0.5 }}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete Staff">
                    <IconButton size="small" onClick={() => handleActionClick('delete', row)} sx={{ color: 'error.main' }}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                  <WarningIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">No Staff Found</Typography>
                  <Typography variant="body2" color="text.disabled">Adjust your filters to see more results.</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add / Edit Form Modal */}
      <Dialog open={openForm} onClose={() => setOpenForm(false)} maxWidth="sm" fullWidth>
        <form onSubmit={handleSaveStaff}>
          <DialogTitle fontWeight="bold">{isEditing ? 'Edit Staff Member' : 'Add New Staff'}</DialogTitle>
          <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Employee ID"
                  name="id"
                  value={formData.id}
                  onChange={handleFormChange}
                  required
                  size="small"
                  disabled={isEditing}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Full Name"
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  required
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="email"
                  label="Email Address"
                  name="email"
                  value={formData.email}
                  onChange={handleFormChange}
                  required
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  name="phone"
                  value={formData.phone}
                  onChange={handleFormChange}
                  required
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  label="Department"
                  name="department"
                  value={formData.department}
                  onChange={handleFormChange}
                  required
                  size="small"
                >
                  {DEPARTMENTS.map(d => <MenuItem key={d} value={d}>{d}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  label="Role"
                  name="role"
                  value={formData.role}
                  onChange={handleFormChange}
                  required
                  size="small"
                >
                  {ROLES.map(r => <MenuItem key={r} value={r}>{r}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="Joining Date"
                  name="joiningDate"
                  value={formData.joiningDate}
                  onChange={handleFormChange}
                  required
                  size="small"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  label="Status"
                  name="status"
                  value={formData.status}
                  onChange={handleFormChange}
                  required
                  size="small"
                >
                  {STATUSES.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                </TextField>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setOpenForm(false)} color="inherit">Cancel</Button>
            <Button type="submit" variant="contained" disableElevation>
              {isEditing ? 'Save Changes' : 'Add Staff'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Staff Details Modal */}
      {currentStaff && (
        <Dialog open={openDetails} onClose={() => setOpenDetails(false)} maxWidth="sm" fullWidth>
          <DialogTitle fontWeight="bold">Staff Profile: {currentStaff.name}</DialogTitle>
          <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
              <Avatar sx={{ width: 64, height: 64, bgcolor: 'primary.main', fontSize: 24 }}>
                {currentStaff.name.charAt(0)}
              </Avatar>
              <Box>
                <Typography variant="h6" fontWeight="bold">{currentStaff.name}</Typography>
                <Typography variant="body2" color="text.secondary">{currentStaff.role} - {currentStaff.department}</Typography>
              </Box>
            </Box>
            <Divider />
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">EMPLOYEE ID</Typography>
                <Typography variant="body1" fontWeight="bold">{currentStaff.id}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">STATUS</Typography>
                <Box sx={{ mt: 0.5 }}>
                  <Chip label={currentStaff.status} color={getStatusColor(currentStaff.status)} size="small" />
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">EMAIL</Typography>
                <Typography variant="body1">{currentStaff.email}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">PHONE</Typography>
                <Typography variant="body1">{currentStaff.phone}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">JOINING DATE</Typography>
                <Typography variant="body1">{currentStaff.joiningDate}</Typography>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => { setOpenDetails(false); handleOpenForm(currentStaff); }} color="primary" startIcon={<EditIcon />}>
              Edit Profile
            </Button>
            <Box sx={{ flexGrow: 1 }} />
            <Button onClick={() => setOpenDetails(false)} variant="contained" disableElevation>Close</Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
};

export default Staff;
