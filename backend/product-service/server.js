const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
const SmartSearchService = require('./services/smartSearchService');
const RecommendationService = require('./services/recommendationService');

const app = express();
const PORT = process.env.PORT || 3003;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://admin:AbosefenMongo2024!@mongodb:27017';
const DB_NAME = 'abosefen-catalog';

let db;
let smartSearchService;
let recommendationService;

// Sample categories and products for fallback
const sampleCategories = [
  {
    _id: "bathroom-fittings",
    name: { en: "Bathroom Fittings", ar: "تجهيزات الحمام" },
    description: { en: "Complete range of bathroom fixtures and fittings", ar: "مجموعة كاملة من تجهيزات الحمام" },
    image: "/images/categories/BATHROOM_FITTINGS.jpg",
    isActive: true,
    sortOrder: 1
  },
  {
    _id: "kitchen-fittings", 
    name: { en: "Kitchen Fittings", ar: "تجهيزات المطبخ" },
    description: { en: "Kitchen sinks, faucets and accessories", ar: "أحواض وصنابير ومعدات المطبخ" },
    image: "/images/categories/KITCHEN_FITTINGS.jpg",
    isActive: true,
    sortOrder: 2
  },
  {
    _id: "bathtubs",
    name: { en: "Bathtubs", ar: "أحواض الاستحمام" },
    description: { en: "Luxury bathtubs and spa solutions", ar: "أحواض استحمام فاخرة وحلول سبا" },
    image: "/images/categories/BATHTUBS.jpg", 
    isActive: true,
    sortOrder: 3
  },
  {
    _id: "accessories",
    name: { en: "Bathroom Accessories", ar: "إكسسوارات الحمام" },
    description: { en: "Towel rails, mirrors and bathroom accessories", ar: "علاقات المناشف والمرايا وإكسسوارات الحمام" },
    image: "/images/categories/ACCESSORIES.jpg",
    isActive: true,
    sortOrder: 4
  },
  {
    _id: "ceramics",
    name: { en: "Ceramics & Tiles", ar: "السيراميك والبلاط" },
    description: { en: "Premium tiles and ceramic collections", ar: "مجموعات السيراميك والبلاط المميزة" },
    image: "/images/categories/CERAMIC.jpg",
    isActive: true,
    sortOrder: 5
  },
  {
    _id: "furniture",
    name: { en: "Bathroom Furniture", ar: "أثاث الحمام" },
    description: { en: "Vanity units and bathroom storage solutions", ar: "وحدات الحمام وحلول التخزين" },
    image: "/images/categories/FURNITURE.jpg",
    isActive: true,
    sortOrder: 6
  },
  {
    _id: "prewall-systems",
    name: { en: "Prewall Systems", ar: "أنظمة الجدران المسبقة" },
    description: { en: "Installation systems and prewall solutions", ar: "أنظمة التركيب والجدران المسبقة" },
    image: "/images/categories/PREWALL.jpg",
    isActive: true,
    sortOrder: 7
  }
];

const sampleProducts = [
  // Bathroom Fittings
  {
    _id: "bf-001",
    name: { en: "Premium Wall-Mounted Basin", ar: "حوض حائط فاخر" },
    slug: "premium-wall-mounted-basin",
    categoryId: "bathroom-fittings",
    sku: "BF-WMB-001",
    description: { 
      en: "Elegant wall-mounted ceramic basin with modern design",
      ar: "حوض سيراميك معلق بتصميم عصري أنيق" 
    },
    images: [
      {
        url: "/images/products/ceramic_sink.jpg",
        alt: { en: "Premium wall-mounted basin", ar: "حوض حائط فاخر" },
        isPrimary: true,
        sortOrder: 1
      }
    ],
    pricing: {
      originalPrice: 2500,
      salePrice: 2125,
      isOnSale: true,
      discountPercentage: 15,
      currency: "EGP"
    },
    inventory: {
      inStock: true,
      quantity: 25,
      lowStockThreshold: 5
    },
    rating: { average: 4.8, count: 32 },
    isActive: true,
    isFeatured: true
  },
  {
    _id: "bf-002", 
    name: { en: "Modern Single-Handle Faucet", ar: "صنبور عصري بيد واحدة" },
    slug: "modern-single-handle-faucet",
    categoryId: "bathroom-fittings",
    sku: "BF-MSH-002", 
    description: {
      en: "Premium single-handle bathroom faucet with ceramic cartridge",
      ar: "صنبور حمام فاخر بيد واحدة مع خرطوشة سيراميك"
    },
    images: [
      {
        url: "/images/products/mixer.jpg",
        alt: { en: "Modern single-handle faucet", ar: "صنبور عصري بيد واحدة" },
        isPrimary: true,
        sortOrder: 1
      }
    ],
    pricing: {
      originalPrice: 1200,
      salePrice: 996,
      isOnSale: true, 
      discountPercentage: 17,
      currency: "EGP"
    },
    inventory: {
      inStock: true,
      quantity: 18,
      lowStockThreshold: 5
    },
    rating: { average: 4.7, count: 28 },
    isActive: true,
    isFeatured: true
  },
  {
    _id: "bf-003",
    name: { en: "Premium Bathroom Sink Mixer", ar: "خلاط حوض حمام فاخر" },
    slug: "premium-bathroom-sink-mixer", 
    categoryId: "bathroom-fittings",
    sku: "BF-PSM-003",
    description: {
      en: "High-quality chrome-plated sink mixer with modern styling", 
      ar: "خلاط حوض عالي الجودة مطلي بالكروم بتصميم عصري"
    },
    images: [
      {
        url: "/images/products/kitchen_mixer.jpg",
        alt: { en: "Premium bathroom sink mixer", ar: "خلاط حوض حمام فاخر" },
        isPrimary: true,
        sortOrder: 1
      }
    ],
    pricing: {
      originalPrice: 1800,
      salePrice: 1800,
      isOnSale: false,
      currency: "EGP"
    },
    inventory: {
      inStock: true,
      quantity: 22,
      lowStockThreshold: 5
    },
    rating: { average: 4.6, count: 19 },
    isActive: true,
    isFeatured: false
  },

  // Kitchen Fittings
  {
    _id: "kf-001",
    name: { en: "Professional Kitchen Sink Mixer", ar: "خلاط مطبخ احترافي" },
    slug: "professional-kitchen-sink-mixer",
    categoryId: "kitchen-fittings", 
    sku: "KF-PKM-001",
    description: {
      en: "Professional-grade kitchen faucet with pull-out spray",
      ar: "صنبور مطبخ احترافي مع رشاش قابل للسحب"
    },
    images: [
      {
        url: "/images/products/kitchen_mixer.jpg", 
        alt: { en: "Professional kitchen mixer", ar: "خلاط مطبخ احترافي" },
        isPrimary: true,
        sortOrder: 1
      }
    ],
    pricing: {
      originalPrice: 2200,
      salePrice: 1870,
      isOnSale: true,
      discountPercentage: 15,
      currency: "EGP"
    },
    inventory: {
      inStock: true,
      quantity: 15,
      lowStockThreshold: 5
    },
    rating: { average: 4.9, count: 41 },
    isActive: true,
    isFeatured: true
  },
  {
    _id: "kf-002",
    name: { en: "Kitchen Sink Double Bowl", ar: "حوض مطبخ مزدوج" },
    slug: "kitchen-sink-double-bowl",
    categoryId: "kitchen-fittings",
    sku: "KF-KSD-002",
    description: {
      en: "Stainless steel double bowl kitchen sink with drainer",
      ar: "حوض مطبخ مزدوج من الستانلس ستيل مع مصفاة"
    },
    images: [
      {
        url: "/images/products/sink.jpg",
        alt: { en: "Kitchen sink double bowl", ar: "حوض مطبخ مزدوج" },
        isPrimary: true,
        sortOrder: 1
      }
    ],
    pricing: {
      originalPrice: 3500,
      salePrice: 3150,
      isOnSale: true,
      discountPercentage: 10,
      currency: "EGP"
    },
    inventory: {
      inStock: true,
      quantity: 12,
      lowStockThreshold: 3
    },
    rating: { average: 4.5, count: 23 },
    isActive: true,
    isFeatured: true
  },
  {
    _id: "kf-003",
    name: { en: "Pull-Out Kitchen Faucet", ar: "صنبور مطبخ قابل للسحب" },
    slug: "pull-out-kitchen-faucet",
    categoryId: "kitchen-fittings",
    sku: "KF-PKF-003", 
    description: {
      en: "Modern pull-out kitchen faucet with flexible hose",
      ar: "صنبور مطبخ عصري قابل للسحب مع خرطوم مرن"
    },
    images: [
      {
        url: "/images/products/mixer.jpg",
        alt: { en: "Pull-out kitchen faucet", ar: "صنبور مطبخ قابل للسحب" },
        isPrimary: true,
        sortOrder: 1
      }
    ],
    pricing: {
      originalPrice: 1600,
      salePrice: 1600, 
      isOnSale: false,
      currency: "EGP"
    },
    inventory: {
      inStock: true,
      quantity: 20,
      lowStockThreshold: 5
    },
    rating: { average: 4.4, count: 16 },
    isActive: true,
    isFeatured: false
  }
];

// Initialize database with sample data if empty
async function initializeDatabaseWithSampleData() {
  try {
    // Check if categories exist
    const categoryCount = await db.collection('categories').countDocuments();
    if (categoryCount === 0) {
      console.log('📂 No categories found, inserting sample categories...');
      await db.collection('categories').insertMany(sampleCategories);
      console.log('✅ Sample categories inserted successfully');
    }

    // Check if products exist
    const productCount = await db.collection('products').countDocuments();
    if (productCount === 0) {
      console.log('🛍️ No products found, inserting sample products...');
      await db.collection('products').insertMany(sampleProducts);
      console.log('✅ Sample products inserted successfully');
    }
    
    console.log(`📊 Database status: ${categoryCount} categories, ${productCount} products`);
  } catch (error) {
    console.error('❌ Error initializing database:', error);
  }
}

// Connect to MongoDB and start server
async function startServer() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    console.log('📍 MongoDB URI:', MONGO_URI);
    console.log('📍 Database Name:', DB_NAME);
    const client = await MongoClient.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB - Product Service');
    db = client.db(DB_NAME);
    
    // Initialize with sample data if database is empty
    await initializeDatabaseWithSampleData();
    
    // Initialize smart search service
    try {
      smartSearchService = new SmartSearchService(db);
      console.log('🔍 Smart search service initialized');
    } catch (error) {
      console.error('⚠️ Smart search service initialization failed:', error.message);
    }
    
    // Initialize recommendation service
    try {
      recommendationService = new RecommendationService(db);
      console.log('🎯 Recommendation service initialized');
    } catch (error) {
      console.error('⚠️ Recommendation service initialization failed:', error.message);
      console.log('⚠️ Recommendations will use fallback logic');
    }
    
    // Start the server only after MongoDB is connected
    app.listen(PORT, () => {
      console.log(`🛍️ Product Service running on port ${PORT}`);
      console.log(`📱 Health check: http://localhost:${PORT}/health`);
      console.log(`📂 Categories: http://localhost:${PORT}/categories`);
      console.log(`🛍️ Products: http://localhost:${PORT}/products`);
    });
    
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

// Routes will be defined below, then server will start

// 🏠 Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'product-service',
    timestamp: new Date().toISOString() 
  });
});

// 🌟 Test endpoint for featured products (placed early to avoid route conflicts)
app.get('/products/test-featured', async (req, res) => {
  try {
    console.log('🔥 Testing featured products endpoint...');
    
    const products = await db.collection('products')
      .find({ 
        isActive: true, 
        isFeatured: true,  // Use consistent field name
        'inventory.inStock': true 
      })
      .sort({ 'rating.average': -1, createdAt: -1 })
      .limit(8)
      .toArray();
    
    console.log(`🔥 Found ${products.length} featured products`);
    
    res.json({
      success: true,
      products,
      total: products.length,
      message: 'Featured products retrieved successfully'
    });
  } catch (error) {
    console.error('❌ Error in test featured products:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch featured products' 
    });
  }
});

// 🌟 Featured products endpoint (called by frontend)
app.get('/products/featured', async (req, res) => {
  try {
    if (!db) {
      return res.status(503).json({ 
        success: false, 
        error: 'Database not connected' 
      });
    }

    const { limit = 8 } = req.query;
    
    const products = await db.collection('products')
      .find({ 
        isActive: true, 
        isFeatured: true,
        'inventory.inStock': true 
      })
      .sort({ 'rating.average': -1, createdAt: -1 })
      .limit(parseInt(limit))
      .toArray();
    
    console.log(`✅ Found ${products.length} featured products`);
    
    res.json({
      success: true,
      products,
      total: products.length,
      message: 'Featured products retrieved successfully'
    });
  } catch (error) {
    console.error('❌ Error fetching featured products:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch featured products' 
    });
  }
});

// 📈 Trending products endpoint (called by frontend)
app.get('/products/trending', async (req, res) => {
  try {
    if (!db) {
      return res.status(503).json({ 
        success: false, 
        error: 'Database not connected' 
      });
    }

    const { limit = 6 } = req.query;
    
    // For now, return highest rated products as trending
    const products = await db.collection('products')
      .find({ 
        isActive: true,
        'inventory.inStock': true 
      })
      .sort({ 'rating.average': -1, 'rating.count': -1 })
      .limit(parseInt(limit))
      .toArray();
    
    console.log(`✅ Found ${products.length} trending products`);
    
    res.json({
      success: true,
      products,
      total: products.length,
      message: 'Trending products retrieved successfully'
    });
  } catch (error) {
    console.error('❌ Error fetching trending products:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch trending products' 
    });
  }
});

// 💎 Categories endpoint
app.get('/categories', async (req, res) => {
  try {
    if (!db) {
      return res.status(503).json({ 
        success: false, 
        error: 'Database not connected' 
      });
    }

    const categories = await db.collection('categories')
      .find({ isActive: true })
      .sort({ sortOrder: 1 })
      .toArray();
    
    res.json({
      success: true,
      categories,
      total: categories.length
    });
  } catch (error) {
    console.error('❌ Error fetching categories:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch categories' 
    });
  }
});

// 📂 Get category by slug
app.get('/categories/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    
    const category = await db.collection('categories')
      .findOne({ slug, isActive: true });
    
    if (!category) {
      return res.status(404).json({ 
        success: false, 
        error: 'Category not found' 
      });
    }
    
    res.json({
      success: true,
      category
    });
  } catch (error) {
    console.error('❌ Error fetching category:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch category' 
    });
  }
});

// 📂 Get all products
app.get('/products', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      category, 
      sortBy = 'createdAt', 
      sortOrder = 'desc',
      search,
      inStock = true
    } = req.query;
    
    let query = { isActive: true };
    
    if (category) {
      query.categoryId = category;
    }
    
    if (search) {
      query.$or = [
        { 'name.en': { $regex: search, $options: 'i' } },
        { 'name.ar': { $regex: search, $options: 'i' } },
        { 'description.en': { $regex: search, $options: 'i' } },
        { 'description.ar': { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (inStock === 'true') {
      query['inventory.inStock'] = true;
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortDirection = sortOrder === 'asc' ? 1 : -1;
    
    const products = await db.collection('products')
      .find(query)
      .sort({ [sortBy]: sortDirection })
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();
    
    const total = await db.collection('products').countDocuments(query);
    
    res.json({
      success: true,
      products,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalProducts: total,
        hasNext: skip + products.length < total,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('❌ Error fetching products:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch products' 
    });
  }
});

// 🎯 Get products by category
app.get('/products/category/:categoryId', async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { 
      page = 1, 
      limit = 20, 
      sortBy = 'createdAt', 
      sortOrder = 'desc' 
    } = req.query;
    
    // Get category info
    const category = await db.collection('categories').findOne({ _id: categoryId });
    
    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Category not found'
      });
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortDirection = sortOrder === 'asc' ? 1 : -1;
    
    const products = await db.collection('products')
      .find({ 
        categoryId: categoryId,
        isActive: true,
        'inventory.inStock': true
      })
      .sort({ [sortBy]: sortDirection })
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();
    
    const total = await db.collection('products').countDocuments({ 
      categoryId: categoryId,
      isActive: true 
    });
    
    res.json({
      success: true,
      category,
      products,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalProducts: total,
        hasNext: skip + products.length < total,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('❌ Error fetching category products:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch category products' 
    });
  }
});

// 🔍 Get product details by slug
app.get('/products/details/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    
    const product = await db.collection('products').findOne({ 
      slug: slug,
      isActive: true 
    });
    
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }
    
    // Get category info
    const category = await db.collection('categories').findOne({ _id: product.categoryId });
    
    // Get related products (same category, excluding current product)
    const relatedProducts = await db.collection('products')
      .find({ 
        categoryId: product.categoryId,
        _id: { $ne: product._id },
        isActive: true,
        'inventory.inStock': true
      })
      .limit(4)
      .toArray();
    
    res.json({
      success: true,
      product: {
        ...product,
        category
      },
      relatedProducts
    });
  } catch (error) {
    console.error('❌ Error fetching product details:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch product details' 
    });
  }
});

// 🔍 Search products (legacy endpoint)
app.get('/products/search', async (req, res) => {
  try {
    const { q, category, sortBy = 'relevance', limit = 20, page = 1 } = req.query;
    
    if (!q || q.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Search query is required'
      });
    }

    if (!smartSearchService) {
      return res.status(503).json({ 
        success: false, 
        error: 'Search service not available' 
      });
    }

    const searchResults = await smartSearchService.searchProducts(q, {
      category,
      sortBy,
      limit: parseInt(limit),
      page: parseInt(page)
    });

    res.json({
      success: true,
      products: searchResults.products,
      total: searchResults.total,
      suggestions: searchResults.suggestions
    });
  } catch (error) {
    console.error('❌ Error in product search:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to search products' 
    });
  }
});

// 🎯 Smart search with auto-complete and typo correction
app.get('/products/smart-search', async (req, res) => {
  try {
    const { q, category, sortBy = 'relevance', limit = 20, page = 1 } = req.query;
    
    if (!q || q.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Search query is required'
      });
    }

    if (!smartSearchService) {
      return res.status(503).json({ 
        success: false, 
        error: 'Search service not available' 
      });
    }

    const searchResults = await smartSearchService.searchProducts(q, {
      category,
      sortBy,
      limit: parseInt(limit),
      page: parseInt(page)
    });

    res.json({
      success: true,
      products: searchResults.products,
      total: searchResults.total,
      suggestions: searchResults.suggestions,
      correctedQuery: searchResults.correctedQuery,
      isTypoCorrected: searchResults.isTypoCorrected
    });
  } catch (error) {
    console.error('❌ Error in smart search:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to perform smart search' 
    });
  }
});

// 🔮 Auto-complete for search
app.get('/products/autocomplete', async (req, res) => {
  try {
    const { q, limit = 8 } = req.query;
    
    if (!q || q.trim() === '') {
      return res.json({
        success: true,
        suggestions: []
      });
    }

    if (!smartSearchService) {
      return res.status(503).json({ 
        success: false, 
        error: 'Search service not available' 
      });
    }

    const suggestions = await smartSearchService.getAutocompleteSuggestions(q, parseInt(limit));
    
    res.json({
      success: true,
      suggestions
    });
  } catch (error) {
    console.error('❌ Error in autocomplete:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get autocomplete suggestions' 
    });
  }
});

// 📈 Get trending searches
app.get('/products/trending', async (req, res) => {
  try {
    const { limit = 6 } = req.query;
    
    if (!smartSearchService) {
      return res.status(503).json({ 
        success: false, 
        error: 'Search service not available' 
      });
    }

    const trendingSearches = await smartSearchService.getTrendingSearches(parseInt(limit));
    
    res.json({
      success: true,
      trending: trendingSearches
    });
  } catch (error) {
    console.error('❌ Error fetching trending searches:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch trending searches' 
    });
  }
});

// ⭐ Get featured products
app.get('/products/featured', async (req, res) => {
  try {
    const { limit = 8 } = req.query;
    
    const products = await db.collection('products')
      .find({ 
        isActive: true, 
        isFeatured: true,
        'inventory.inStock': true 
      })
      .sort({ 'rating.average': -1, createdAt: -1 })
      .limit(parseInt(limit))
      .toArray();
    
    res.json({
      success: true,
      products,
      total: products.length
    });
  } catch (error) {
    console.error('❌ Error fetching featured products:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch featured products' 
    });
  }
});

// 🔥 Get sale products
app.get('/products/sale', async (req, res) => {
  try {
    const { limit = 8 } = req.query;
    
    const products = await db.collection('products')
      .find({ 
        isActive: true, 
        'pricing.isOnSale': true,
        'inventory.inStock': true 
      })
      .sort({ 'pricing.discountPercentage': -1, createdAt: -1 })
      .limit(parseInt(limit))
      .toArray();
    
    res.json({
      success: true,
      products,
      total: products.length
    });
  } catch (error) {
    console.error('❌ Error fetching sale products:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch sale products' 
    });
  }
});

// 🎯 Get personalized recommendations
app.get('/products/recommendations/personalized', async (req, res) => {
  try {
    const { userId, limit = 8 } = req.query;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
    }

    if (!recommendationService) {
      // Fallback: return featured products when recommendation service is not available
      console.log('⚠️ Recommendation service not available, using fallback logic');
      
      if (!db) {
        return res.status(503).json({ 
          success: false, 
          error: 'Database not connected' 
        });
      }

      const fallbackProducts = await db.collection('products')
        .find({ 
          isActive: true, 
          isFeatured: true,
          'inventory.inStock': true 
        })
        .sort({ 'rating.average': -1, createdAt: -1 })
        .limit(parseInt(limit))
        .toArray();
      
      return res.json({
        success: true,
        recommendations: fallbackProducts,
        total: fallbackProducts.length,
        message: 'Personalized recommendations (fallback mode)'
      });
    }
    
    const recommendations = await recommendationService.getPersonalizedRecommendations(userId, parseInt(limit));
    
    res.json({
      success: true,
      recommendations
    });
  } catch (error) {
    console.error('❌ Error fetching personalized recommendations:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch personalized recommendations' 
    });
  }
});

// 🎯 Get related products
app.get('/products/:productId/related', async (req, res) => {
  try {
    const { productId } = req.params;
    const { limit = 6 } = req.query;

    if (!recommendationService) {
      return res.status(503).json({ 
        success: false, 
        error: 'Recommendation service not available' 
      });
    }
    
    const relatedProducts = await recommendationService.getRelatedProducts(productId, parseInt(limit));
    
    res.json({
      success: true,
      relatedProducts
    });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch related products' 
    });
  }
});

// 🛍️ Get frequently bought together
app.get('/products/:productId/frequently-bought-together', async (req, res) => {
  try {
    const { productId } = req.params;
    const { limit = 4 } = req.query;

    if (!recommendationService) {
      return res.status(503).json({ 
        success: false, 
        error: 'Recommendation service not available' 
      });
    }
    
    const frequentlyBoughtTogether = await recommendationService.getFrequentlyBoughtTogether(productId, parseInt(limit));
    
    res.json({
      success: true,
      frequentlyBoughtTogether
    });
  } catch (error) {
    console.error('❌ Error fetching frequently bought together:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch frequently bought together' 
    });
  }
});

// 📦 Get product bundles
app.get('/products/:productId/bundles', async (req, res) => {
  try {
    const { productId } = req.params;
    const { limit = 3 } = req.query;

    if (!recommendationService) {
      return res.status(503).json({ 
        success: false, 
        error: 'Recommendation service not available' 
      });
    }
    
    const bundles = await recommendationService.getSmartBundles(productId, parseInt(limit));
    
    res.json({
      success: true,
      bundles
    });
  } catch (error) {
    console.error('❌ Error fetching product bundles:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch product bundles' 
    });
  }
});

// 🔍 Get similar products
app.get('/products/:productId/similar', async (req, res) => {
  try {
    const { productId } = req.params;
    const { limit = 6 } = req.query;

    if (!recommendationService) {
      return res.status(503).json({ 
        success: false, 
        error: 'Recommendation service not available' 
      });
    }
    
    const similarProducts = await recommendationService.getSimilarProducts(productId, parseInt(limit));
    
    res.json({
      success: true,
      similarProducts
    });
  } catch (error) {
    console.error('❌ Error fetching similar products:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch similar products' 
    });
  }
});

// 📊 Track user interaction
app.post('/products/:productId/interaction', async (req, res) => {
  try {
    const { productId } = req.params;
    const { userId, interactionType } = req.body;

    if (!recommendationService) {
      return res.status(503).json({ 
        success: false, 
        error: 'Recommendation service not available' 
      });
    }
    
    await recommendationService.trackUserInteraction(userId, productId, interactionType);
    
    res.json({
      success: true,
      message: 'Interaction tracked successfully'
    });
  } catch (error) {
    console.error('❌ Error tracking interaction:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to track interaction' 
    });
  }
});

// 📊 Get product statistics
app.get('/stats/products', async (req, res) => {
  try {
    const totalProducts = await db.collection('products')
      .countDocuments({ isActive: true });
    
    const inStockProducts = await db.collection('products')
      .countDocuments({ 
        isActive: true, 
        'inventory.inStock': true 
      });
    
    const featuredProducts = await db.collection('products')
      .countDocuments({ 
        isActive: true, 
        isFeatured: true 
      });
    
    const onSaleProducts = await db.collection('products')
      .countDocuments({ 
        isActive: true, 
        'pricing.isOnSale': true 
      });
    
    const categoryStats = await db.collection('products').aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$categoryId', count: { $sum: 1 } } },
      { $lookup: { 
        from: 'categories', 
        localField: '_id', 
        foreignField: '_id', 
        as: 'category' 
      }},
      { $unwind: '$category' },
      { $project: { 
        categoryName: '$category.name.en',
        count: 1 
      }}
    ]).toArray();
    
    res.json({
      success: true,
      stats: {
        totalProducts,
        inStockProducts,
        featuredProducts,
        onSaleProducts,
        categoryBreakdown: categoryStats
      }
    });
  } catch (error) {
    console.error('❌ Error fetching product stats:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch product statistics' 
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Unhandled error:', err);
  res.status(500).json({ 
    success: false, 
    error: 'Internal server error' 
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false, 
    error: 'Endpoint not found' 
  });
});

// Start the server after all routes are defined
startServer();