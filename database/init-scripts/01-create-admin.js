// Admin user creation and authentication database setup
use('abosefen-auth');

// Create default admin user
db.users.insertOne({
  email: "admin@abosefen.com",
  password: "$2a$12$LQv3c1yqBWVHxkd0LQ4bPOUwkjgdHWp5mN2d8f6v9s4x2z8h6k1mO", // Admin123456!
  profile: {
    firstName: "Admin",
    lastName: "Abosefen",
    phone: "+201000000000",
    avatar: null
  },
  address: {
    street: "١ شارع الجمهورية",
    city: "القاهرة", 
    governorate: "القاهرة",
    postalCode: "11511",
    coordinates: {
      lat: 30.0444,
      lng: 31.2357
    }
  },
  role: "admin",
  preferences: {
    language: "ar",
    currency: "EGP",
    notifications: {
      email: true,
      sms: true,
      orderUpdates: true,
      promotions: true
    }
  },
  isActive: true,
  emailVerified: true,
  phoneVerified: true,
  lastLogin: null,
  createdAt: new Date(),
  updatedAt: new Date()
});

// Create customer test user
db.users.insertOne({
  email: "customer@example.com",
  password: "$2a$12$LQv3c1yqBWVHxkd0LQ4bPOUwkjgdHWp5mN2d8f6v9s4x2z8h6k1mO", // Customer123!
  profile: {
    firstName: "أحمد",
    lastName: "محمد",
    phone: "+201234567890",
    avatar: null
  },
  address: {
    street: "١٥ شارع النصر",
    city: "الجيزة",
    governorate: "الجيزة", 
    postalCode: "12345",
    coordinates: {
      lat: 30.0131,
      lng: 31.2089
    }
  },
  role: "customer",
  preferences: {
    language: "ar",
    currency: "EGP",
    notifications: {
      email: true,
      sms: false,
      orderUpdates: true,
      promotions: false
    }
  },
  isActive: true,
  emailVerified: true,
  phoneVerified: false,
  lastLogin: null,
  createdAt: new Date(),
  updatedAt: new Date()
});

// Create indexes for users collection
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ "profile.phone": 1 });
db.users.createIndex({ role: 1 });
db.users.createIndex({ isActive: 1 });
db.users.createIndex({ createdAt: -1 });

// Create indexes for sessions collection
db.sessions.createIndex({ userId: 1 });
db.sessions.createIndex({ accessToken: 1 });
db.sessions.createIndex({ refreshToken: 1 });
db.sessions.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
db.sessions.createIndex({ "device.ip": 1 });

print("✅ Auth database initialized with admin user and indexes"); 