import React, { useState, useEffect, useMemo } from 'react';

// Simple SVG icons to replace heroicons
const ChevronDownIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

const ChevronUpIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
  </svg>
);

const XMarkIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const FunnelIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
  </svg>
);

const AdvancedFilters = ({ 
  products = [], 
  onFiltersChange, 
  initialFilters = {},
  isOpen = true,
  onToggle 
}) => {
  const [filters, setFilters] = useState({
    priceRange: { min: 0, max: 10000 },
    categories: [],
    brands: [],
    materials: [],
    inStock: null,
    onSale: null,
    searchTerm: '',
    ...initialFilters
  });

  const [expandedSections, setExpandedSections] = useState({
    price: true,
    categories: true,
    brands: true,
    materials: true,
    availability: true
  });

  // Extract unique values from products
  const filterOptions = useMemo(() => {
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
  }, [products]);

  // Update filters when products change
  useEffect(() => {
    if (filterOptions.priceRange.max > 0) {
      setFilters(prev => ({
        ...prev,
        priceRange: {
          min: prev.priceRange.min || filterOptions.priceRange.min,
          max: prev.priceRange.max || filterOptions.priceRange.max
        }
      }));
    }
  }, [filterOptions]);

  // Notify parent component when filters change
  useEffect(() => {
    onFiltersChange?.(filters);
  }, [filters, onFiltersChange]);

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const handleArrayFilterToggle = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: prev[filterType].includes(value)
        ? prev[filterType].filter(item => item !== value)
        : [...prev[filterType], value]
    }));
  };

  const handlePriceRangeChange = (type, value) => {
    setFilters(prev => ({
      ...prev,
      priceRange: {
        ...prev.priceRange,
        [type]: parseInt(value)
      }
    }));
  };

  const clearFilters = () => {
    setFilters({
      priceRange: { min: filterOptions.priceRange.min, max: filterOptions.priceRange.max },
      categories: [],
      brands: [],
      materials: [],
      inStock: null,
      onSale: null,
      searchTerm: ''
    });
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const FilterSection = ({ title, sectionKey, children }) => (
    <div className="border-b border-gray-200 pb-4 mb-4">
      <button
        onClick={() => toggleSection(sectionKey)}
        className="flex items-center justify-between w-full text-left font-medium text-gray-900 hover:text-primary transition"
      >
        <span>{title}</span>
        {expandedSections[sectionKey] ? (
          <ChevronUpIcon className="h-5 w-5" />
        ) : (
          <ChevronDownIcon className="h-5 w-5" />
        )}
      </button>
      {expandedSections[sectionKey] && (
        <div className="mt-3 space-y-2">
          {children}
        </div>
      )}
    </div>
  );

  const CheckboxFilter = ({ options, selectedValues, onToggle, searchable = false }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const filteredOptions = searchable 
      ? options.filter(option => option.toLowerCase().includes(searchTerm.toLowerCase()))
      : options;

    return (
      <div>
        {searchable && options.length > 5 && (
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-primary focus:border-primary mb-2"
          />
        )}
        <div className="max-h-40 overflow-y-auto space-y-2">
          {filteredOptions.map(option => (
            <label key={option} className="flex items-center text-sm cursor-pointer hover:bg-gray-50 p-1 rounded">
              <input
                type="checkbox"
                checked={selectedValues.includes(option)}
                onChange={() => onToggle(option)}
                className="rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span className="ml-2 text-gray-700">{option}</span>
            </label>
          ))}
        </div>
      </div>
    );
  };

  if (!isOpen) {
    return (
      <div className="lg:hidden">
        <button
          onClick={onToggle}
          className="flex items-center space-x-2 bg-primary text-white px-4 py-2 rounded-lg"
        >
          <FunnelIcon className="h-5 w-5" />
          <span>Filters</span>
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 h-fit sticky top-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <FunnelIcon className="h-5 w-5 mr-2" />
          Filters
        </h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={clearFilters}
            className="text-sm text-gray-500 hover:text-primary transition"
          >
            Clear All
          </button>
          <button
            onClick={onToggle}
            className="lg:hidden text-gray-500 hover:text-primary"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search products..."
          value={filters.searchTerm}
          onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
        />
      </div>

      {/* Price Range Filter */}
      <FilterSection title="Price Range" sectionKey="price">
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <div className="flex-1">
              <label className="block text-xs text-gray-500 mb-1">Min Price</label>
              <input
                type="number"
                value={filters.priceRange.min}
                onChange={(e) => handlePriceRangeChange('min', e.target.value)}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-primary focus:border-primary"
                min={filterOptions.priceRange.min}
                max={filterOptions.priceRange.max}
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs text-gray-500 mb-1">Max Price</label>
              <input
                type="number"
                value={filters.priceRange.max}
                onChange={(e) => handlePriceRangeChange('max', e.target.value)}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-primary focus:border-primary"
                min={filterOptions.priceRange.min}
                max={filterOptions.priceRange.max}
              />
            </div>
          </div>
          <div className="text-sm text-gray-600 text-center">
            EGP {filters.priceRange.min.toLocaleString()} - EGP {filters.priceRange.max.toLocaleString()}
          </div>
        </div>
      </FilterSection>

      {/* Categories Filter */}
      {filterOptions.categories.length > 0 && (
        <FilterSection title="Categories" sectionKey="categories">
          <CheckboxFilter
            options={filterOptions.categories}
            selectedValues={filters.categories}
            onToggle={(value) => handleArrayFilterToggle('categories', value)}
            searchable={filterOptions.categories.length > 5}
          />
        </FilterSection>
      )}

      {/* Brands Filter */}
      {filterOptions.brands.length > 0 && (
        <FilterSection title="Brands" sectionKey="brands">
          <CheckboxFilter
            options={filterOptions.brands}
            selectedValues={filters.brands}
            onToggle={(value) => handleArrayFilterToggle('brands', value)}
            searchable={filterOptions.brands.length > 5}
          />
        </FilterSection>
      )}

      {/* Materials Filter */}
      {filterOptions.materials.length > 0 && (
        <FilterSection title="Materials" sectionKey="materials">
          <CheckboxFilter
            options={filterOptions.materials}
            selectedValues={filters.materials}
            onToggle={(value) => handleArrayFilterToggle('materials', value)}
            searchable={filterOptions.materials.length > 5}
          />
        </FilterSection>
      )}

      {/* Availability Filter */}
      <FilterSection title="Availability" sectionKey="availability">
        <div className="space-y-2">
          <label className="flex items-center text-sm cursor-pointer hover:bg-gray-50 p-1 rounded">
            <input
              type="checkbox"
              checked={filters.inStock === true}
              onChange={(e) => handleFilterChange('inStock', e.target.checked ? true : null)}
              className="rounded border-gray-300 text-primary focus:ring-primary"
            />
            <span className="ml-2 text-gray-700">In Stock Only</span>
          </label>
          <label className="flex items-center text-sm cursor-pointer hover:bg-gray-50 p-1 rounded">
            <input
              type="checkbox"
              checked={filters.onSale === true}
              onChange={(e) => handleFilterChange('onSale', e.target.checked ? true : null)}
              className="rounded border-gray-300 text-primary focus:ring-primary"
            />
            <span className="ml-2 text-gray-700">On Sale Only</span>
          </label>
        </div>
      </FilterSection>

      {/* Active Filters Summary */}
      {(filters.categories.length > 0 || filters.brands.length > 0 || filters.materials.length > 0) && (
        <div className="pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Active Filters</h4>
          <div className="flex flex-wrap gap-2">
            {[...filters.categories, ...filters.brands, ...filters.materials].map((filter, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary/10 text-primary"
              >
                {filter}
                <button
                  onClick={() => {
                    if (filters.categories.includes(filter)) handleArrayFilterToggle('categories', filter);
                    if (filters.brands.includes(filter)) handleArrayFilterToggle('brands', filter);
                    if (filters.materials.includes(filter)) handleArrayFilterToggle('materials', filter);
                  }}
                  className="ml-1 hover:text-primary-dark"
                >
                  <XMarkIcon className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedFilters; 