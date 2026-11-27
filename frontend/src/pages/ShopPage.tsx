import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, Search, X, RotateCcw, Star } from 'lucide-react';
import { useStore } from '../contexts/StoreContext';
import { ProductCard } from '../components/ProductCard';
import { productService } from '../services/product.service';
import type { Product } from '../types';
import { searchCatalogProducts } from '../utils/catalogSearch';
import { formatPrice } from '../utils/format';

type SortOption = 'featured' | 'newest' | 'price-asc' | 'price-desc' | 'rating';

export const ShopPage: React.FC = () => {
  const { products, categories } = useStore();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialQuery = searchParams.get('q') || '';
  const initialCategory = searchParams.get('category') || 'all';
  const initialSeries = searchParams.get('series') || 'all';
  const initialSaleOnly = searchParams.get('sale') === 'true';

  const catalogMaxPrice = useMemo(() => {
    const highest = products.reduce((max, p) => Math.max(max, p.price), 0);
    return Math.max(100, Math.ceil(highest / 10) * 10);
  }, [products]);

  const [query, setQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedSeries, setSelectedSeries] = useState(initialSeries);
  const [maxPrice, setMaxPrice] = useState(catalogMaxPrice);
  const userChangedMaxPriceRef = useRef(false);
  const [minRating, setMinRating] = useState(0);
  const [saleOnly, setSaleOnly] = useState(initialSaleOnly);
  const [sortBy, setSortBy] = useState<SortOption>('featured');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [remoteSearchItems, setRemoteSearchItems] = useState<Product[] | null>(null);
  const [isSearchingDb, setIsSearchingDb] = useState(false);

  useEffect(() => {
    if (!userChangedMaxPriceRef.current) {
      setMaxPrice(catalogMaxPrice);
    }
  }, [catalogMaxPrice]);

  const handleCategorySelect = (categorySlug: string) => {
    setSelectedCategory(categorySlug);
    const next = new URLSearchParams(searchParams);
    if (categorySlug === 'all') {
      next.delete('category');
    } else {
      next.set('category', categorySlug);
    }
    setSearchParams(next, { replace: true });
  };

  const handleSearchChange = (nextQuery: string) => {
    setQuery(nextQuery);
    const next = new URLSearchParams(searchParams);
    if (nextQuery.trim()) {
      next.set('q', nextQuery);
    } else {
      next.delete('q');
    }
    setSearchParams(next, { replace: true });
  };

  // Sync URL query params when navigated externally
  useEffect(() => {
    setQuery(searchParams.get('q') || '');
    setSelectedCategory(searchParams.get('category') || 'all');
    setSelectedSeries(searchParams.get('series') || 'all');
    setSaleOnly(searchParams.get('sale') === 'true');
  }, [searchParams]);

  // Query PostgreSQL /api/v1/products when searching or filtering by category
  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed && selectedCategory === 'all') {
      setRemoteSearchItems(null);
      setIsSearchingDb(false);
      return;
    }

    let cancelled = false;
    setIsSearchingDb(true);
    const timer = window.setTimeout(() => {
      const cat = selectedCategory !== 'all'
        ? categories.find((c) => c.slug === selectedCategory || c.id === selectedCategory)
        : undefined;

      productService
        .getProducts({
          ...(trimmed ? { search: trimmed } : {}),
          ...(cat ? { category_id: Number(cat.id) || undefined, category_slug: Number(cat.id) ? undefined : cat.slug } : selectedCategory !== 'all' ? { category_slug: selectedCategory } : {}),
          status: 'active',
          page_size: 100,
        })
        .then((res) => {
          if (!cancelled) {
            setRemoteSearchItems(res.items);
          }
        })
        .catch(() => {
          if (!cancelled) {
            setRemoteSearchItems(null);
          }
        })
        .finally(() => {
          if (!cancelled) {
            setIsSearchingDb(false);
          }
        });
    }, trimmed ? 180 : 0);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [query, selectedCategory, categories]);

  const seriesList = useMemo(
    () => Array.from(new Set(products.map((p) => p.series).filter(Boolean))).sort(),
    [products]
  );

  const { filteredProducts, usedFuzzySearch, suggestedTerm } = useMemo(() => {
    const q = query.trim();
    let baseList = products;
    let fuzzy = false;
    let suggestion: string | null = null;

    if (q) {
      if (remoteSearchItems && remoteSearchItems.length > 0) {
        baseList = remoteSearchItems;
      } else {
        const searchRes = searchCatalogProducts(products, q);
        baseList = searchRes.items;
        fuzzy = searchRes.usedFuzzy;
        suggestion = searchRes.suggestedTerm;
      }
    } else if (selectedCategory !== 'all' && remoteSearchItems !== null) {
      baseList = remoteSearchItems;
    }

    const list = baseList.filter((p) => {
      if (selectedCategory !== 'all') {
        const cat = categories.find(
          (c) => c.slug === selectedCategory || c.id === selectedCategory
        );
        if (!cat) return false;
        const matchesCat =
          p.categoryId === cat.id ||
          p.categoryName.toLowerCase() === cat.name.toLowerCase();
        if (!matchesCat) return false;
      }

      if (selectedSeries !== 'all' && p.series !== selectedSeries) return false;
      if (p.price > maxPrice) return false;
      if (p.rating < minRating) return false;
      if (saleOnly && (!p.originalPrice || p.originalPrice <= p.price)) return false;

      return true;
    });

    const sorted = [...list];
    switch (sortBy) {
      case 'price-asc':
        sorted.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        sorted.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        sorted.sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount);
        break;
      case 'newest':
        sorted.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        break;
      case 'featured':
      default:
        sorted.sort((a, b) => Number(b.featured) - Number(a.featured));
        break;
    }

    return {
      filteredProducts: sorted,
      usedFuzzySearch: fuzzy,
      suggestedTerm: suggestion,
    };
  }, [products, remoteSearchItems, categories, query, selectedCategory, selectedSeries, maxPrice, minRating, saleOnly, sortBy]);

  const hasActiveFilters =
    query.trim() !== '' ||
    selectedCategory !== 'all' ||
    selectedSeries !== 'all' ||
    maxPrice < catalogMaxPrice ||
    minRating > 0 ||
    saleOnly;

  const resetFilters = () => {
    setQuery('');
    setSelectedCategory('all');
    setSelectedSeries('all');
    userChangedMaxPriceRef.current = false;
    setMaxPrice(catalogMaxPrice);
    setMinRating(0);
    setSaleOnly(false);
    setSortBy('featured');
    setRemoteSearchItems(null);
    setSearchParams({});
  };

  const filterPanel = (
    <div className="space-y-6">
      {/* Search inside filter */}
      <div>
        <label htmlFor="shop-filter-search" className="block text-xs font-bold text-[#3D160F] mb-2">
          Search Catalog
        </label>
        <div className="relative">
          <Search className="w-4 h-4 text-[#8E6453] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            id="shop-filter-search"
            type="text"
            value={query}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Character, figure, manga..."
            className="w-full pl-9 pr-8 py-2 rounded-xl bg-[#FFF8EF] border border-[#E7D2BC] text-sm text-[#3D160F] focus:outline-none focus:border-[#D96532]"
          />
          {query.trim().length > 0 && (
            <button
              type="button"
              onClick={() => handleSearchChange('')}
              aria-label="Clear catalog search"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-[#8E6453] hover:text-[#3D160F] cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Category Filter */}
      <div>
        <p className="text-xs font-bold text-[#3D160F] mb-2.5">Category</p>
        <div className="space-y-1">
          <button
            type="button"
            onClick={() => handleCategorySelect('all')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-colors cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-[#D96532] text-white font-semibold'
                : 'text-[#5A3224] hover:bg-[#F7DCC3]/50'
            }`}
          >
            <span>All Categories</span>
            <span className="text-xs opacity-80 tabular-nums">{products.length}</span>
          </button>
          {categories.map((cat) => {
            const count = products.filter((p) => p.categoryId === cat.id).length;
            const active = selectedCategory === cat.slug || selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleCategorySelect(cat.slug)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-colors cursor-pointer ${
                  active
                    ? 'bg-[#D96532] text-white font-semibold'
                    : 'text-[#5A3224] hover:bg-[#F7DCC3]/50'
                }`}
              >
                <span className="truncate">{cat.name}</span>
                <span className="text-xs opacity-80 tabular-nums">{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Anime Series Filter */}
      <div>
        <label htmlFor="series-select" className="block text-xs font-bold text-[#3D160F] mb-2">
          Anime Series
        </label>
        <select
          id="series-select"
          value={selectedSeries}
          onChange={(e) => setSelectedSeries(e.target.value)}
          className="w-full px-3 py-2 rounded-xl bg-[#FFF8EF] border border-[#E7D2BC] text-sm text-[#3D160F] focus:outline-none focus:border-[#D96532]"
        >
          <option value="all">All Anime Series</option>
          {seriesList.map((series) => (
            <option key={series} value={series}>
              {series}
            </option>
          ))}
        </select>
      </div>

      {/* Max Price Slider */}
      <div>
        <div className="flex items-center justify-between text-xs font-bold text-[#3D160F] mb-2">
          <label htmlFor="max-price-range">Max Price</label>
          <span className="text-[#D96532] tabular-nums">{formatPrice(maxPrice)}</span>
        </div>
        <input
          id="max-price-range"
          type="range"
          min={10}
          max={catalogMaxPrice}
          step={5}
          value={maxPrice}
          onChange={(e) => {
            userChangedMaxPriceRef.current = true;
            setMaxPrice(Number(e.target.value));
          }}
          className="w-full accent-[#D96532] cursor-pointer"
        />
        <div className="flex justify-between text-[11px] text-[#8E6453] mt-1 tabular-nums">
          <span>$10</span>
          <span>${Math.round((10 + catalogMaxPrice) / 2)}</span>
          <span>${catalogMaxPrice}</span>
        </div>
      </div>

      {/* Rating Filter */}
      <div>
        <p className="text-xs font-bold text-[#3D160F] mb-2">Minimum Rating</p>
        <div className="flex flex-wrap gap-1.5">
          {[0, 4.5, 4.8].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setMinRating(r)}
              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                minRating === r
                  ? 'bg-[#3D160F] text-[#FFF8EF]'
                  : 'bg-[#F7E5CE]/70 text-[#5A3224] hover:bg-[#F7DCC3]'
              }`}
            >
              {r === 0 ? (
                <span>Any</span>
              ) : (
                <>
                  <Star className="w-3 h-3 fill-[#F5A623] text-[#F5A623]" />
                  <span>{r}+</span>
                </>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* On Sale Toggle */}
      <label className="flex items-center gap-2.5 cursor-pointer text-sm text-[#4D2318]">
        <input
          type="checkbox"
          checked={saleOnly}
          onChange={(e) => setSaleOnly(e.target.checked)}
          className="w-4 h-4 rounded accent-[#D96532]"
        />
        <span className="font-medium">Special Sale items only</span>
      </label>

      {hasActiveFilters && (
        <button
          type="button"
          onClick={resetFilters}
          className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-[#DFC5AA] text-xs font-semibold text-[#5E3224] hover:bg-[#F7DCC3]/50 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset All Filters</span>
        </button>
      )}
    </div>
  );

  return (
    <div className="pb-6">
      {/* Header Banner */}
      <div className="rounded-2xl bg-[#F7E5CE] border border-[#EAD3B8] px-6 py-6 sm:px-8 sm:py-7 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-[#3D160F]">
            Shop Anime Merchandise
          </h1>
          <p className="mt-1.5 text-sm text-[#6B4235]">
            Authentic PVC figures, collector manga sets, streetwear haori, and plush companions.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setMobileFiltersOpen(true)}
            className="lg:hidden inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FFFDF9] border border-[#E5CEB6] text-sm font-semibold text-[#3D160F] cursor-pointer"
          >
            <SlidersHorizontal className="w-4 h-4 text-[#D96532]" />
            <span>Filters</span>
          </button>

          <select
            aria-label="Sort products"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="px-3.5 py-2 rounded-xl bg-[#FFFDF9] border border-[#E5CEB6] text-sm font-medium text-[#3D160F] focus:outline-none focus:border-[#D96532] cursor-pointer"
          >
            <option value="featured">Sort: Featured</option>
            <option value="newest">Sort: Newest</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="rating">Top Rated</option>
          </select>
        </div>
      </div>

      {/* Main Grid */}
      <div className="mt-6 flex gap-6 items-start">
        {/* Desktop Filter Sidebar */}
        <aside className="hidden lg:block w-64 shrink-0 rounded-2xl bg-[#FFFDF9] border border-[#EFE0CE] p-5 sticky top-24">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#F2E5D6]">
            <h2 className="font-sans text-sm font-bold text-[#3D160F] flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-[#D96532]" />
              <span>Filters</span>
            </h2>
            <span className="text-xs text-[#8E6453] tabular-nums">
              {filteredProducts.length} results
            </span>
          </div>
          {filterPanel}
        </aside>

        {/* Product Results */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-4 text-xs sm:text-sm text-[#724A3E]">
            <p className="tabular-nums">
              Showing <strong className="text-[#3D160F]">{filteredProducts.length}</strong> of{' '}
              {products.length} products
              {selectedSeries !== 'all' ? ` in ${selectedSeries}` : ''}
              {isSearchingDb ? ' · Searching database...' : ''}
            </p>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="text-xs font-semibold text-[#D96532] hover:underline cursor-pointer"
              >
                Clear filters
              </button>
            )}
          </div>

          {usedFuzzySearch && suggestedTerm && filteredProducts.length > 0 && (
            <div className="mb-4 px-4 py-2.5 rounded-xl bg-[#F7E5CE]/70 border border-[#E7D2BC] text-xs sm:text-sm text-[#5A3224] flex flex-wrap items-center justify-between gap-2">
              <span>
                No exact match for &ldquo;<strong>{query.trim()}</strong>&rdquo;. Showing closest results for{' '}
                <button
                  type="button"
                  onClick={() => handleSearchChange(suggestedTerm)}
                  className="font-bold text-[#D96532] underline cursor-pointer"
                >
                  {suggestedTerm}
                </button>
                .
              </span>
            </div>
          )}

          {filteredProducts.length === 0 ? (
            <div className="rounded-2xl bg-[#FFFDF9] border border-[#EFE0CE] p-12 text-center">
              <p className="font-display text-2xl font-bold text-[#3D160F]">No matching items found</p>
              <p className="mt-2 text-sm text-[#724A3E] max-w-md mx-auto">
                Try adjusting your price range, clearing the search term, or browsing another anime series.
              </p>
              <button
                type="button"
                onClick={resetFilters}
                className="mt-5 px-6 py-2.5 rounded-full bg-[#D96532] hover:bg-[#BF5223] text-white text-sm font-semibold cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3.5 sm:gap-5">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile / Tablet Filter Drawer */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex justify-end">
          <div
            className="fixed inset-0 bg-[#3D160F]/45 backdrop-blur-[2px]"
            onClick={() => setMobileFiltersOpen(false)}
          />
          <div className="relative z-10 w-80 max-w-[90vw] bg-[#FFFDF9] h-full overflow-y-auto p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-4 mb-5 border-b border-[#EFE0CE]">
              <h2 className="font-display text-lg font-bold text-[#3D160F]">Filter Products</h2>
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                className="p-1.5 rounded-lg text-[#5E3224] hover:bg-[#F7DCC3]/50 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {filterPanel}
            <button
              type="button"
              onClick={() => setMobileFiltersOpen(false)}
              className="mt-6 w-full py-2.5 rounded-xl bg-[#D96532] text-white text-sm font-semibold cursor-pointer"
            >
              Show {filteredProducts.length} Products
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
