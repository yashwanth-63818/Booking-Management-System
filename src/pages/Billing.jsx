import React, { useState, useRef } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Chip
} from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import HotelIcon from '@mui/icons-material/Hotel';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const Billing = () => {
  const [invoiceGenerated, setInvoiceGenerated] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('Credit Card');
  const invoiceRef = useRef(null);

  const customerDetails = {
    name: 'Alexander Pierce',
    email: 'alexander.pierce@example.com',
    phone: '+1 (555) 123-4567',
    address: '789 Elite Boulevard, Penthouse 4, Metropolis, NY 10001',
  };

  const bookingDetails = {
    bookingId: 'BK-987654',
    checkIn: '2023-10-15',
    checkOut: '2023-10-18',
    roomType: 'Presidential Suite',
    roomNumber: 'PH-01',
    nights: 3,
  };

  const roomCharges = 850 * bookingDetails.nights;
  const extraCharges = 350; // Room Service, Spa, Mini Bar
  const subTotal = roomCharges + extraCharges;
  const discount = 150; // VIP Member discount
  const gstRate = 0.18; // 18% Taxes
  const gstAmount = (subTotal - discount) * gstRate;
  const grandTotal = (subTotal - discount) + gstAmount;

  const handleGenerateInvoice = () => {
    setInvoiceGenerated(true);
  };

  const handlePrint = () => {
    const printContent = invoiceRef.current;
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Print Invoice</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;800&display=swap');
            body { font-family: 'Inter', sans-serif; padding: 40px; color: #111827; }
            .print-container { width: 100%; max-width: 850px; margin: 0 auto; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { border-bottom: 2px solid #1a237e; padding: 12px 8px; text-align: left; text-transform: uppercase; font-size: 12px; letter-spacing: 0.05em; color: #6b7280; }
            td { border-bottom: 1px solid #f3f4f6; padding: 16px 8px; text-align: left; }
            .text-right { text-align: right; }
          </style>
        </head>
        <body>
          <div class="print-container">
            ${printContent.innerHTML}
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const handleDownloadPDF = () => {
    const input = invoiceRef.current;
    html2canvas(input, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Invoice-${bookingDetails.bookingId}.pdf`);
    });
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#f9fafb', minHeight: '100vh' }}>
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, mb: 4, gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight="800" sx={{ color: '#111827', letterSpacing: '-0.02em', mb: 0.5 }}>Billing & Invoices</Typography>
          <Typography variant="body2" color="text.secondary">Manage guest billing and generate premium invoices.</Typography>
        </Box>
        {!invoiceGenerated ? (
          <Button 
            variant="contained" 
            startIcon={<ReceiptLongIcon />}
            onClick={handleGenerateInvoice}
            sx={{ bgcolor: '#1a237e', '&:hover': { bgcolor: '#121858' }, borderRadius: 2, px: 3, py: 1.2, textTransform: 'none', boxShadow: '0 4px 14px rgba(26, 35, 126, 0.3)' }}
          >
            Generate Invoice
          </Button>
        ) : (
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button 
              variant="outlined" 
              startIcon={<PrintIcon />}
              onClick={handlePrint}
              sx={{ borderColor: '#e5e7eb', color: '#374151', '&:hover': { borderColor: '#d1d5db', bgcolor: '#f3f4f6' }, borderRadius: 2, px: 3, textTransform: 'none' }}
            >
              Print
            </Button>
            <Button 
              variant="contained" 
              startIcon={<PictureAsPdfIcon />}
              onClick={handleDownloadPDF}
              sx={{ bgcolor: '#1a237e', '&:hover': { bgcolor: '#121858' }, borderRadius: 2, px: 3, textTransform: 'none', boxShadow: '0 4px 14px rgba(26, 35, 126, 0.3)' }}
            >
              Download PDF
            </Button>
          </Box>
        )}
      </Box>

      {invoiceGenerated ? (
        <Card sx={{ maxWidth: 850, margin: '0 auto', borderRadius: 4, boxShadow: '0 12px 40px rgba(0,0,0,0.06)', overflow: 'visible', position: 'relative' }}>
          {/* Premium decorative top border */}
          <Box sx={{ height: 6, width: '100%', background: 'linear-gradient(90deg, #1a237e 0%, #d4af37 100%)', borderTopLeftRadius: 16, borderTopRightRadius: 16, position: 'absolute', top: 0, left: 0 }} />
          
          <CardContent ref={invoiceRef} sx={{ p: { xs: 4, md: 6 }, pt: { xs: 6, md: 8 } }}>
            {/* Header section */}
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, mb: 6, gap: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ bgcolor: '#1a237e', p: 1.5, borderRadius: 2, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <HotelIcon sx={{ fontSize: 32, color: '#d4af37' }} />
                </Box>
                <Box>
                  <Typography variant="h5" fontWeight="800" sx={{ color: '#1a237e', letterSpacing: '0.05em', lineHeight: 1.2 }}>KACH INN</Typography>
                  <Typography variant="caption" sx={{ color: '#6b7280', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600 }}>Luxury Hotel & Spa</Typography>
                </Box>
              </Box>
              <Box sx={{ textAlign: { xs: 'left', md: 'right' } }}>
                <Typography variant="h3" fontWeight="300" sx={{ color: '#111827', mb: 1, letterSpacing: '-0.02em' }}>INVOICE</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}><strong>Invoice #:</strong> <span style={{ color: '#111827' }}>INV-{bookingDetails.bookingId}</span></Typography>
                <Typography variant="body2" color="text.secondary"><strong>Date:</strong> <span style={{ color: '#111827' }}>{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span></Typography>
              </Box>
            </Box>

            <Divider sx={{ mb: 5, borderColor: '#f3f4f6' }} />

            {/* Customer & Booking Details */}
            <Grid container spacing={4} mb={6}>
              <Grid item xs={12} md={6}>
                <Typography variant="overline" sx={{ color: '#9ca3af', letterSpacing: '0.05em', fontWeight: 600 }}>Bill To</Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#111827', mt: 1, mb: 1 }}>{customerDetails.name}</Typography>
                <Typography variant="body2" sx={{ color: '#4b5563', mb: 0.5 }}>{customerDetails.address}</Typography>
                <Typography variant="body2" sx={{ color: '#4b5563', mb: 0.5 }}>{customerDetails.phone}</Typography>
                <Typography variant="body2" sx={{ color: '#4b5563' }}>{customerDetails.email}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ bgcolor: '#f9fafb', p: 3, borderRadius: 3 }}>
                  <Typography variant="overline" sx={{ color: '#9ca3af', letterSpacing: '0.05em', fontWeight: 600 }}>Stay Details</Typography>
                  <Box sx={{ mt: 2, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Check-in</Typography>
                      <Typography variant="body2" fontWeight="600" color="#111827">{bookingDetails.checkIn}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Check-out</Typography>
                      <Typography variant="body2" fontWeight="600" color="#111827">{bookingDetails.checkOut}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Room</Typography>
                      <Typography variant="body2" fontWeight="600" color="#111827">{bookingDetails.roomType} ({bookingDetails.roomNumber})</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Duration</Typography>
                      <Typography variant="body2" fontWeight="600" color="#111827">{bookingDetails.nights} Nights</Typography>
                    </Box>
                  </Box>
                </Box>
              </Grid>
            </Grid>

            {/* Charges Table */}
            <TableContainer sx={{ mb: 4, overflow: 'visible' }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ borderBottom: '2px solid #1a237e' }}>
                    <TableCell sx={{ textTransform: 'uppercase', fontWeight: 700, color: '#6b7280', letterSpacing: '0.05em', border: 'none', py: 2, pl: 0 }}>Description</TableCell>
                    <TableCell align="right" sx={{ textTransform: 'uppercase', fontWeight: 700, color: '#6b7280', letterSpacing: '0.05em', border: 'none', py: 2, pr: 0 }}>Amount</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow sx={{ '& td': { borderBottom: '1px solid #f3f4f6', py: 2.5, px: 0 } }}>
                    <TableCell>
                      <Typography variant="body1" fontWeight="500" color="#111827">Accommodation</Typography>
                      <Typography variant="body2" color="text.secondary">{bookingDetails.nights} nights @ \${roomCharges / bookingDetails.nights}/night</Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body1" fontWeight="600" color="#111827">\${roomCharges.toFixed(2)}</Typography>
                    </TableCell>
                  </TableRow>
                  <TableRow sx={{ '& td': { borderBottom: '1px solid #f3f4f6', py: 2.5, px: 0 } }}>
                    <TableCell>
                      <Typography variant="body1" fontWeight="500" color="#111827">Premium Services</Typography>
                      <Typography variant="body2" color="text.secondary">Room Service, Spa treatments, Mini Bar</Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body1" fontWeight="600" color="#111827">\${extraCharges.toFixed(2)}</Typography>
                    </TableCell>
                  </TableRow>
                  <TableRow sx={{ '& td': { borderBottom: '1px solid #f3f4f6', py: 2.5, px: 0 } }}>
                    <TableCell>
                      <Typography variant="body1" fontWeight="500" color="#059669">VIP Discount</Typography>
                      <Typography variant="body2" color="#10b981">Special promotional offer applied</Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body1" fontWeight="600" color="#059669">-\${discount.toFixed(2)}</Typography>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>

            {/* Totals Section */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 6 }}>
              <Box sx={{ width: { xs: '100%', md: '50%' } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1.5 }}>
                  <Typography variant="body1" color="text.secondary">Subtotal</Typography>
                  <Typography variant="body1" fontWeight="600" color="#111827">\${(subTotal - discount).toFixed(2)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1.5, borderBottom: '1px solid #f3f4f6' }}>
                  <Typography variant="body1" color="text.secondary">Taxes & Fees (18%)</Typography>
                  <Typography variant="body1" fontWeight="600" color="#111827">\${gstAmount.toFixed(2)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 3 }}>
                  <Typography variant="h6" fontWeight="700" color="#111827">Total Due</Typography>
                  <Typography variant="h5" fontWeight="800" sx={{ color: '#1a237e' }}>\${grandTotal.toFixed(2)}</Typography>
                </Box>
              </Box>
            </Box>

            {/* Footer / Payment Info */}
            <Box sx={{ bgcolor: '#f9fafb', p: 3, borderRadius: 3, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2 }}>
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Payment Method</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, gap: 1 }}>
                  <Chip label={paymentMethod} size="small" sx={{ bgcolor: '#1a237e', color: 'white', fontWeight: 600 }} />
                  <Typography variant="body2" color="text.secondary">Ending in 4242</Typography>
                </Box>
              </Box>
              <Box sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
                <Typography variant="body2" fontWeight="600" color="#111827">Thank you for choosing Kach Inn!</Typography>
                <Typography variant="caption" color="text.secondary">We hope to welcome you back soon.</Typography>
              </Box>
            </Box>

          </CardContent>
        </Card>
      ) : (
        <Card sx={{ maxWidth: 600, margin: '0 auto', borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
              <Box sx={{ p: 1.5, bgcolor: '#eff6ff', borderRadius: 2, color: '#1d4ed8' }}>
                <ReceiptLongIcon />
              </Box>
              <Typography variant="h6" fontWeight="700" color="#111827">Generate New Invoice</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
              Enter the booking details to fetch the information and generate a premium PDF invoice.
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField 
                  fullWidth 
                  label="Booking ID" 
                  defaultValue="BK-987654" 
                  variant="outlined"
                  InputProps={{ sx: { borderRadius: 2 } }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel>Payment Method</InputLabel>
                  <Select
                    value={paymentMethod}
                    label="Payment Method"
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    sx={{ borderRadius: 2 }}
                  >
                    <MenuItem value="Cash">Cash</MenuItem>
                    <MenuItem value="Credit Card">Credit Card</MenuItem>
                    <MenuItem value="Bank Transfer">Bank Transfer</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default Billing;
