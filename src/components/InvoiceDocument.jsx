import React, { useRef } from 'react';
import { Box, Typography, Button, Paper, Divider, Table, TableBody, TableCell, TableHead, TableRow, Grid } from '@mui/material';
import { Download as DownloadIcon, Print as PrintIcon, Hotel as HotelIcon } from '@mui/icons-material';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const InvoiceDocument = ({ booking, onClose }) => {
  const invoiceRef = useRef(null);

  const handleDownloadPDF = async () => {
    const element = invoiceRef.current;
    if (!element) return;

    try {
      const canvas = await html2canvas(element, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Invoice_${booking.id}.pdf`);
    } catch (error) {
      console.error("Error generating PDF", error);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const invoiceNumber = `INV-${booking.id.replace('BKG-', '')}`;
  const currentDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  // Default values to handle missing data gracefully
  const advance = booking.advance || 0;
  const discount = booking.discount || 0;

  return (
    <Box sx={{ p: 2, bgcolor: '#f5f8fa', minHeight: '100%' }}>
      {/* Action Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mb: 3 }} className="no-print">
        <Button variant="outlined" startIcon={<PrintIcon />} onClick={handlePrint}>
          Print
        </Button>
        <Button variant="contained" color="primary" startIcon={<DownloadIcon />} onClick={handleDownloadPDF}>
          Download PDF
        </Button>
      </Box>

      {/* Invoice Document Wrapper */}
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <Paper 
          ref={invoiceRef}
          elevation={3} 
          sx={{ 
            p: 6, 
            width: '100%', 
            maxWidth: '800px', 
            bgcolor: '#ffffff',
            borderRadius: 0, // paper-like
            color: '#333'
          }}
          className="printable-invoice"
        >
          {/* Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'primary.main' }}>
              <HotelIcon sx={{ fontSize: 40 }} />
              <Typography variant="h4" fontWeight="800" sx={{ letterSpacing: 1 }}>Kach Inn</Typography>
            </Box>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="h4" fontWeight="700" color="text.secondary" gutterBottom>INVOICE</Typography>
              <Typography variant="body2"><strong>Invoice #:</strong> {invoiceNumber}</Typography>
              <Typography variant="body2"><strong>Date:</strong> {currentDate}</Typography>
            </Box>
          </Box>

          {/* Hotel Details vs Customer Details */}
          <Grid container spacing={4} sx={{ mb: 4 }}>
            <Grid item xs={6}>
              <Typography variant="subtitle2" color="text.secondary" fontWeight="700" gutterBottom>BILLED FROM:</Typography>
              <Typography variant="body1" fontWeight="600">Kach Inn Hotels & Resorts</Typography>
              <Typography variant="body2" color="text.secondary">123 Luxury Avenue, Resort City</Typography>
              <Typography variant="body2" color="text.secondary">Email: contact@kachinn.com</Typography>
              <Typography variant="body2" color="text.secondary">Phone: +1 800-KACH-INN</Typography>
            </Grid>
            <Grid item xs={6} sx={{ textAlign: 'right' }}>
              <Typography variant="subtitle2" color="text.secondary" fontWeight="700" gutterBottom>BILLED TO:</Typography>
              <Typography variant="body1" fontWeight="600">{booking.customerName}</Typography>
              <Typography variant="body2" color="text.secondary">{booking.address || 'Address Not Provided'}</Typography>
              <Typography variant="body2" color="text.secondary">{booking.email}</Typography>
              <Typography variant="body2" color="text.secondary">{booking.phone}</Typography>
            </Grid>
          </Grid>

          <Divider sx={{ mb: 4 }} />

          {/* Booking Summary */}
          <Typography variant="h6" fontWeight="700" mb={2}>Booking Details</Typography>
          <Grid container spacing={2} sx={{ mb: 4 }}>
            <Grid item xs={3}>
              <Typography variant="caption" color="text.secondary">Booking ID</Typography>
              <Typography variant="body2" fontWeight="600">{booking.id}</Typography>
            </Grid>
            <Grid item xs={3}>
              <Typography variant="caption" color="text.secondary">Room Number</Typography>
              <Typography variant="body2" fontWeight="600">{booking.room}</Typography>
            </Grid>
            <Grid item xs={3}>
              <Typography variant="caption" color="text.secondary">Check-In</Typography>
              <Typography variant="body2" fontWeight="600">{booking.checkIn}</Typography>
            </Grid>
            <Grid item xs={3}>
              <Typography variant="caption" color="text.secondary">Check-Out</Typography>
              <Typography variant="body2" fontWeight="600">{booking.checkOut}</Typography>
            </Grid>
          </Grid>

          {/* Itemized Table */}
          <Table sx={{ mb: 4, '& th, & td': { borderColor: '#e0e0e0' } }}>
            <TableHead>
              <TableRow sx={{ bgcolor: '#f8f9fa' }}>
                <TableCell><strong>Description</strong></TableCell>
                <TableCell align="center"><strong>Qty/Days</strong></TableCell>
                <TableCell align="right"><strong>Rate</strong></TableCell>
                <TableCell align="right"><strong>Amount</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>Room Accommodation (Room {booking.room})</TableCell>
                <TableCell align="center">{booking.days}</TableCell>
                <TableCell align="right">${(booking.roomCharges / (booking.days || 1)).toFixed(2)}</TableCell>
                <TableCell align="right">${booking.roomCharges.toFixed(2)}</TableCell>
              </TableRow>
              {/* If there were extra services, they would render here */}
            </TableBody>
          </Table>

          {/* Totals Section */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Box sx={{ width: '50%' }}>
              <Grid container spacing={1} sx={{ mb: 1 }}>
                <Grid item xs={6}><Typography variant="body2" color="text.secondary">Subtotal:</Typography></Grid>
                <Grid item xs={6} sx={{ textAlign: 'right' }}><Typography variant="body2">${booking.roomCharges.toFixed(2)}</Typography></Grid>
              </Grid>
              <Grid container spacing={1} sx={{ mb: 1 }}>
                <Grid item xs={6}><Typography variant="body2" color="text.secondary">GST (18%):</Typography></Grid>
                <Grid item xs={6} sx={{ textAlign: 'right' }}><Typography variant="body2">${booking.gst.toFixed(2)}</Typography></Grid>
              </Grid>
              {discount > 0 && (
                <Grid container spacing={1} sx={{ mb: 1 }}>
                  <Grid item xs={6}><Typography variant="body2" color="text.secondary">Discount:</Typography></Grid>
                  <Grid item xs={6} sx={{ textAlign: 'right' }}><Typography variant="body2" color="error.main">-${discount.toFixed(2)}</Typography></Grid>
                </Grid>
              )}
              <Divider sx={{ my: 2 }} />
              <Grid container spacing={1} sx={{ mb: 2 }}>
                <Grid item xs={6}><Typography variant="h6" fontWeight="700">Grand Total:</Typography></Grid>
                <Grid item xs={6} sx={{ textAlign: 'right' }}><Typography variant="h6" fontWeight="700" color="primary.main">${booking.grandTotal.toFixed(2)}</Typography></Grid>
              </Grid>
              
              <Box sx={{ bgcolor: '#f8f9fa', p: 2, borderRadius: 1, mt: 2 }}>
                <Typography variant="caption" color="text.secondary" display="block">Payment Details</Typography>
                <Typography variant="body2" fontWeight="600">Method: {booking.paymentMethod}</Typography>
                <Typography variant="body2" fontWeight="600">Advance Paid: ${advance.toFixed(2)}</Typography>
                <Typography variant="body2" fontWeight="600" color={booking.balance > 0 ? 'error.main' : 'success.main'}>
                  Balance Due: ${booking.balance.toFixed(2)}
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Footer Note */}
          <Box sx={{ mt: 8, textAlign: 'center', borderTop: '1px solid #e0e0e0', pt: 3 }}>
            <Typography variant="body2" color="text.secondary" fontStyle="italic">
              Thank you for choosing Kach Inn! We hope to see you again.
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default InvoiceDocument;
