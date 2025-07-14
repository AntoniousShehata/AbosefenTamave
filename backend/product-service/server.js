const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const morgan = require('morgan');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3003;

// Configuration
const config = {
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://admin:AbosefenMongo2024!@localhost:27017/abosefen-catalog?authSource=admin'
  },
  upload: {
    path: process.env.IMAGE_UPLOAD_PATH || '/app/uploads',
    maxSize: process.env.MAX_FILE_SIZE || '10MB'
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

// Category Schema
const categorySchema = new mongoose.Schema({
  name: {
    en: { type: String, required: true },
    ar: { type: String, required: true }
  },
  description: {
    en: String,
    ar: String
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  },
  level: {
    type: Number,
    default: 1,
    min: 1,
    max: 3
  },
  image: String,
  icon: String,
  sortOrder: {
    type: Number,
    default: 0
  },
  seo: {
    metaTitle: {
      en: String,
      ar: String
    },
    metaDescription: {
      en: String,
      ar: String
    },
    keywords: [String]
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Product Schema
const productSchema = new mongoose.Schema({
  name: {
    en: { type: String, required: true },
    ar: { type: String, required: true }
  },
  description: {
    en: String,
    ar: String
  },
  shortDescription: {
    en: String,
    ar: String
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  categoryPath: [String],
  
  // Product Identification
  sku: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  barcode: String,
  brand: String,
  model: String,
  series: String,
  
  // Pricing
  pricing: {
    cost: { type: Number, min: 0 },
    price: { type: Number, required: true, min: 0 },
    comparePrice: { type: Number, min: 0 },
    currency: { type: String, default: 'EGP' },
    taxable: { type: Boolean, default: true },
    taxRate: { type: Number, default: 0.14 }
  },
  
  // Physical Properties
  specifications: {
    dimensions: {
      length: Number,
      width: Number,
      height: Number,
      weight: Number
    },
    material: String,
    color: String,
    finish: String,
    installation: String,
    countryOfOrigin: String
  },
  
  // Features & Benefits
  features: {
    en: [String],
    ar: [String]
  },
  
  // Media
  images: [{
    url: { type: String, required: true },
    alt: {
      en: String,
      ar: String
    },
    isPrimary: { type: Boolean, default: false },
    sortOrder: { type: Number, default: 0 }
  }],
  videos: [{
    url: String,
    title: {
      en: String,
      ar: String
    },
    thumbnail: String
  }],
  
  // Inventory & Availability
  inventory: {
    trackQuantity: { type: Boolean, default: true },
    currentStock: { type: Number, default: 0, min: 0 },
    reservedStock: { type: Number, default: 0, min: 0 },
    availableStock: { type: Number, default: 0, min: 0 },
    minStock: { type: Number, default: 0, min: 0 },
    maxStock: { type: Number, default: 1000, min: 0 },
    locations: [{
      warehouse: String,
      stock: Number,
      location: String
    }]
  },
  
  // Logistics
  shipping: {
    weight: Number,
    requiresSpecialHandling: { type: Boolean, default: false },
    fragile: { type: Boolean, default: false },
    shippingClass: { 
      type: String, 
      enum: ['small', 'medium', 'large', 'extra-large'], 
      default: 'medium' 
    },
    freeShippingEligible: { type: Boolean, default: false }
  },
  
  // Related Products
  relatedProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  compatibleProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  accessories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  
  // Business Logic
  status: {
    type: String,
    enum: ['active', 'inactive', 'discontinued'],
    default: 'active'
  },
  isFeatured: { type: Boolean, default: false },
  isBestseller: { type: Boolean, default: false },
  isNew: { type: Boolean, default: false },
  isClearance: { type: Boolean, default: false },
  
  // SEO & Marketing
  seo: {
    slug: { type: String, unique: true },
    metaTitle: {
      en: String,
      ar: String
    },
    metaDescription: {
      en: String,
      ar: String
    },
    keywords: [String]
  },
  
  tags: [String],
  
  // Analytics
  stats: {
    views: { type: Number, default: 0 },
    sales: { type: Number, default: 0 },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
    wishlistCount: { type: Number, default: 0 }
  },
  
  publishedAt: Date,
  lastSoldAt: Date
}, {
  timestamps: true
});

// Review Schema
const reviewSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  title: {
    en: String,
    ar: String
  },
  comment: {
    en: String,
    ar: String
  },
  pros: {
    en: [String],
    ar: [String]
  },
  cons: {
    en: [String],
    ar: [String]
  },
  images: [String],
  helpful: { type: Number, default: 0 },
  verified: { type: Boolean, default: false },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  }
}, {
  timestamps: true
});

// Pre-save middleware to calculate available stock
productSchema.pre('save', function(next) {
  if (this.inventory.trackQuantity) {
    this.inventory.availableStock = this.inventory.currentStock - this.inventory.reservedStock;
  }
  next();
});

// Generate SEO slug
productSchema.pre('save', function(next) {
  if (!this.seo.slug && this.name.en) {
    this.seo.slug = this.name.en.toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  next();
});

const Category = mongoose.model('Category', categorySchema);
const Product = mongoose.model('Product', productSchema);
const Review = mongoose.model('Review', reviewSchema);

// Middleware
app.use(helmet());
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:3000',
    'http://localhost:8080'
  ],
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  standardHeaders: true,
  legacyHeaders: false
});

app.use(generalLimiter);

// File upload configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = config.upload.path;
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Routes

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'product-service',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Categories Routes

// Get all categories
app.get('/categories', async (req, res) => {
  try {
    const { level, parent, includeInactive = false } = req.query;
    
    const filter = {};
    if (level) filter.level = parseInt(level);
    if (parent) filter.parentId = parent === 'null' ? null : parent;
    if (!includeInactive) filter.isActive = true;

    const categories = await Category.find(filter)
      .populate('parentId', 'name slug')
      .sort({ sortOrder: 1, 'name.en': 1 });

    res.json({
      categories,
      count: categories.length
    });

  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      error: 'Failed to fetch categories'
    });
  }
});

// Get category by slug
app.get('/categories/:slug', async (req, res) => {
  try {
    const category = await Category.findOne({ 
      slug: req.params.slug, 
      isActive: true 
    }).populate('parentId', 'name slug');

    if (!category) {
      return res.status(404).json({
        error: 'Category not found'
      });
    }

    res.json({ category });

  } catch (error) {
    console.error('Get category error:', error);
    res.status(500).json({
      error: 'Failed to fetch category'
    });
  }
});

// Products Routes

// Get all products with filtering and pagination
app.get('/products', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      category,
      search,
      minPrice,
      maxPrice,
      brand,
      inStock = false,
      featured = false,
      bestseller = false,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const filter = { status: 'active' };
    
    // Category filter
    if (category) {
      const categoryDoc = await Category.findOne({ slug: category });
      if (categoryDoc) {
        filter.categoryId = categoryDoc._id;
      }
    }

    // Search filter
    if (search) {
      filter.$text = { $search: search };
    }

    // Price range filter
    if (minPrice || maxPrice) {
      filter['pricing.price'] = {};
      if (minPrice) filter['pricing.price'].$gte = parseFloat(minPrice);
      if (maxPrice) filter['pricing.price'].$lte = parseFloat(maxPrice);
    }

    // Brand filter
    if (brand) {
      filter.brand = { $regex: brand, $options: 'i' };
    }

    // Stock filter
    if (inStock === 'true') {
      filter['inventory.availableStock'] = { $gt: 0 };
    }

    // Featured filter
    if (featured === 'true') {
      filter.isFeatured = true;
    }

    // Bestseller filter
    if (bestseller === 'true') {
      filter.isBestseller = true;
    }

    // Sorting
    const sortOptions = {};
    if (sortBy === 'price') {
      sortOptions['pricing.price'] = sortOrder === 'asc' ? 1 : -1;
    } else if (sortBy === 'rating') {
      sortOptions['stats.rating'] = sortOrder === 'asc' ? 1 : -1;
    } else if (sortBy === 'name') {
      sortOptions['name.en'] = sortOrder === 'asc' ? 1 : -1;
    } else {
      sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;
    }

    // If text search, add score sorting
    if (search) {
      sortOptions.score = { $meta: 'textScore' };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const products = await Product.find(filter)
      .populate('categoryId', 'name slug')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .select('-__v');

    const total = await Product.countDocuments(filter);
    const totalPages = Math.ceil(total / parseInt(limit));

    res.json({
      products,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems: total,
        itemsPerPage: parseInt(limit),
        hasNextPage: parseInt(page) < totalPages,
        hasPrevPage: parseInt(page) > 1
      }
    });

  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      error: 'Failed to fetch products'
    });
  }
});

// Get product by ID or slug
app.get('/products/:identifier', async (req, res) => {
  try {
    const { identifier } = req.params;
    
    // Try to find by ID first, then by slug
    let product = await Product.findById(identifier)
      .populate('categoryId', 'name slug')
      .populate('relatedProducts', 'name pricing.price images.url seo.slug')
      .populate('compatibleProducts', 'name pricing.price images.url seo.slug')
      .populate('accessories', 'name pricing.price images.url seo.slug');

    if (!product) {
      product = await Product.findOne({ 'seo.slug': identifier, status: 'active' })
        .populate('categoryId', 'name slug')
        .populate('relatedProducts', 'name pricing.price images.url seo.slug')
        .populate('compatibleProducts', 'name pricing.price images.url seo.slug')
        .populate('accessories', 'name pricing.price images.url seo.slug');
    }

    if (!product) {
      return res.status(404).json({
        error: 'Product not found'
      });
    }

    // Increment view count
    await Product.findByIdAndUpdate(product._id, {
      $inc: { 'stats.views': 1 }
    });

    res.json({ product });

  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      error: 'Failed to fetch product'
    });
  }
});

// Create new product (Admin only)
app.post('/products', upload.array('images', 10), [
  body('name.en').trim().isLength({ min: 1 }),
  body('name.ar').trim().isLength({ min: 1 }),
  body('categoryId').isMongoId(),
  body('sku').trim().isLength({ min: 1 }),
  body('pricing.price').isFloat({ min: 0 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const productData = JSON.parse(req.body.productData);
    
    // Process uploaded images
    const images = [];
    if (req.files && req.files.length > 0) {
      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];
        
        // Resize and optimize image
        const optimizedPath = path.join(config.upload.path, `optimized-${file.filename}`);
        await sharp(file.path)
          .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
          .jpeg({ quality: 85 })
          .toFile(optimizedPath);

        images.push({
          url: `/uploads/optimized-${file.filename}`,
          alt: productData.images?.[i]?.alt || { en: productData.name.en, ar: productData.name.ar },
          isPrimary: i === 0,
          sortOrder: i
        });

        // Remove original file
        fs.unlinkSync(file.path);
      }
    }

    productData.images = images;
    productData.publishedAt = new Date();

    const product = new Product(productData);
    await product.save();

    res.status(201).json({
      message: 'Product created successfully',
      product
    });

  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({
      error: 'Failed to create product',
      message: error.message
    });
  }
});

// Update product inventory
app.patch('/products/:id/inventory', [
  body('currentStock').isInt({ min: 0 }),
  body('warehouse').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { currentStock, warehouse = 'main' } = req.body;
    
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        error: 'Product not found'
      });
    }

    // Update inventory
    product.inventory.currentStock = currentStock;
    product.inventory.availableStock = currentStock - product.inventory.reservedStock;

    // Update location stock
    const locationIndex = product.inventory.locations.findIndex(loc => loc.warehouse === warehouse);
    if (locationIndex >= 0) {
      product.inventory.locations[locationIndex].stock = currentStock;
    } else {
      product.inventory.locations.push({
        warehouse,
        stock: currentStock,
        location: 'N/A'
      });
    }

    await product.save();

    res.json({
      message: 'Inventory updated successfully',
      inventory: product.inventory
    });

  } catch (error) {
    console.error('Update inventory error:', error);
    res.status(500).json({
      error: 'Failed to update inventory'
    });
  }
});

// Get product reviews
app.get('/products/:id/reviews', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const reviews = await Review.find({
      productId: req.params.id,
      status: 'approved'
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

    const total = await Review.countDocuments({
      productId: req.params.id,
      status: 'approved'
    });

    const totalPages = Math.ceil(total / parseInt(limit));

    res.json({
      reviews,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({
      error: 'Failed to fetch reviews'
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
      console.log(`🚀 Product Service running on port ${PORT}`);
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