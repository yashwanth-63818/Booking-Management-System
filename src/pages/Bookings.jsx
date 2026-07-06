import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Button, TextField, Grid, Card, CardContent,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Chip, Dialog, DialogTitle, DialogContent, DialogActions, MenuItem, InputAdornment,
  IconButton, Tooltip, Divider, Skeleton, TablePagination, TableSortLabel, Collapse, Menu,
  useTheme, useMediaQuery
} from '@mui/material';
import {
  Add as AddIcon, Search as SearchIcon, Edit as EditIcon,
  Delete as DeleteIcon, Visibility as ViewIcon, Print as PrintIcon,
  EventNote as EventNoteIcon, FilterList as FilterIcon, Download as DownloadIcon
} from '@mui/icons-material';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { roomsData } from '../services/dummyData'; // We still use roomsData for the room dropdown for now
import EmptyState from '../components/EmptyState';
import { useUI } from '../context/UIContext';
import api, { getBookings, exportBookings, createBooking, updateBooking, deleteBooking } from '../services/api';
import InvoiceDocument from '../components/InvoiceDocument';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';

const getStatusColor = (status) => {
  switch (status) {
    case 'Confirmed': return '#4caf50'; // Green
    case 'Pending': return '#ff9800'; // Orange
    case 'Checked In': return '#2196f3'; // Blue
    case 'Checked Out': return '#9e9e9e'; // Gray
    case 'Cancelled': return '#f44336'; // Red
    default: return '#9e9e9e';
  }
};

const defaultBooking = {
  id: '', customerName: '', phone: '', email: '', address: '',
  idProofType: 'Aadhar', idNumber: '', guests: 1,
  checkIn: '', checkOut: '', room: '', paymentMethod: 'Cash',
  advance: 0, specialRequests: '', days: 0, roomCharges: 0,
  gst: 0, grandTotal: 0, balance: 0, status: 'Confirmed'
};

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [roomTypeFilter, setRoomTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('All');
  const [showFilters, setShowFilters] = useState(false);

  // Pagination & Sorting State
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [exportAnchorEl, setExportAnchorEl] = useState(null);

  const { showSnackbar, showDialog } = useUI();
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Dialogs state
  const [openForm, setOpenForm] = useState(false);
  const [openView, setOpenView] = useState(false);
  const [openInvoice, setOpenInvoice] = useState(false);
  
  const [currentBooking, setCurrentBooking] = useState(defaultBooking);
  const [formErrors, setFormErrors] = useState({});
  const [isEditing, setIsEditing] = useState(false);

  const fetchBookingsData = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = {
        q: searchQuery,
        date: dateFilter,
        roomType: roomTypeFilter,
        status: statusFilter,
        paymentStatus: paymentStatusFilter,
        page: page + 1, // backend is 1-indexed
        limit: rowsPerPage,
        sortBy: sortBy,
        sortOrder: sortOrder
      };
      
      const response = await getBookings(params);
      setBookings(response.data);
      setTotalCount(response.total);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      showSnackbar("Failed to fetch bookings", "error");
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, dateFilter, roomTypeFilter, statusFilter, paymentStatusFilter, page, rowsPerPage, sortBy, sortOrder, showSnackbar]);

  useEffect(() => {
    // Debounce search query
    const timer = setTimeout(() => {
      fetchBookingsData();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchBookingsData]);

  const handleSort = (column) => {
    const isAsc = sortBy === column && sortOrder === 'asc';
    setSortOrder(isAsc ? 'desc' : 'asc');
    setSortBy(column);
    setPage(0); // Reset page on sort change
  };

  // Auto Calculations in Form
  useEffect(() => {
    if (openForm) {
      let days = 0;
      if (currentBooking.checkIn && currentBooking.checkOut) {
        const checkInDate = new Date(currentBooking.checkIn);
        const checkOutDate = new Date(currentBooking.checkOut);
        const diffTime = checkOutDate.getTime() - checkInDate.getTime();
        days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (days <= 0) days = 1; // Minimum 1 day
      }

      let roomPrice = 0;
      if (currentBooking.room) {
        const selectedRoom = roomsData.find(r => r.roomNumber === currentBooking.room);
        if (selectedRoom) roomPrice = selectedRoom.price;
      }

      const roomCharges = days * roomPrice;
      const gst = roomCharges * 0.18; // 18% GST
      const grandTotal = roomCharges + gst;
      const advance = parseFloat(currentBooking.advance) || 0;
      const balance = grandTotal - advance;

      setCurrentBooking(prev => ({
        ...prev,
        days,
        roomCharges,
        gst,
        grandTotal,
        balance
      }));
    }
  }, [currentBooking.checkIn, currentBooking.checkOut, currentBooking.room, currentBooking.advance, openForm]);

  const handleOpenForm = (booking = null) => {
    if (booking) {
      // Map backend naming to frontend naming
      setCurrentBooking({
        id: booking.id,
        customerName: booking.customer_name,
        phone: booking.phone,
        email: booking.email,
        address: booking.address,
        idProofType: booking.id_proof_type,
        idNumber: booking.id_number,
        guests: booking.guests,
        checkIn: booking.check_in ? booking.check_in.split('T')[0] : '',
        checkOut: booking.check_out ? booking.check_out.split('T')[0] : '',
        room: booking.room_number,
        paymentMethod: booking.payment_method,
        advance: parseFloat(booking.advance) || 0,
        specialRequests: booking.special_requests,
        days: booking.days,
        roomCharges: parseFloat(booking.room_charges) || 0,
        gst: parseFloat(booking.gst) || 0,
        grandTotal: parseFloat(booking.grand_total) || 0,
        balance: parseFloat(booking.balance) || 0,
        status: booking.status
      });
      setIsEditing(true);
    } else {
      setCurrentBooking({ ...defaultBooking });
      setIsEditing(false);
    }
    setOpenForm(true);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
    setCurrentBooking(defaultBooking);
    setFormErrors({});
  };

  const handleOpenView = (booking) => {
    setCurrentBooking({
        id: booking.id,
        customerName: booking.customer_name,
        phone: booking.phone,
        email: booking.email,
        address: booking.address,
        idProofType: booking.id_proof_type,
        idNumber: booking.id_number,
        guests: booking.guests,
        checkIn: booking.check_in ? booking.check_in.split('T')[0] : '',
        checkOut: booking.check_out ? booking.check_out.split('T')[0] : '',
        room: booking.room_number,
        paymentMethod: booking.payment_method,
        advance: parseFloat(booking.advance) || 0,
        specialRequests: booking.special_requests,
        days: booking.days,
        roomCharges: parseFloat(booking.room_charges) || 0,
        gst: parseFloat(booking.gst) || 0,
        grandTotal: parseFloat(booking.grand_total) || 0,
        balance: parseFloat(booking.balance) || 0,
        status: booking.status
    });
    setOpenView(true);
  };

  const handleCloseView = () => {
    setOpenView(false);
    setCurrentBooking(defaultBooking);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCurrentBooking(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    const errors = {};
    if (!currentBooking.customerName) errors.customerName = "Customer Name is required";
    if (!currentBooking.phone) errors.phone = "Phone is required";
    if (!currentBooking.room) errors.room = "Room selection is required";
    if (!currentBooking.checkIn) errors.checkIn = "Check-In Date is required";
    if (!currentBooking.checkOut) errors.checkOut = "Check-Out Date is required";
    if (currentBooking.checkIn && currentBooking.checkOut && new Date(currentBooking.checkOut) <= new Date(currentBooking.checkIn)) {
      errors.checkOut = "Check-Out must be after Check-In";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      showSnackbar("Please correct the errors in the form", "error");
      return;
    }
    setFormErrors({});

    try {
      if (isEditing) {
        await updateBooking(currentBooking.id, currentBooking);
        showSnackbar("Booking updated successfully", "success");
      } else {
        await createBooking(currentBooking);
        showSnackbar("Booking created successfully", "success");
      }
      
      handleCloseForm();
      fetchBookingsData(); // Refresh list
      
      // Auto-generate invoice on checkout
      if (currentBooking.status === 'Checked Out') {
        setOpenInvoice(true);
        try {
          await api.post('/invoices', {
            booking_id: currentBooking.id,
            customer_name: currentBooking.customerName,
            subtotal: currentBooking.roomCharges,
            gst: currentBooking.gst,
            discount: 0,
            grand_total: currentBooking.grandTotal,
            payment_method: currentBooking.paymentMethod
          });
        } catch (e) {
          console.error('Invoice auto-generation failed', e);
        }
      }
    } catch (error) {
      showSnackbar("Failed to save booking", "error");
    }
  };

  const handleDelete = (id) => {
    showDialog({
      title: 'Delete Booking',
      content: `Are you sure you want to delete booking ${id}? This cannot be undone.`,
      confirmText: 'Delete',
      onConfirm: async () => {
        try {
          await deleteBooking(id);
          showSnackbar(`Booking ${id} deleted`, "info");
          fetchBookingsData();
        } catch (error) {
          showSnackbar("Failed to delete booking", "error");
        }
      }
    });
  };

  const handleOpenInvoice = (booking) => {
    handleOpenView(booking); // populate state first
    setOpenInvoice(true);
  };

  const handlePrint = (booking) => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Print Booking ${booking.id || booking.id}</title>
          <style>
            body { font-family: sans-serif; padding: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            .header { text-align: center; margin-bottom: 30px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>Kach Inn</h2>
            <h3>Booking Invoice / Details</h3>
          </div>
          <p><strong>Booking ID:</strong> ${booking.id || booking.id}</p>
          <p><strong>Customer Name:</strong> ${booking.customerName || booking.customer_name}</p>
          <p><strong>Phone:</strong> ${booking.phone}</p>
          
          <table>
            <tr><th>Room</th><td>${booking.room || booking.room_number}</td></tr>
            <tr><th>Check In</th><td>${(booking.checkIn || booking.check_in).substring(0,10)}</td></tr>
            <tr><th>Check Out</th><td>${(booking.checkOut || booking.check_out).substring(0,10)}</td></tr>
            <tr><th>Days</th><td>${booking.days}</td></tr>
            <tr><th>Room Charges</th><td>$${booking.roomCharges || booking.room_charges}</td></tr>
            <tr><th>GST (18%)</th><td>$${booking.gst}</td></tr>
            <tr><th>Grand Total</th><td>$${booking.grandTotal || booking.grand_total}</td></tr>
            <tr><th>Advance Paid</th><td>$${booking.advance}</td></tr>
            <tr><th>Balance Amount</th><td><strong>$${booking.balance}</strong></td></tr>
          </table>
          <script>window.print(); window.close();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleExportMenuOpen = (event) => setExportAnchorEl(event.currentTarget);
  const handleExportMenuClose = () => setExportAnchorEl(null);

  const fetchExportData = async () => {
    try {
      const params = {
        q: searchQuery, date: dateFilter, roomType: roomTypeFilter,
        status: statusFilter, paymentStatus: paymentStatusFilter,
        sortBy, sortOrder
      };
      const data = await exportBookings(params);
      if (!data || data.length === 0) {
        showSnackbar("No data to export", "info");
        return null;
      }
      return data;
    } catch (error) {
      showSnackbar("Failed to fetch export data", "error");
      return null;
    }
  };

  const formatExportData = (data) => {
    return data.map(b => ({
      'Booking ID': b.id,
      'Customer Name': b.customer_name,
      'Phone': b.phone,
      'Room Number': b.room_number,
      'Room Type': b.room_type || 'Unknown',
      'Check In': b.check_in ? b.check_in.split('T')[0] : '',
      'Check Out': b.check_out ? b.check_out.split('T')[0] : '',
      'Status': b.status,
      'Grand Total': `$${parseFloat(b.grand_total).toFixed(2)}`,
      'Balance': `$${parseFloat(b.balance).toFixed(2)}`
    }));
  };

  const handleExportCSV = async () => {
    handleExportMenuClose();
    const data = await fetchExportData();
    if (!data) return;

    const formattedData = formatExportData(data);
    const headers = Object.keys(formattedData[0]);
    const csvContent = [
      headers.join(','),
      ...formattedData.map(row => headers.map(h => `"${row[h]}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'KachInn_Bookings.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportExcel = async () => {
    handleExportMenuClose();
    const data = await fetchExportData();
    if (!data) return;

    const formattedData = formatExportData(data);
    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Bookings");
    XLSX.writeFile(workbook, "KachInn_Bookings.xlsx");
  };

  const handleExportPDF = async () => {
    handleExportMenuClose();
    const data = await fetchExportData();
    if (!data) return;

    const formattedData = formatExportData(data);
    const doc = new jsPDF('landscape');
    
    doc.text("Kach Inn - Bookings Export", 14, 15);
    
    const headers = Object.keys(formattedData[0]);
    const rows = formattedData.map(row => headers.map(h => row[h]));

    autoTable(doc, {
      head: [headers],
      body: rows,
      startY: 20,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [33, 150, 243] }
    });

    doc.save("KachInn_Bookings.pdf");
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary' }}>
          Booking Management
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button 
            variant="outlined" 
            color="secondary"
            startIcon={<DownloadIcon />}
            onClick={handleExportMenuOpen}
          >
            Export
          </Button>
          <Menu
            anchorEl={exportAnchorEl}
            open={Boolean(exportAnchorEl)}
            onClose={handleExportMenuClose}
          >
            <MenuItem onClick={handleExportCSV}>Export as CSV</MenuItem>
            <MenuItem onClick={handleExportExcel}>Export as Excel</MenuItem>
            <MenuItem onClick={handleExportPDF}>Export as PDF</MenuItem>
          </Menu>
          <Button 
            variant="contained" 
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => handleOpenForm()}
          >
            Add Booking
          </Button>
        </Box>
      </Box>

      {/* Filters/Search */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={5}>
              <TextField
                placeholder="Search Customer, Phone, Booking ID, Room, Invoice..."
                variant="outlined"
                size="small"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setPage(0); }}
                fullWidth
                sx={{
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
            </Grid>
            <Grid item xs={12} md={7} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button 
                startIcon={<FilterIcon />} 
                variant={showFilters ? "contained" : "outlined"} 
                onClick={() => setShowFilters(!showFilters)}
                color="secondary"
              >
                Advanced Filters
              </Button>
            </Grid>
          </Grid>

          <Collapse in={showFilters}>
            <Box sx={{ mt: 3, p: 2, bgcolor: 'background.default' }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField 
                    fullWidth type="date" label="Date (Check-in/out)" 
                    size="small" value={dateFilter} 
                    onChange={(e) => { setDateFilter(e.target.value); setPage(0); }} 
                    InputLabelProps={{ shrink: true }} 
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField fullWidth select label="Room Type" size="small" value={roomTypeFilter} onChange={(e) => { setRoomTypeFilter(e.target.value); setPage(0); }}>
                    <MenuItem value="All">All Room Types</MenuItem>
                    <MenuItem value="Standard">Standard</MenuItem>
                    <MenuItem value="Deluxe">Deluxe</MenuItem>
                    <MenuItem value="Suite">Suite</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField fullWidth select label="Booking Status" size="small" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}>
                    <MenuItem value="All">All Statuses</MenuItem>
                    <MenuItem value="Pending">Pending</MenuItem>
                    <MenuItem value="Confirmed">Confirmed</MenuItem>
                    <MenuItem value="Checked In">Checked In</MenuItem>
                    <MenuItem value="Checked Out">Checked Out</MenuItem>
                    <MenuItem value="Cancelled">Cancelled</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField fullWidth select label="Payment Status" size="small" value={paymentStatusFilter} onChange={(e) => { setPaymentStatusFilter(e.target.value); setPage(0); }}>
                    <MenuItem value="All">All Payments</MenuItem>
                    <MenuItem value="Paid">Fully Paid (Balance 0)</MenuItem>
                    <MenuItem value="Pending">Pending Balance</MenuItem>
                  </TextField>
                </Grid>
              </Grid>
            </Box>
          </Collapse>
        </CardContent>
      </Card>

      {/* Booking List Table */}
      <Card>
        <TableContainer component={Paper} elevation={0}>
          <Table sx={{ minWidth: 800 }}>
            <TableHead>
              <TableRow sx={{ bgcolor: 'background.default', height: '56px' }}>
                <TableCell sx={{ minWidth: 80, fontWeight: 700, color: 'text.secondary', letterSpacing: '0.05em', whiteSpace: 'nowrap', verticalAlign: 'middle', px: 2 }}>
                  <TableSortLabel active={sortBy === 'id'} direction={sortBy === 'id' ? sortOrder : 'asc'} onClick={() => handleSort('id')}>
                    ID
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ minWidth: 160, fontWeight: 700, color: 'text.secondary', letterSpacing: '0.05em', whiteSpace: 'nowrap', verticalAlign: 'middle', px: 2 }}>
                  <TableSortLabel active={sortBy === 'customer_name'} direction={sortBy === 'customer_name' ? sortOrder : 'asc'} onClick={() => handleSort('customer_name')}>
                    CUSTOMER
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ minWidth: 120, fontWeight: 700, color: 'text.secondary', letterSpacing: '0.05em', whiteSpace: 'nowrap', verticalAlign: 'middle', px: 2 }}>
                  <TableSortLabel active={sortBy === 'room_number'} direction={sortBy === 'room_number' ? sortOrder : 'asc'} onClick={() => handleSort('room_number')}>
                    ROOM
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ minWidth: 160, fontWeight: 700, color: 'text.secondary', letterSpacing: '0.05em', whiteSpace: 'nowrap', verticalAlign: 'middle', px: 2 }}>
                  <TableSortLabel active={sortBy === 'check_in'} direction={sortBy === 'check_in' ? sortOrder : 'asc'} onClick={() => handleSort('check_in')}>
                    CHECK-IN
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ minWidth: 160, fontWeight: 700, color: 'text.secondary', letterSpacing: '0.05em', whiteSpace: 'nowrap', verticalAlign: 'middle', px: 2 }}>
                  <TableSortLabel active={sortBy === 'check_out'} direction={sortBy === 'check_out' ? sortOrder : 'asc'} onClick={() => handleSort('check_out')}>
                    CHECK-OUT
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ minWidth: 140, fontWeight: 700, color: 'text.secondary', letterSpacing: '0.05em', whiteSpace: 'nowrap', verticalAlign: 'middle', px: 2 }}>
                  <TableSortLabel active={sortBy === 'status'} direction={sortBy === 'status' ? sortOrder : 'asc'} onClick={() => handleSort('status')}>
                    STATUS
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ minWidth: 140, fontWeight: 700, color: 'text.secondary', letterSpacing: '0.05em', whiteSpace: 'nowrap', verticalAlign: 'middle', px: 2 }}>
                  <TableSortLabel active={sortBy === 'grand_total'} direction={sortBy === 'grand_total' ? sortOrder : 'asc'} onClick={() => handleSort('grand_total')}>
                    PAYMENT
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ minWidth: 180, fontWeight: 700, color: 'text.secondary', textAlign: 'center', letterSpacing: '0.05em', whiteSpace: 'nowrap', verticalAlign: 'middle', px: 2 }}>ACTIONS</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                // Skeleton Rows
                Array.from(new Array(rowsPerPage)).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell><Skeleton width="80%" /></TableCell>
                    <TableCell><Skeleton width="100%" /><Skeleton width="60%" /></TableCell>
                    <TableCell><Skeleton width="50%" /></TableCell>
                    <TableCell><Skeleton width="80%" /></TableCell>
                    <TableCell><Skeleton width="80%" /></TableCell>
                    <TableCell><Skeleton width="80%" height={32} /></TableCell>
                    <TableCell><Skeleton width="100%" /><Skeleton width="50%" /></TableCell>
                    <TableCell align="right"><Skeleton width={100} sx={{ ml: 'auto' }} /></TableCell>
                  </TableRow>
                ))
              ) : bookings.length > 0 ? (
                bookings.map((row) => (
                  <TableRow key={row.id} sx={{ '&:last-child td, &:last-child th': { border: 0 }, '&:hover': { bgcolor: 'action.hover' } }}>
                    <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>{row.id}</TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>{row.customer_name}</Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>{row.phone}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main' }}>{row.room_number}</Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>{row.room_type || 'Unknown'}</Typography>
                    </TableCell>
                    <TableCell sx={{ color: 'text.secondary' }}>{row.check_in?.substring(0, 10)}</TableCell>
                    <TableCell sx={{ color: 'text.secondary' }}>{row.check_out?.substring(0, 10)}</TableCell>
                    <TableCell>
                      <Chip 
                        label={row.status} 
                        size="small"
                        sx={{ 
                          bgcolor: `${getStatusColor(row.status)}15`, 
                          color: getStatusColor(row.status),
                          fontWeight: 600
                        }} 
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ color: 'text.primary' }}>Total: ${parseFloat(row.grand_total).toFixed(2)}</Typography>
                      <Typography variant="caption" sx={{ color: parseFloat(row.balance) > 0 ? 'error.main' : 'success.main', fontWeight: 600 }}>
                        Bal: ${parseFloat(row.balance).toFixed(2)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="View">
                        <IconButton size="small" onClick={() => handleOpenView(row)} sx={{ bgcolor: 'rgba(2, 136, 209, 0.08)', color: 'info.main', '&:hover': { bgcolor: 'info.main', color: '#fff' }, mr: 0.5 }}>
                          <ViewIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit">
                        <IconButton size="small" onClick={() => handleOpenForm(row)} sx={{ bgcolor: 'rgba(237, 108, 2, 0.08)', color: 'warning.main', '&:hover': { bgcolor: 'warning.main', color: '#fff' }, mr: 0.5 }}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Print Slip">
                        <IconButton size="small" onClick={() => handlePrint(row)} sx={{ bgcolor: 'rgba(158, 158, 158, 0.08)', color: 'text.secondary', '&:hover': { bgcolor: 'text.secondary', color: '#fff' }, mr: 0.5 }}>
                          <PrintIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      {row.status === 'Checked Out' && (
                        <Tooltip title="View Invoice">
                          <IconButton size="small" onClick={() => handleOpenInvoice(row)} sx={{ bgcolor: 'rgba(46, 125, 50, 0.08)', color: 'success.main', '&:hover': { bgcolor: 'success.main', color: '#fff' }, mr: 0.5 }}>
                            <ReceiptLongIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      <Tooltip title="Delete">
                        <IconButton size="small" onClick={() => handleDelete(row.id)} sx={{ bgcolor: 'rgba(211, 47, 47, 0.08)', color: 'error.main', '&:hover': { bgcolor: 'error.main', color: '#fff' } }}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                    <EmptyState 
                      icon={<EventNoteIcon sx={{ fontSize: 80 }} />}
                      title="No Bookings Found"
                      description="You don't have any bookings that match your filters."
                      actionText="Clear Filters"
                      onAction={() => { setSearchQuery(''); setDateFilter(''); setRoomTypeFilter('All'); setStatusFilter('All'); setPaymentStatusFilter('All'); }}
                    />
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={totalCount}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
        />
      </Card>

      {/* Add/Edit Booking Form Dialog */}
      <Dialog open={openForm} onClose={handleCloseForm} maxWidth="md" fullWidth fullScreen={fullScreen}>
        <DialogTitle sx={{ pb: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {isEditing ? 'Edit Booking' : 'Add New Booking'}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ p: 4, display: 'flex', flexDirection: 'column', gap: 4 }}>
          
          {/* Customer Details Section */}
          <Box>
            <Typography variant="subtitle2" sx={{ color: 'primary.main', fontWeight: 700, mb: 2, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '2px solid', borderColor: 'primary.main', display: 'inline-block', pb: 0.5 }}>
              Customer Details
            </Typography>
            <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField 
                    fullWidth 
                    label="Customer Name" 
                    name="customerName" 
                    size="small"
                    value={currentBooking.customerName} 
                    onChange={handleChange} 
                    required
                    error={!!formErrors.customerName}
                    helperText={formErrors.customerName}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField 
                    fullWidth 
                    label="Phone" 
                    name="phone" 
                    size="small"
                    value={currentBooking.phone} 
                    onChange={handleChange} 
                    required
                    error={!!formErrors.phone}
                    helperText={formErrors.phone}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField fullWidth label="Email" name="email" type="email" size="small" value={currentBooking.email} onChange={handleChange} />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField fullWidth select label="ID Proof Type" name="idProofType" size="small" value={currentBooking.idProofType} onChange={handleChange}>
                    {['Aadhar', 'Passport', 'Driving License', 'Voter ID'].map(option => (
                      <MenuItem key={option} value={option}>{option}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField fullWidth label="ID Number" name="idNumber" size="small" value={currentBooking.idNumber} onChange={handleChange} required />
                </Grid>
                <Grid item xs={12} sm={12} md={9}>
                  <TextField fullWidth label="Address" name="address" size="small" value={currentBooking.address} onChange={handleChange} />
                </Grid>
            </Grid>
          </Box>

          {/* Booking Details Section */}
          <Box>
            <Typography variant="subtitle2" sx={{ color: 'primary.main', fontWeight: 700, mb: 2, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '2px solid', borderColor: 'primary.main', display: 'inline-block', pb: 0.5 }}>
              Booking Details
            </Typography>
            <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4}>
              <TextField 
                fullWidth 
                type="date" 
                label="Check-in Date" 
                name="checkIn" 
                size="small" 
                value={currentBooking.checkIn} 
                onChange={handleChange} 
                InputLabelProps={{ shrink: true }} 
                required 
                error={!!formErrors.checkIn}
                helperText={formErrors.checkIn}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField 
                fullWidth 
                type="date" 
                label="Check-out Date" 
                name="checkOut" 
                size="small" 
                value={currentBooking.checkOut} 
                onChange={handleChange} 
                InputLabelProps={{ shrink: true }} 
                required 
                error={!!formErrors.checkOut}
                helperText={formErrors.checkOut}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField 
                fullWidth 
                select 
                label="Select Room" 
                name="room" 
                size="small" 
                value={currentBooking.room} 
                onChange={handleChange} 
                required
                error={!!formErrors.room}
                helperText={formErrors.room}
              >
                {roomsData.map(room => (
                  <MenuItem key={room.roomNumber} value={room.roomNumber}>
                    {room.roomNumber} - {room.type} (${room.price})
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField fullWidth type="number" label="Number of Guests" name="guests" size="small" value={currentBooking.guests} onChange={handleChange} inputProps={{ min: 1 }} required />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField fullWidth select label="Status" name="status" size="small" value={currentBooking.status} onChange={handleChange}>
                {['Pending', 'Confirmed', 'Checked In', 'Checked Out', 'Cancelled'].map(option => (
                  <MenuItem key={option} value={option}>{option}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={12} md={12}>
              <TextField fullWidth label="Special Requests" name="specialRequests" size="small" value={currentBooking.specialRequests} onChange={handleChange} />
            </Grid>
            </Grid>
          </Box>

          {/* Payment Details Section */}
          <Box>
            <Typography variant="subtitle2" sx={{ color: 'primary.main', fontWeight: 700, mb: 2, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '2px solid', borderColor: 'primary.main', display: 'inline-block', pb: 0.5 }}>
              Financials
            </Typography>
            <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <TextField fullWidth select label="Payment Method" name="paymentMethod" size="small" value={currentBooking.paymentMethod} onChange={handleChange}>
                {['Cash', 'Credit Card', 'UPI', 'Bank Transfer'].map(option => (
                  <MenuItem key={option} value={option}>{option}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField fullWidth type="number" label="Advance Amount" name="advance" size="small" value={currentBooking.advance} onChange={handleChange} InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }} />
            </Grid>
            </Grid>
          </Box>
            
          {/* Auto-Calculated Fields Display */}
          <Box sx={{ mt: 2 }}>
              <Paper sx={{ p: 2, bgcolor: 'background.default', display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                <Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>DAYS</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 700 }}>{currentBooking.days}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>ROOM CHARGES</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 700 }}>${currentBooking.roomCharges.toFixed(2)}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>GST (18%)</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 700 }}>${currentBooking.gst.toFixed(2)}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>GRAND TOTAL</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 700, color: 'primary.main' }}>${currentBooking.grandTotal.toFixed(2)}</Typography>
                </Box>
                <Box sx={{ ml: 'auto' }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>BALANCE DUE</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: currentBooking.balance > 0 ? 'error.main' : 'success.main' }}>
                    ${currentBooking.balance.toFixed(2)}
                  </Typography>
                </Box>
              </Paper>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={handleCloseForm} color="inherit" sx={{ fontWeight: 600 }}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" color="primary" sx={{ fontWeight: 600 }}>
            Save Booking
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Booking Dialog */}
      <Dialog open={openView} onClose={handleCloseView} maxWidth="sm" fullWidth fullScreen={fullScreen}>
        <DialogTitle sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" sx={{ fontWeight: 700 }}>Booking Details</Typography>
            <Chip 
              label={currentBooking.status} 
              size="small"
              sx={{ 
                bgcolor: `${getStatusColor(currentBooking.status)}15`, 
                color: getStatusColor(currentBooking.status),
                fontWeight: 600
              }} 
            />
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>BOOKING ID</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>{currentBooking.id}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>CUSTOMER NAME</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>{currentBooking.customerName}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>PHONE</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>{currentBooking.phone}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>ROOM</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>{currentBooking.room}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>CHECK IN</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>{currentBooking.checkIn}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>CHECK OUT</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>{currentBooking.checkOut}</Typography>
            </Grid>
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>GRAND TOTAL</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>${currentBooking.grandTotal?.toFixed(2)}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>BALANCE</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600, color: currentBooking.balance > 0 ? 'error.main' : 'success.main' }}>
                ${currentBooking.balance?.toFixed(2)}
              </Typography>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button onClick={handleCloseView} color="inherit" sx={{ fontWeight: 600 }}>Close</Button>
          <Button onClick={() => handlePrint(currentBooking)} variant="outlined" startIcon={<PrintIcon />} sx={{ fontWeight: 600 }}>
            Print
          </Button>
        </DialogActions>
      </Dialog>

      {/* Invoice Full Screen Dialog */}
      <Dialog 
        open={openInvoice} 
        onClose={() => setOpenInvoice(false)} 
        maxWidth="md" 
        fullWidth
        fullScreen={fullScreen}
        PaperProps={{ sx: { bgcolor: '#f5f8fa', minHeight: '80vh' } }}
      >
        <InvoiceDocument booking={currentBooking} onClose={() => setOpenInvoice(false)} />
      </Dialog>
    </Box>
  );
};

export default Bookings;
