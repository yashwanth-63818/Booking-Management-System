export const dashboardStats = {
  totalRooms: 120,
  availableRooms: 45,
  occupiedRooms: 60,
  reservedRooms: 15,
  todaysRevenue: 12500,
  currentGuests: 110,
};

export const occupancyData = [
  { name: 'Mon', occupied: 45, available: 75 },
  { name: 'Tue', occupied: 50, available: 70 },
  { name: 'Wed', occupied: 65, available: 55 },
  { name: 'Thu', occupied: 70, available: 50 },
  { name: 'Fri', occupied: 90, available: 30 },
  { name: 'Sat', occupied: 105, available: 15 },
  { name: 'Sun', occupied: 85, available: 35 },
];

export const recentBookings = [
  { id: 'BKG-001', guestName: 'Alice Johnson', roomType: 'Deluxe', checkIn: '2026-07-01', status: 'Checked In', amount: 350 },
  { id: 'BKG-002', guestName: 'Bob Smith', roomType: 'Standard', checkIn: '2026-07-02', status: 'Confirmed', amount: 150 },
  { id: 'BKG-003', guestName: 'Charlie Davis', roomType: 'Suite', checkIn: '2026-07-01', status: 'Checked In', amount: 500 },
  { id: 'BKG-004', guestName: 'Diana Evans', roomType: 'Standard', checkIn: '2026-07-03', status: 'Pending', amount: 150 },
  { id: 'BKG-005', guestName: 'Evan Wright', roomType: 'Deluxe', checkIn: '2026-07-01', status: 'Checked Out', amount: 350 },
];

export const roomsData = [
  { id: '101', roomNumber: '101', type: 'Deluxe', price: 250, capacity: 2, ac: true, status: 'Available', cleaningStatus: 'Clean', image: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=500&q=80', description: 'A beautiful deluxe room with a city view.' },
  { id: '102', roomNumber: '102', type: 'Suite', price: 500, capacity: 4, ac: true, status: 'Occupied', cleaningStatus: 'Clean', image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=500&q=80', description: 'Spacious suite with luxury amenities.' },
  { id: '103', roomNumber: '103', type: 'Standard', price: 100, capacity: 2, ac: false, status: 'Cleaning', cleaningStatus: 'In Progress', image: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=500&q=80', description: 'Standard room for budget travelers.' },
  { id: '104', roomNumber: '104', type: 'Deluxe', price: 250, capacity: 2, ac: true, status: 'Reserved', cleaningStatus: 'Clean', image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=500&q=80', description: 'Cozy deluxe room near the pool.' },
  { id: '105', roomNumber: '105', type: 'Suite', price: 600, capacity: 5, ac: true, status: 'Available', cleaningStatus: 'Dirty', image: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=500&q=80', description: 'Premium suite with panoramic views.' },
  { id: '106', roomNumber: '106', type: 'Standard', price: 120, capacity: 2, ac: true, status: 'Available', cleaningStatus: 'Clean', image: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=500&q=80', description: 'AC standard room.' },
];

export const bookingsData = [
  {
    id: 'BKG-0001',
    customerName: 'Alice Johnson',
    phone: '9876543210',
    email: 'alice@example.com',
    address: '123 Main St, Cityville',
    idProofType: 'Aadhar',
    idNumber: '1234-5678-9012',
    guests: 2,
    checkIn: '2026-07-01',
    checkOut: '2026-07-05',
    room: '101',
    paymentMethod: 'Credit Card',
    advance: 200,
    specialRequests: 'Extra pillows',
    days: 4,
    roomCharges: 1000, // 4 * 250
    gst: 180,
    grandTotal: 1180,
    balance: 980,
    status: 'Checked In'
  },
  {
    id: 'BKG-0002',
    customerName: 'Bob Smith',
    phone: '8765432109',
    email: 'bob@example.com',
    address: '456 Oak Rd, Townsville',
    idProofType: 'Passport',
    idNumber: 'A1234567',
    guests: 1,
    checkIn: '2026-07-02',
    checkOut: '2026-07-03',
    room: '103',
    paymentMethod: 'Cash',
    advance: 118,
    specialRequests: 'None',
    days: 1,
    roomCharges: 100, // 1 * 100
    gst: 18,
    grandTotal: 118,
    balance: 0,
    status: 'Confirmed'
  }
];

export const guestsData = [
  {
    id: 'GST-001',
    photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80',
    name: 'Alice Johnson',
    phone: '9876543210',
    email: 'alice@example.com',
    roomNumber: '101',
    checkIn: '2026-07-01',
    checkOut: '2026-07-05',
    paymentStatus: 'Paid',
    status: 'In-House'
  },
  {
    id: 'GST-002',
    photo: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=150&q=80',
    name: 'Bob Smith',
    phone: '8765432109',
    email: 'bob@example.com',
    roomNumber: '103',
    checkIn: '2026-07-02',
    checkOut: '2026-07-03',
    paymentStatus: 'Pending',
    status: 'In-House'
  },
  {
    id: 'GST-003',
    photo: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&q=80',
    name: 'Clara Davis',
    phone: '7654321098',
    email: 'clara@example.com',
    roomNumber: '105',
    checkIn: '2026-06-28',
    checkOut: '2026-07-01',
    paymentStatus: 'Paid',
    status: 'Checked-out'
  },
  {
    id: 'GST-004',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80',
    name: 'David Lee',
    phone: '6543210987',
    email: 'david@example.com',
    roomNumber: '102',
    checkIn: '2026-07-01',
    checkOut: '2026-07-07',
    paymentStatus: 'Partial',
    status: 'In-House'
  }
];
