import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  FormControl,
  Select,
  MenuItem,
  Paper,
  Button
} from '@mui/material';
import {
  LineChart, Line,
  BarChart, Bar,
  AreaChart, Area,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import PeopleIcon from '@mui/icons-material/People';
import HotelIcon from '@mui/icons-material/Hotel';
import DownloadIcon from '@mui/icons-material/Download';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

// Static Base Data
const baseDailyRevenueData = [
  { name: 'Mon', revenue: 4500 },
  { name: 'Tue', revenue: 5200 },
  { name: 'Wed', revenue: 4800 },
  { name: 'Thu', revenue: 6100 },
  { name: 'Fri', revenue: 8500 },
  { name: 'Sat', revenue: 10200 },
  { name: 'Sun', revenue: 9100 },
];

const baseMonthlyRevenueData = [
  { name: 'Jan', revenue: 140000 },
  { name: 'Feb', revenue: 130000 },
  { name: 'Mar', revenue: 155000 },
  { name: 'Apr', revenue: 178000 },
  { name: 'May', revenue: 189000 },
  { name: 'Jun', revenue: 215000 },
  { name: 'Jul', revenue: 234900 },
];

const baseOccupancyRateData = [
  { name: 'Mon', rate: 65 },
  { name: 'Tue', rate: 59 },
  { name: 'Wed', rate: 72 },
  { name: 'Thu', rate: 81 },
  { name: 'Fri', rate: 94 },
  { name: 'Sat', rate: 98 },
  { name: 'Sun', rate: 90 },
];

const baseBookingTrendsData = [
  { name: 'Week 1', online: 45, walkin: 15, corporate: 30 },
  { name: 'Week 2', online: 52, walkin: 12, corporate: 28 },
  { name: 'Week 3', online: 60, walkin: 18, corporate: 35 },
  { name: 'Week 4', online: 65, walkin: 22, corporate: 40 },
];

const baseRoomUsageData = [
  { name: 'Presidential', value: 80 },
  { name: 'Suite', value: 250 },
  { name: 'Deluxe', value: 450 },
  { name: 'Standard', value: 300 },
];

// Premium Color Palette
const COLORS = ['#1a237e', '#d4af37', '#059669', '#7c3aed'];

const StatCard = ({ title, value, icon, color, trend }) => (
  <Card sx={{ 
    height: '100%', 
    borderRadius: 4, 
    boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
    position: 'relative',
    overflow: 'hidden',
    transition: 'transform 0.2s, box-shadow 0.2s',
    '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }
  }}>
    <Box sx={{ position: 'absolute', top: 0, left: 0, width: 4, height: '100%', bgcolor: color }} />
    <CardContent sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="overline" sx={{ color: '#6b7280', fontWeight: 600, letterSpacing: '0.05em' }}>
            {title}
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#111827', mt: 1, mb: 1 }}>
            {value}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <TrendingUpIcon sx={{ fontSize: 16, color: '#059669' }} />
            <Typography variant="caption" sx={{ color: '#059669', fontWeight: 600 }}>
              +{trend}% <span style={{ color: '#9ca3af', fontWeight: 400 }}>vs last period</span>
            </Typography>
          </Box>
        </Box>
        <Box sx={{ p: 1.5, borderRadius: 3, bgcolor: `${color}15`, color: color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {icon}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <Box sx={{ bgcolor: 'white', p: 2, border: '1px solid #f3f4f6', borderRadius: 2, boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
        <Typography variant="subtitle2" sx={{ color: '#111827', mb: 1, fontWeight: 700 }}>{label}</Typography>
        {payload.map((entry, index) => (
          <Typography key={index} variant="body2" sx={{ color: entry.color, fontWeight: 600, display: 'flex', justifyContent: 'space-between', gap: 3 }}>
            <span style={{ textTransform: 'capitalize' }}>{entry.name}:</span>
            <span>{entry.name.toLowerCase().includes('revenue') ? `$\${entry.value.toLocaleString()}` : entry.value}</span>
          </Typography>
        ))}
      </Box>
    );
  }
  return null;
};

const Reports = () => {
  const [timeFilter, setTimeFilter] = useState('This Month');

  // Dynamic Data based on Filter
  const {
    dailyRevenueData,
    monthlyRevenueData,
    occupancyRateData,
    bookingTrendsData,
    roomUsageData,
    KPI_CARDS
  } = React.useMemo(() => {
    let multiplier = 1;
    if (timeFilter === 'Today') multiplier = 0.14; // Approximate for a day vs a week
    if (timeFilter === 'This Week') multiplier = 0.4;
    if (timeFilter === 'This Year') multiplier = 8.5;

    return {
      dailyRevenueData: baseDailyRevenueData.map(d => ({ ...d, revenue: Math.round(d.revenue * (timeFilter === 'This Month' ? 1 : multiplier)) })),
      monthlyRevenueData: baseMonthlyRevenueData.map(d => ({ ...d, revenue: Math.round(d.revenue * (timeFilter === 'This Year' ? 1 : multiplier)) })),
      occupancyRateData: baseOccupancyRateData.map(d => ({ ...d, rate: Math.min(100, Math.round(d.rate * (multiplier === 0.14 ? 0.8 : 1))) })),
      bookingTrendsData: baseBookingTrendsData.map(d => ({ 
        ...d, 
        online: Math.round(d.online * multiplier),
        walkin: Math.round(d.walkin * multiplier),
        corporate: Math.round(d.corporate * multiplier)
      })),
      roomUsageData: baseRoomUsageData.map(d => ({ ...d, value: Math.round(d.value * multiplier) })),
      KPI_CARDS: [
        { title: 'Total Revenue', value: `$\${Math.round(234900 * multiplier).toLocaleString()}`, icon: <AttachMoneyIcon fontSize="large" />, color: '#1a237e', trend: 12.5 },
        { title: 'Total Bookings', value: Math.round(842 * multiplier).toLocaleString(), icon: <EventAvailableIcon fontSize="large" />, color: '#d4af37', trend: 8.2 },
        { title: 'Total Guests', value: Math.round(1892 * multiplier).toLocaleString(), icon: <PeopleIcon fontSize="large" />, color: '#7c3aed', trend: 15.4 },
        { title: 'Avg Occupancy', value: `\${Math.min(100, Math.round(82 * (multiplier === 0.14 ? 0.8 : 1)))}%`, icon: <HotelIcon fontSize="large" />, color: '#059669', trend: 4.1 },
      ]
    };
  }, [timeFilter]);

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#f9fafb', minHeight: '100vh' }}>
      {/* Header and Filter */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, mb: 4, gap: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight="800" sx={{ color: '#111827', letterSpacing: '-0.02em', mb: 0.5 }}>Reports & Analytics</Typography>
          <Typography variant="body2" color="text.secondary">Monitor hotel performance, revenue, and guest analytics.</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <FormControl sx={{ minWidth: 160 }} size="small">
            <Select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              sx={{ borderRadius: 2, bgcolor: 'white', '& .MuiOutlinedInput-notchedOutline': { borderColor: '#e5e7eb' }, fontWeight: 600, color: '#374151' }}
              displayEmpty
            >
              <MenuItem value="Today">Today</MenuItem>
              <MenuItem value="This Week">This Week</MenuItem>
              <MenuItem value="This Month">This Month</MenuItem>
              <MenuItem value="This Year">This Year</MenuItem>
            </Select>
          </FormControl>
          <Button 
            variant="outlined" 
            startIcon={<DownloadIcon />}
            sx={{ borderColor: '#e5e7eb', color: '#374151', '&:hover': { borderColor: '#d1d5db', bgcolor: 'white' }, borderRadius: 2, textTransform: 'none', px: 3, py: 0.8, fontWeight: 600, boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}
          >
            Export
          </Button>
        </Box>
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={3} mb={4}>
        {KPI_CARDS.map((kpi, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <StatCard {...kpi} />
          </Grid>
        ))}
      </Grid>

      {/* Charts Grid */}
      <Grid container spacing={3} wrap="wrap">
        
        {/* Daily Revenue - Bar Chart */}
        <Grid item xs={12} lg={6}>
          <Paper sx={{ p: 3, height: 380, borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" fontWeight="700" color="#111827" gutterBottom mb={3}>Daily Revenue</Typography>
            <Box sx={{ flexGrow: 1, width: '100%', minHeight: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyRevenueData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} tickFormatter={(value) => `$\${value/1000}k`} />
                  <Tooltip content={<CustomTooltip />} cursor={{fill: '#f9fafb'}} />
                  <Bar dataKey="revenue" fill="#1a237e" radius={[6, 6, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Monthly Revenue - Area Chart */}
        <Grid item xs={12} lg={6}>
          <Paper sx={{ p: 3, height: 380, borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" fontWeight="700" color="#111827" gutterBottom mb={3}>Revenue Trend</Typography>
            <Box sx={{ flexGrow: 1, width: '100%', minHeight: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyRevenueData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1a237e" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#1a237e" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} tickFormatter={(value) => `$\${value/1000}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="revenue" stroke="#1a237e" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Occupancy Rate - Line Chart */}
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 3, height: 400, borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" fontWeight="700" color="#111827" gutterBottom mb={3}>Occupancy Rate (%)</Typography>
            <Box sx={{ flexGrow: 1, width: '100%', minHeight: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={occupancyRateData} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} dy={10} />
                  <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="rate" stroke="#d4af37" strokeWidth={4} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 8, fill: '#d4af37', stroke: '#fff', strokeWidth: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Room Usage - Pie Chart */}
        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 3, height: 400, borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" fontWeight="700" color="#111827" gutterBottom mb={1}>Room Usage by Type</Typography>
            <Box sx={{ flexGrow: 1, width: '100%', minHeight: 0, position: 'relative' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={roomUsageData}
                    cx="50%"
                    cy="45%"
                    innerRadius={70}
                    outerRadius={110}
                    fill="#8884d8"
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                  >
                    {roomUsageData.map((entry, index) => (
                      <Cell key={`cell-\${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend 
                    verticalAlign="bottom" 
                    height={40} 
                    iconType="circle"
                    formatter={(value) => <span style={{ color: '#4b5563', fontWeight: 500, fontSize: '13px' }}>{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
              <Box sx={{ position: 'absolute', top: '45%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary" fontWeight="600">Total</Typography>
                <Typography variant="h6" fontWeight="800" color="#111827">{roomUsageData.reduce((a, b) => a + b.value, 0)}</Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Booking Trends - Stacked Area Chart */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, height: 400, borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" fontWeight="700" color="#111827" gutterBottom mb={3}>Booking Source Trends</Typography>
            <Box sx={{ flexGrow: 1, width: '100%', minHeight: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={bookingTrendsData} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend 
                    verticalAlign="top" 
                    align="right"
                    wrapperStyle={{ paddingBottom: '20px' }}
                    iconType="circle"
                    formatter={(value) => <span style={{ color: '#4b5563', fontWeight: 500, fontSize: '13px', textTransform: 'capitalize' }}>{value}</span>}
                  />
                  <Area type="monotone" dataKey="online" stackId="1" stroke="none" fill="#1a237e" fillOpacity={0.9} />
                  <Area type="monotone" dataKey="corporate" stackId="1" stroke="none" fill="#d4af37" fillOpacity={0.9} />
                  <Area type="monotone" dataKey="walkin" stackId="1" stroke="none" fill="#059669" fillOpacity={0.9} />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

      </Grid>
    </Box>
  );
};

export default Reports;
