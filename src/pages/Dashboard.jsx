import React, { useState, useEffect } from 'react';
import { Box, Grid, Typography, CircularProgress, Card, CardContent, Skeleton } from '@mui/material';
import HotelIcon from '@mui/icons-material/Hotel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import PeopleIcon from '@mui/icons-material/People';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import CleaningServicesIcon from '@mui/icons-material/CleaningServices';
import ReceiptIcon from '@mui/icons-material/Receipt';
import { getDashboardAnalytics } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Sparkline = ({ color }) => (
  <svg width="48" height="24" viewBox="0 0 48 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 20C10 20 12 4 20 8C28 12 30 18 38 10C42 6 44 4 46 2" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const MetricCard = ({ icon, label, value, secondaryText, secondaryTextColor = '#6B6B6B', sparklineColor }) => (
  <Card sx={{ 
    height: '100%', 
    borderRadius: '24px', 
    boxShadow: '0px 2px 12px rgba(0, 0, 0, 0.04)', 
    border: 'none', 
    transition: 'transform 0.2s, box-shadow 0.2s', 
    '&:hover': { transform: 'translateY(-2px)', boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.08)' }
  }}>
    <CardContent sx={{ p: 3, '&:last-child': { pb: 3 }, display: 'flex', alignItems: 'center', gap: 2.5 }}>
      <Box sx={{ 
        width: 56, 
        height: 56, 
        borderRadius: '50%', 
        bgcolor: '#F4EFEB', 
        color: '#8C5A35', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        flexShrink: 0
      }}>
        {React.cloneElement(icon, { fontSize: 'medium' })}
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', flexGrow: 1, alignItems: 'flex-start', justifyContent: 'center' }}>
        <Typography variant="body2" sx={{ color: '#1F1F1F', fontWeight: 600, mb: 0.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {label}
        </Typography>
        <Typography variant="h3" sx={{ fontWeight: 700, color: '#1F1F1F', mb: 0.5, lineHeight: 1 }}>
          {value}
        </Typography>
        <Typography variant="caption" sx={{ color: secondaryTextColor, fontWeight: 500, display: 'flex', alignItems: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {secondaryText}
        </Typography>
      </Box>
      {sparklineColor && (
        <Box sx={{ display: 'flex', alignItems: 'flex-end', height: '100%', ml: 1, pb: 1 }}>
          <Sparkline color={sparklineColor} />
        </Box>
      )}
    </CardContent>
  </Card>
);

const SectionHeader = ({ title }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, mt: 4 }}>
    <Typography variant="h6" sx={{ fontWeight: 700, color: '#1F1F1F', mr: 2, whiteSpace: 'nowrap' }}>
      {title}
    </Typography>
    <Box sx={{ flexGrow: 1, height: '1px', bgcolor: '#E8E2DD' }} />
  </Box>
);

const Dashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getDashboardAnalytics();
        setAnalytics(data);
      } catch (error) {
        console.error('Failed to fetch dashboard data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <Box sx={{ p: { xs: 2, md: 4 } }}>
        <Skeleton variant="text" width={250} height={40} sx={{ mb: 4 }} />
        {[1,2,3].map((section) => (
          <Box key={section} sx={{ mb: 4 }}>
            <Skeleton variant="text" width={150} height={30} sx={{ mb: 2 }} />
            <Grid container spacing={3}>
              {[1,2,3,4].map(i => (
                <Grid item xs={12} sm={6} md={3} key={`sk1-${i}`}>
                  <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 3 }} />
                </Grid>
              ))}
            </Grid>
          </Box>
        ))}
      </Box>
    );
  }

  if (!analytics) {
    return <Typography sx={{ p: 4 }}>Error loading analytics data.</Typography>;
  }

  const metrics = analytics?.metrics || {};
  const totalRooms = (metrics.availableRooms || 0) + (metrics.occupiedRooms || 0) + (metrics.reservedRooms || 0) || 48;

  // Calculate percentages safely
  const availablePercent = totalRooms ? (((metrics.availableRooms || 0) / totalRooms) * 100).toFixed(1) : 0;
  const occupiedPercent = totalRooms ? (((metrics.occupiedRooms || 0) / totalRooms) * 100).toFixed(1) : 0;
  const reservedPercent = totalRooms ? (((metrics.reservedRooms || 0) / totalRooms) * 100).toFixed(1) : 0;

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#F7F5F2', minHeight: '100vh' }}>
      
      {/* Header Section */}
      <Box sx={{ mb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#1F1F1F', mb: 0.5 }}>
            Kach Inn Management
          </Typography>
          <Typography variant="body2" sx={{ color: '#6B6B6B' }}>
            Welcome back, {user?.name?.split(' ')[0] || 'Yash'}! Here's what's happening today.
          </Typography>
        </Box>
        <Box sx={{ display: { xs: 'none', md: 'block' }, opacity: 0.8 }}>
          <img src="/illustration-placeholder.svg" alt="" style={{ height: '100px', width: 'auto' }} onError={(e) => e.target.style.display = 'none'} />
        </Box>
      </Box>

      {/* Row 1: Accommodation Overview */}
      <SectionHeader title="Accommodation Overview" />
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3} lg={3} xl={3}>
          <MetricCard 
            icon={<HotelIcon />} 
            label="Total Rooms" 
            value={totalRooms} 
            secondaryText="All Rooms" 
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3} lg={3} xl={3}>
          <MetricCard 
            icon={<CheckCircleIcon />} 
            label="Available Rooms" 
            value={metrics.availableRooms} 
            secondaryText={`${availablePercent}% Available`} 
            secondaryTextColor="#15803D"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3} lg={3} xl={3}>
          <MetricCard 
            icon={<MeetingRoomIcon />} 
            label="Occupied Rooms" 
            value={metrics.occupiedRooms} 
            secondaryText={`${occupiedPercent}% Occupied`} 
            secondaryTextColor="#DC2626"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3} lg={3} xl={3}>
          <MetricCard 
            icon={<EventAvailableIcon />} 
            label="Reserved Rooms" 
            value={metrics.reservedRooms} 
            secondaryText={`${reservedPercent}% Reserved`} 
            secondaryTextColor="#A9744F"
          />
        </Grid>
      </Grid>

      {/* Row 2: Reception Activities */}
      <SectionHeader title="Reception Activities" />
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3} lg={3} xl={3}>
          <MetricCard 
            icon={<LoginIcon />} 
            label="Today's Check-ins" 
            value={metrics.todaysCheckins} 
            secondaryText="Upcoming arrivals"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3} lg={3} xl={3}>
          <MetricCard 
            icon={<LogoutIcon />} 
            label="Today's Check-outs" 
            value={metrics.todaysCheckouts} 
            secondaryText="Upcoming departures" 
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3} lg={3} xl={3}>
          <MetricCard 
            icon={<PeopleIcon />} 
            label="Current Guests" 
            value={metrics.currentGuests} 
            secondaryText="Guests staying" 
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3} lg={3} xl={3}>
          <MetricCard 
            icon={<CleaningServicesIcon />} 
            label="Housekeeping" 
            value="4" 
            secondaryText="Rooms to clean" 
          />
        </Grid>
      </Grid>

      {/* Row 3: Revenue Overview */}
      <SectionHeader title="Revenue Overview" />
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3} lg={3} xl={3}>
          <MetricCard 
            icon={<AttachMoneyIcon />} 
            label="Revenue Today" 
            value={`₹${Number(metrics.totalRevenueToday || 0).toLocaleString()}`} 
            secondaryText="From 12 bookings"
            sparklineColor="#15803D"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3} lg={3} xl={3}>
          <MetricCard 
            icon={<TrendingUpIcon />} 
            label="Monthly Revenue" 
            value={`₹${Number(metrics.monthlyRevenue || 0).toLocaleString()}`} 
            secondaryText="This month"
            sparklineColor="#15803D"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3} lg={3} xl={3}>
          <MetricCard 
            icon={<AccountBalanceWalletIcon />} 
            label="Pending Payments" 
            value={`₹${Number(metrics.pendingPayments || 0).toLocaleString()}`} 
            secondaryText="From 8 bookings"
            sparklineColor="#F59E0B"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3} lg={3} xl={3}>
          <MetricCard 
            icon={<ReceiptIcon />} 
            label="Pending Invoices" 
            value="11" 
            secondaryText="Total invoices"
            sparklineColor="#DC2626"
          />
        </Grid>
      </Grid>

      <Box sx={{ mt: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #E8E2DD', pt: 3 }}>
        <Typography variant="body2" sx={{ color: '#6B6B6B' }}>
          © 2025 Kach Inn Management. All rights reserved.
        </Typography>
        <Typography variant="body2" sx={{ color: '#6B6B6B' }}>
          Version 1.0.0
        </Typography>
      </Box>
    </Box>
  );
};

export default Dashboard;
