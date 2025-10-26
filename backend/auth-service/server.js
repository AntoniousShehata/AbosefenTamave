const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const morgan = require('morgan');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Configuration
const config = {
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://admin:AbosefenMongo2024!@localhost:27017/abosefen-auth?authSource=admin'
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your-very-secure-jwt-secret-key-2024-abosefen',
    expire: process.env.JWT_EXPIRE || '7d',
    refreshExpire: process.env.JWT_REFRESH_EXPIRE || '30d'
  },
  bcrypt: {
    rounds: parseInt(process.env.BCRYPT_ROUNDS) || 12
  }
};

// MongoDB Connection
async function connectDB() {
  try {
    await mongoose.connect(config.mongodb.uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB database');
  } catch (err) {
    console.error('❌ Database connection error:', err);
    process.exit(1);
  }
}

// User Schema
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  profile: {
    firstName: {
      type: String,
      required: true,
      trim: true
    },
    lastName: {
      type: String,
      required: true,
      trim: true
    },
    phone: {
      type: String,
      trim: true
    },
    avatar: String
  },
  address: {
    street: String,
    city: String,
    governorate: String,
    postalCode: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  role: {
    type: String,
    enum: ['customer', 'admin', 'manager'],
    default: 'customer'
  },
  preferences: {
    language: {
      type: String,
      enum: ['ar', 'en'],
      default: 'ar'
    },
    currency: {
      type: String,
      default: 'EGP'
    },
    notifications: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
      orderUpdates: { type: Boolean, default: true },
      promotions: { type: Boolean, default: false }
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  phoneVerified: {
    type: Boolean,
    default: false
  },
  lastLogin: Date
}, {
  timestamps: true
});

// Session Schema for JWT refresh tokens
const sessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  accessToken: {
    type: String,
    required: true
  },
  refreshToken: {
    type: String,
    required: true,
    unique: true
  },
  device: {
    ip: String,
    userAgent: String,
    os: String,
    browser: String
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expireAfterSeconds: 0 }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Cart Schema for user-specific shopping carts
const cartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  items: [{
    _id: {
      type: String,
      required: true
    },
    name: mongoose.Schema.Types.Mixed,
    slug: String,
    price: {
      type: Number,
      required: true,
      min: 0
    },
    originalPrice: Number,
    isOnSale: {
      type: Boolean,
      default: false
    },
    image: String,
    inventory: mongoose.Schema.Types.Mixed,
    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1
    }
  }],
  totalItems: {
    type: Number,
    default: 0
  },
  totalAmount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Update totals before saving cart
cartSchema.pre('save', function(next) {
  this.totalItems = this.items.reduce((total, item) => total + item.quantity, 0);
  this.totalAmount = this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  next();
});

const User = mongoose.model('User', userSchema);
const Session = mongoose.model('Session', sessionSchema);
const Cart = mongoose.model('Cart', cartSchema);

// Middleware
app.use(helmet());
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:3000',
      'http://localhost:8080'
    ];
    
    // Allow all Vercel deployments
    if (origin.includes('vercel.app') || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // 50 requests per window (increased from 5)
  message: {
    error: 'Too many authentication attempts. Please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false
});

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // 500 requests per window (increased from 100)
  standardHeaders: true,
  legacyHeaders: false
});

app.use('/auth/login', authLimiter);
app.use('/auth/register', authLimiter);
app.use(generalLimiter);

// Authentication middleware
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ 
      error: 'Access token required',
      code: 'TOKEN_REQUIRED'
    });
  }

  try {
    const decoded = jwt.verify(token, config.jwt.secret);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user || !user.isActive) {
      return res.status(401).json({ 
        error: 'Invalid or inactive user',
        code: 'INVALID_USER'
      });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Token expired',
        code: 'TOKEN_EXPIRED'
      });
    }
    return res.status(403).json({ 
      error: 'Invalid token',
      code: 'INVALID_TOKEN'
    });
  }
};

// Token generation
function generateTokens(user) {
  const payload = {
    userId: user._id,
    email: user.email,
    role: user.role
  };

  const accessToken = jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expire
  });

  const refreshToken = jwt.sign(
    { userId: user._id, type: 'refresh' },
    config.jwt.secret,
    { expiresIn: config.jwt.refreshExpire }
  );

  return { accessToken, refreshToken };
}

// Routes

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'auth-service',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// User registration
app.post('/auth/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('firstName').trim().isLength({ min: 1 }),
  body('lastName').trim().isLength({ min: 1 }),
  body('phone').optional().isLength({ min: 10, max: 15 })
], async (req, res) => {
  try {
    console.log('🔵 Registration attempt started');
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Validation failed:', errors.array());
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    console.log('✅ Validation passed');
    const { email, password, firstName, lastName, phone, address, role } = req.body;

    // Check if user already exists
    console.log('🔍 Checking if user exists:', email);
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('❌ User already exists');
      return res.status(409).json({
        error: 'User already exists',
        code: 'USER_EXISTS'
      });
    }

    console.log('✅ User does not exist, proceeding with creation');
    
    // Hash password
    console.log('🔐 Hashing password');
    const hashedPassword = await bcrypt.hash(password, config.bcrypt.rounds);

    console.log('👤 Creating user object');
    // Create user
    const user = new User({
      email,
      password: hashedPassword,
      profile: {
        firstName,
        lastName,
        phone
      },
      address: typeof address === 'string' ? { street: address } : address || {},
      role: role || 'customer' // Allow setting role, default to customer
    });

    console.log('💾 Saving user to database');
    await user.save();

    console.log('🎫 Generating tokens');
    // Generate tokens
    const tokens = generateTokens(user);

    console.log('📝 Creating session');
    // Create session
    const session = new Session({
      userId: user._id,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      device: {
        ip: req.ip || 'unknown',
        userAgent: req.get('User-Agent') || 'unknown'
      },
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    });

    console.log('💾 Saving session to database');
    await session.save();

    console.log('✅ Registration successful, sending response');
    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: userResponse,
      token: tokens.accessToken,
      refreshToken: tokens.refreshToken
    });

  } catch (error) {
    console.error('❌ Registration error:', error);
    console.error('❌ Error stack:', error.stack);
    res.status(500).json({
      error: 'Registration failed',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// User login
app.post('/auth/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').exists()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email, isActive: true });
    if (!user) {
      return res.status(401).json({
        error: 'Invalid credentials',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Invalid credentials',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate tokens
    const tokens = generateTokens(user);

    // Create session
    const session = new Session({
      userId: user._id,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      device: {
        ip: req.ip || 'unknown',
        userAgent: req.get('User-Agent') || 'unknown'
      },
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    });

    await session.save();

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({
      message: 'Login successful',
      user: userResponse,
      token: tokens.accessToken,
      refreshToken: tokens.refreshToken
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Login failed',
      message: error.message
    });
  }
});

// Token refresh
app.post('/auth/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        error: 'Refresh token required',
        code: 'REFRESH_TOKEN_REQUIRED'
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, config.jwt.secret);
    
    if (decoded.type !== 'refresh') {
      return res.status(401).json({
        error: 'Invalid refresh token',
        code: 'INVALID_REFRESH_TOKEN'
      });
    }

    // Find session
    const session = await Session.findOne({
      refreshToken,
      isActive: true,
      expiresAt: { $gt: new Date() }
    }).populate('userId');

    if (!session || !session.userId.isActive) {
      return res.status(401).json({
        error: 'Invalid or expired refresh token',
        code: 'INVALID_REFRESH_TOKEN'
      });
    }

    // Generate new tokens
    const tokens = generateTokens(session.userId);

    // Update session
    session.accessToken = tokens.accessToken;
    session.refreshToken = tokens.refreshToken;
    await session.save();

    res.json({
      message: 'Tokens refreshed successfully',
      tokens
    });

  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(401).json({
      error: 'Token refresh failed',
      code: 'REFRESH_FAILED'
    });
  }
});

// Get current user profile
app.get('/auth/profile', authenticateToken, async (req, res) => {
  try {
    res.json({
      user: req.user
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({
      error: 'Failed to fetch profile'
    });
  }
});

// Update user profile
app.put('/auth/profile', authenticateToken, [
  body('firstName').optional().trim().isLength({ min: 1 }),
  body('lastName').optional().trim().isLength({ min: 1 }),
  body('phone').optional().isMobilePhone('ar-EG')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const updateFields = {};
    const { firstName, lastName, phone, address, preferences } = req.body;

    if (firstName) updateFields['profile.firstName'] = firstName;
    if (lastName) updateFields['profile.lastName'] = lastName;
    if (phone) updateFields['profile.phone'] = phone;
    if (address) updateFields.address = address;
    if (preferences) updateFields.preferences = { ...req.user.preferences, ...preferences };

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updateFields },
      { new: true, select: '-password' }
    );

    res.json({
      message: 'Profile updated successfully',
      user: updatedUser
    });

  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      error: 'Failed to update profile'
    });
  }
});

// Logout
app.post('/auth/logout', authenticateToken, async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      await Session.findOneAndUpdate(
        { refreshToken, userId: req.user._id },
        { isActive: false }
      );
    }

    res.json({
      message: 'Logout successful'
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      error: 'Logout failed'
    });
  }
});

// Logout from all devices
app.post('/auth/logout-all', authenticateToken, async (req, res) => {
  try {
    await Session.updateMany(
      { userId: req.user._id },
      { isActive: false }
    );

    res.json({
      message: 'Logged out from all devices'
    });

  } catch (error) {
    console.error('Logout all error:', error);
    res.status(500).json({
      error: 'Logout failed'
    });
  }
});

// Verify token (for other microservices)
app.post('/auth/verify', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        error: 'Token required',
        code: 'TOKEN_REQUIRED'
      });
    }

    const decoded = jwt.verify(token, config.jwt.secret);
    const user = await User.findById(decoded.userId).select('-password');

    if (!user || !user.isActive) {
      return res.status(401).json({
        error: 'Invalid user',
        code: 'INVALID_USER'
      });
    }

    res.json({
      valid: true,
      user
    });

  } catch (error) {
    res.status(401).json({
      valid: false,
      error: 'Invalid token',
      code: 'INVALID_TOKEN'
    });
  }
});

// Temporary admin endpoint to list users (for password recovery)
app.get('/admin/users', async (req, res) => {
  try {
    const users = await User.find({}, {
      email: 1,
      'profile.firstName': 1,
      'profile.lastName': 1,
      role: 1,
      isActive: 1,
      createdAt: 1,
      _id: 0
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      users: users,
      total: users.length
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      error: 'Failed to fetch users'
    });
  }
});

// ===== CART MANAGEMENT ENDPOINTS =====

// Get user's cart
app.get('/cart', authenticateToken, async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user._id });
    
    res.json({
      success: true,
      cart: cart ? cart.items : [],
      totalItems: cart ? cart.totalItems : 0,
      totalAmount: cart ? cart.totalAmount : 0
    });
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({
      error: 'Failed to fetch cart',
      code: 'CART_FETCH_ERROR'
    });
  }
});

// Save/Update user's cart
app.post('/cart', authenticateToken, async (req, res) => {
  try {
    const { cart: cartItems } = req.body;

    if (!Array.isArray(cartItems)) {
      return res.status(400).json({
        error: 'Cart items must be an array',
        code: 'INVALID_CART_DATA'
      });
    }

    // Validate cart items
    for (const item of cartItems) {
      if (!item._id || !item.price || !item.quantity || item.quantity <= 0) {
        return res.status(400).json({
          error: 'Invalid cart item format',
          code: 'INVALID_CART_ITEM',
          details: 'Each item must have _id, price, and positive quantity'
        });
      }
    }

    // Update or create cart
    const cart = await Cart.findOneAndUpdate(
      { userId: req.user._id },
      { 
        userId: req.user._id,
        items: cartItems
      },
      { 
        new: true, 
        upsert: true,
        runValidators: true
      }
    );

    res.json({
      success: true,
      message: 'Cart saved successfully',
      cart: cart.items,
      totalItems: cart.totalItems,
      totalAmount: cart.totalAmount
    });
  } catch (error) {
    console.error('Error saving cart:', error);
    res.status(500).json({
      error: 'Failed to save cart',
      code: 'CART_SAVE_ERROR',
      details: error.message
    });
  }
});

// Clear user's cart
app.delete('/cart', authenticateToken, async (req, res) => {
  try {
    await Cart.findOneAndUpdate(
      { userId: req.user._id },
      { 
        items: [],
        totalItems: 0,
        totalAmount: 0
      },
      { upsert: true }
    );

    res.json({
      success: true,
      message: 'Cart cleared successfully'
    });
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({
      error: 'Failed to clear cart',
      code: 'CART_CLEAR_ERROR'
    });
  }
});

// Add single item to cart
app.post('/cart/add', authenticateToken, async (req, res) => {
  try {
    const { item } = req.body;

    if (!item || !item._id || !item.price || !item.quantity || item.quantity <= 0) {
      return res.status(400).json({
        error: 'Invalid item format',
        code: 'INVALID_ITEM_DATA'
      });
    }

    const cart = await Cart.findOne({ userId: req.user._id });
    let cartItems = cart ? cart.items : [];

    // Check if item already exists
    const existingItemIndex = cartItems.findIndex(cartItem => cartItem._id === item._id);
    
    if (existingItemIndex > -1) {
      // Update quantity
      cartItems[existingItemIndex].quantity += item.quantity;
    } else {
      // Add new item
      cartItems.push(item);
    }

    // Update cart
    const updatedCart = await Cart.findOneAndUpdate(
      { userId: req.user._id },
      { 
        userId: req.user._id,
        items: cartItems
      },
      { 
        new: true, 
        upsert: true,
        runValidators: true
      }
    );

    res.json({
      success: true,
      message: 'Item added to cart',
      cart: updatedCart.items,
      totalItems: updatedCart.totalItems,
      totalAmount: updatedCart.totalAmount
    });
  } catch (error) {
    console.error('Error adding item to cart:', error);
    res.status(500).json({
      error: 'Failed to add item to cart',
      code: 'CART_ADD_ERROR'
    });
  }
});

// Remove single item from cart
app.delete('/cart/item/:itemId', authenticateToken, async (req, res) => {
  try {
    const { itemId } = req.params;

    const cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      return res.status(404).json({
        error: 'Cart not found',
        code: 'CART_NOT_FOUND'
      });
    }

    // Filter out the item
    const filteredItems = cart.items.filter(item => item._id !== itemId);

    // Update cart
    const updatedCart = await Cart.findOneAndUpdate(
      { userId: req.user._id },
      { items: filteredItems },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Item removed from cart',
      cart: updatedCart.items,
      totalItems: updatedCart.totalItems,
      totalAmount: updatedCart.totalAmount
    });
  } catch (error) {
    console.error('Error removing item from cart:', error);
    res.status(500).json({
      error: 'Failed to remove item from cart',
      code: 'CART_REMOVE_ERROR'
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl
  });
});

// Start server
async function startServer() {
  try {
    await connectDB();
    
    app.listen(PORT, () => {
      console.log(`🚀 Auth Service running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await mongoose.connection.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  await mongoose.connection.close();
  process.exit(0);
});

startServer(); 