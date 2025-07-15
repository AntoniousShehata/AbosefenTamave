import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function SmartSearch({ onSearchResults, className = '' }) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [trendingSearches, setTrendingSearches] = useState([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  
  const navigate = useNavigate();
  const searchInputRef = useRef(null);
  const suggestionsRef = useRef(null);
  const debounceRef = useRef(null);

  // Load recent searches and trending on component mount
  useEffect(() => {
    loadRecentSearches();
    loadTrendingSearches();
  }, []);

  // Load recent searches from localStorage
  const loadRecentSearches = () => {
    try {
      const saved = localStorage.getItem('recentSearches');
      if (saved) {
        setRecentSearches(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading recent searches:', error);
    }
  };

  // Load trending searches
  const loadTrendingSearches = async () => {
    try {
      const response = await axios.get('http://localhost:3003/products/trending?limit=6');
      if (response.data.success) {
        setTrendingSearches(response.data.trending);
      }
    } catch (error) {
      console.error('Error loading trending searches:', error);
    }
  };

  // Save search to recent searches
  const saveRecentSearch = (searchTerm) => {
    try {
      const recent = [searchTerm, ...recentSearches.filter(s => s !== searchTerm)].slice(0, 5);
      setRecentSearches(recent);
      localStorage.setItem('recentSearches', JSON.stringify(recent));
    } catch (error) {
      console.error('Error saving recent search:', error);
    }
  };

  // Debounced autocomplete
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if ((query?.length ?? 0) >= 2) {
      debounceRef.current = setTimeout(() => {
        fetchAutoComplete(query);
      }, 300);
    } else {
      setSuggestions([]);
    }

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query]);

  // Fetch autocomplete suggestions
  const fetchAutoComplete = async (searchTerm) => {
    try {
      const response = await axios.get(`http://localhost:3003/products/autocomplete?q=${encodeURIComponent(searchTerm)}&limit=8`);
      if (response.data.success) {
        setSuggestions(response.data.suggestions);
      }
    } catch (error) {
      console.error('Error fetching autocomplete:', error);
    }
  };

  // Handle search execution
  const handleSearch = async (searchTerm = query) => {
    if (!searchTerm.trim()) return;
    
    setLoading(true);
    setShowSuggestions(false);
    
    try {
      const response = await axios.get(`http://localhost:3003/products/smart-search?q=${encodeURIComponent(searchTerm)}&limit=20&includeSuggestions=true`);
      
      if (response.data.success) {
        saveRecentSearch(searchTerm);
        
        // Call parent callback if provided
        if (onSearchResults) {
          onSearchResults({
            results: response.data.results,
            suggestions: response.data.suggestions,
            query: searchTerm,
            totalFound: response.data.totalFound
          });
        } else {
          // Navigate to search results page
          navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
        }
      }
    } catch (error) {
      console.error('Error executing search:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle input change
  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    setActiveIndex(-1);
    
    if ((value?.length ?? 0) >= 2) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  // Handle key navigation
  const handleKeyDown = (e) => {
    if (!showSuggestions || (suggestions?.length ?? 0) === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex(prev => (prev + 1) % (suggestions?.length ?? 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex(prev => (prev - 1 + (suggestions?.length ?? 1)) % (suggestions?.length ?? 1));
        break;
      case 'Enter':
        e.preventDefault();
        if (activeIndex >= 0) {
          handleSuggestionClick(suggestions[activeIndex]);
        } else {
          handleSearch();
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setActiveIndex(-1);
        break;
      default:
        break;
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    const searchTerm = suggestion.suggestion || suggestion.text;
    setQuery(searchTerm);
    setShowSuggestions(false);
    setActiveIndex(-1);
    
    // Ensure we have a valid search term
    if (searchTerm && searchTerm.trim()) {
      handleSearch(searchTerm.trim());
    }
  };

  // Handle focus
  const handleFocus = () => {
    if ((query?.length ?? 0) >= 2) {
      setShowSuggestions(true);
    }
  };

  // Handle blur
  const handleBlur = (e) => {
    // Delay hiding suggestions to allow clicking
    setTimeout(() => {
      if (!suggestionsRef.current?.contains(e.relatedTarget)) {
        setShowSuggestions(false);
      }
    }, 200);
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <input
          ref={searchInputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder="Search products..."
          className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
        />
        
        {/* Search Button */}
        <button
          onClick={() => handleSearch()}
          disabled={loading}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 text-gray-400 hover:text-primary transition"
        >
          {loading ? (
            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          )}
        </button>
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && (
        <div
          ref={suggestionsRef}
          className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-lg shadow-xl mt-1 max-h-96 overflow-y-auto z-50"
        >
          {/* Autocomplete suggestions */}
          {suggestions?.length > 0 && (
            <div className="border-b border-gray-100">
              <div className="px-4 py-2 text-sm font-medium text-gray-500">Suggestions</div>
              {(suggestions || []).map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className={`w-full px-4 py-3 text-left hover:bg-blue-50 transition duration-150 ease-in-out ${
                    activeIndex === index ? 'bg-blue-100' : ''
                  }`}
                >
                  <div className="flex items-center">
                    <svg className="h-4 w-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <span className="text-black font-medium">{suggestion.suggestion || suggestion.text}</span>
                    {suggestion.type === 'category' && (
                      <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Category</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Recent searches */}
          {recentSearches?.length > 0 && (query?.length ?? 0) < 2 && (
            <div className="border-b border-gray-100">
              <div className="px-4 py-2 text-sm font-medium text-gray-500">Recent Searches</div>
              {(recentSearches || []).map((search, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick({ text: search })}
                  className="w-full px-4 py-3 text-left hover:bg-blue-50 transition duration-150 ease-in-out"
                >
                  <div className="flex items-center">
                    <svg className="h-4 w-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-black font-medium">{search}</span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Trending searches */}
          {trendingSearches?.length > 0 && (query?.length ?? 0) < 2 && (
            <div>
              <div className="px-4 py-2 text-sm font-medium text-gray-500">Trending</div>
              {(trendingSearches || []).map((trend, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick({ text: trend.term })}
                  className="w-full px-4 py-3 text-left hover:bg-blue-50 transition duration-150 ease-in-out"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <svg className="h-4 w-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                      <span className="text-black font-medium">{trend.term}</span>
                    </div>
                    <span className="text-xs text-gray-500">{trend.count} products</span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Empty state */}
          {(suggestions?.length ?? 0) === 0 && (query?.length ?? 0) >= 2 && (
            <div className="px-4 py-6 text-center text-gray-500">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <p className="mt-2">No suggestions found</p>
              <p className="text-sm">Try a different search term</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default SmartSearch; 