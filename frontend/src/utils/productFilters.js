// Utility functions for filtering products based on advanced filters

export const applyFilters = (products, filters) => {
  if (!products || products.length === 0) return [];

  return products.filter(product => {
    // Get product properties with fallbacks for different data structures
    const productName = product.name?.en || product.ItemName || '';
    const productDescription = product.description?.en || product.shortDescription?.en || '';
    const productPrice = product.pricing?.salePrice || product.pricing?.originalPrice || product.Price || 0;
    const productCategory = product.categoryId?.name?.en || product.CategoryName || '';
    const productBrand = product.brand?.name || product.BrandName || '';
    const productMaterials = product.materials || product.Material || [];
    const isInStock = product.inventory?.inStock !== false;
    const isOnSale = product.pricing?.isOnSale || 
                     (product.pricing?.salePrice && product.pricing?.originalPrice && 
                      product.pricing.salePrice < product.pricing.originalPrice);

    // Search term filter
    if (filters.searchTerm && filters.searchTerm.trim()) {
      const searchTerm = filters.searchTerm.toLowerCase().trim();
      const searchableText = `${productName} ${productDescription} ${productCategory} ${productBrand}`.toLowerCase();
      if (!searchableText.includes(searchTerm)) {
        return false;
      }
    }

    // Price range filter
    if (filters.priceRange) {
      if (productPrice < filters.priceRange.min || productPrice > filters.priceRange.max) {
        return false;
      }
    }

    // Categories filter
    if (filters.categories && filters.categories.length > 0) {
      if (!filters.categories.includes(productCategory)) {
        return false;
      }
    }

    // Brands filter
    if (filters.brands && filters.brands.length > 0) {
      if (!filters.brands.includes(productBrand)) {
        return false;
      }
    }

    // Materials filter
    if (filters.materials && filters.materials.length > 0) {
      const hasMatchingMaterial = filters.materials.some(filterMaterial => 
        Array.isArray(productMaterials) 
          ? productMaterials.includes(filterMaterial)
          : productMaterials === filterMaterial
      );
      if (!hasMatchingMaterial) {
        return false;
      }
    }

    // Stock filter
    if (filters.inStock === true && !isInStock) {
      return false;
    }

    // Sale filter
    if (filters.onSale === true && !isOnSale) {
      return false;
    }

    return true;
  });
};

export const sortProducts = (products, sortBy) => {
  if (!products || products.length === 0) return [];

  return [...products].sort((a, b) => {
    const getPrice = (product) => product.pricing?.salePrice || product.pricing?.originalPrice || product.Price || 0;
    const getName = (product) => product.name?.en || product.ItemName || '';
    const getCreatedAt = (product) => new Date(product.createdAt || product.CreatedAt || 0);
    const getRating = (product) => product.rating?.average || 0;

    switch (sortBy) {
      case 'pricing.salePrice':
        return getPrice(a) - getPrice(b); // Low to High
      case 'pricing.salePrice_desc':
        return getPrice(b) - getPrice(a); // High to Low
      case 'name.en':
        return getName(a).localeCompare(getName(b));
      case 'createdAt':
        return getCreatedAt(b) - getCreatedAt(a); // Newest first
      case 'rating.average':
        return getRating(b) - getRating(a); // Highest rated first
      case 'featured':
      default:
        // Featured products first, then by creation date
        const aFeatured = a.featured ? 1 : 0;
        const bFeatured = b.featured ? 1 : 0;
        if (aFeatured !== bFeatured) {
          return bFeatured - aFeatured;
        }
        return getCreatedAt(b) - getCreatedAt(a);
    }
  });
};

export const getFilterCounts = (products, currentFilters) => {
  const counts = {
    total: products.length,
    inStock: 0,
    onSale: 0,
    categories: {},
    brands: {},
    materials: {},
    priceRanges: {
      '0-500': 0,
      '500-1000': 0,
      '1000-2500': 0,
      '2500+': 0
    }
  };

  products.forEach(product => {
    const productPrice = product.pricing?.salePrice || product.pricing?.originalPrice || product.Price || 0;
    const productCategory = product.categoryId?.name?.en || product.CategoryName || '';
    const productBrand = product.brand?.name || product.BrandName || '';
    const productMaterials = product.materials || product.Material || [];
    const isInStock = product.inventory?.inStock !== false;
    const isOnSale = product.pricing?.isOnSale || 
                     (product.pricing?.salePrice && product.pricing?.originalPrice && 
                      product.pricing.salePrice < product.pricing.originalPrice);

    // Count availability
    if (isInStock) counts.inStock++;
    if (isOnSale) counts.onSale++;

    // Count categories
    if (productCategory) {
      counts.categories[productCategory] = (counts.categories[productCategory] || 0) + 1;
    }

    // Count brands
    if (productBrand) {
      counts.brands[productBrand] = (counts.brands[productBrand] || 0) + 1;
    }

    // Count materials
    if (Array.isArray(productMaterials)) {
      productMaterials.forEach(material => {
        counts.materials[material] = (counts.materials[material] || 0) + 1;
      });
    } else if (productMaterials) {
      counts.materials[productMaterials] = (counts.materials[productMaterials] || 0) + 1;
    }

    // Count price ranges
    if (productPrice < 500) counts.priceRanges['0-500']++;
    else if (productPrice < 1000) counts.priceRanges['500-1000']++;
    else if (productPrice < 2500) counts.priceRanges['1000-2500']++;
    else counts.priceRanges['2500+']++;
  });

  return counts;
};

export const getUniqueFilterValues = (products) => {
  const categories = [...new Set(products.map(p => p.categoryId?.name?.en || p.CategoryName).filter(Boolean))];
  const brands = [...new Set(products.map(p => p.brand?.name || p.BrandName).filter(Boolean))];
  const materials = [...new Set(products.flatMap(p => p.materials || p.Material || []).filter(Boolean))];
  
  const priceRange = products.reduce(
    (range, product) => {
      const price = product.pricing?.salePrice || product.pricing?.originalPrice || product.Price || 0;
      return {
        min: Math.min(range.min, price),
        max: Math.max(range.max, price)
      };
    },
    { min: Infinity, max: 0 }
  );

  return {
    categories: categories.sort(),
    brands: brands.sort(),
    materials: materials.sort(),
    priceRange: {
      min: priceRange.min === Infinity ? 0 : Math.floor(priceRange.min),
      max: Math.ceil(priceRange.max)
    }
  };
}; 