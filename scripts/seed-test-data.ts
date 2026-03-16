// Mock SDP data for hackathon demo
export const MOCK_STUDENTS = [
  {
    id: 'student_001',
    name: 'Amina Okonkwo',
    email: 'amina@example.edu',
    phone: '+254712345678',
    stellarAddress: 'GCKFBEIYTKP5RDBQMUTAP6J6Z2XJYQ5XQZJ6XJYQ5XQZJ6XJYQ5XQZJ6X',
    stipend: {
      total: 1000 * 1e7, // 1000 USDC in stroops
      weekly: 100 * 1e7,
      startTimestamp: Math.floor(Date.now() / 1000) - 7 * 24 * 60 * 60, // Started 1 week ago
      vestingId: '01'.repeat(32), // Mock BytesN<32>
    }
  },
  {
    id: 'student_002',
    name: 'Carlos Mendez',
    email: 'carlos@example.edu',
    phone: '+5215512345678',
    stellarAddress: 'GDLKJHGFDSAQWERTYUIOPASDFGHJKLZXCVBNMQWERTYUIOPASDFGHJKLZXCV',
    stipend: {
      total: 750 * 1e7,
      weekly: 75 * 1e7,
      startTimestamp: Math.floor(Date.now() / 1000), // Starts now
      vestingId: '02'.repeat(32),
    }
  }
];

export const MOCK_MERCHANTS = [
  {
    id: 'merchant_001',
    name: 'Campus Bookstore',
    category: 'Education',
    stellarAddress: 'GBOOKSTORE123456789ABCDEFGHIJKLMNOPQRSTUVWXY',
    approved: true,
    location: 'Nairobi, Kenya'
  },
  {
    id: 'merchant_002',
    name: 'Student Cafeteria',
    category: 'Food',
    stellarAddress: 'GCAFETERIA123456789ABCDEFGHIJKLMNOPQRSTUVWXY',
    approved: true,
    location: 'Mexico City, Mexico'
  }
];