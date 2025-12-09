import { useState, useEffect, useCallback, FormEvent, ChangeEvent } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

interface UseCase {
  id: number;
  useCase: string;
  conceptDescription: string;
  concreteImplementation: string | null;
  benefit: string | null;
  industry: string | null;
  department: string | null;
  valueChainStep: string | null;
  url: string | null;
  createdAt: string;
  updatedAt: string;
}

interface PaginatedResponse {
  data: UseCase[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  filters: {
    industry: string | null;
    valueChainStep: string | null;
    department: string | null;
    search: string | null;
  };
}

interface FilterOptions {
  industries: string[];
  valueChainSteps: string[];
  departments: string[];
}

interface FormData {
  useCase: string;
  conceptDescription: string;
  concreteImplementation: string;
  benefit: string;
  industry: string;
  department: string;
  valueChainStep: string;
  url: string;
}

interface FormErrors {
  useCase?: string;
  conceptDescription?: string;
  url?: string;
  general?: string;
}

// =============================================================================
// API CONFIGURATION
// =============================================================================

const API_BASE_URL = '/api';

// =============================================================================
// LOADING SPINNER COMPONENT
// =============================================================================

const LoadingSpinner = ({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-3',
  };

  return (
    <div className="flex items-center justify-center">
      <div
        className={`${sizeClasses[size]} border-ommax-black border-t-transparent rounded-full animate-spin`}
        role="status"
        aria-label="Loading"
      />
    </div>
  );
};

// =============================================================================
// ERROR BANNER COMPONENT
// =============================================================================

const ErrorBanner = ({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) => {
  return (
    <div className="error-banner flex items-center justify-between animate-fade-in">
      <div className="flex items-center gap-3">
        <svg
          className="w-5 h-5 text-ommax-red flex-shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="square"
            strokeLinejoin="miter"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        <span className="font-medium">{message}</span>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-ommax-red font-semibold text-sm uppercase tracking-wider hover:underline"
        >
          Retry
        </button>
      )}
    </div>
  );
};

// =============================================================================
// NAVBAR COMPONENT
// =============================================================================

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-ommax-deep-blue border-b border-ommax-navy">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className="flex items-center">
              <span className="text-white text-2xl font-bold tracking-tight">
                OMM
              </span>
              <span className="text-ommax-red text-2xl font-bold tracking-tight">
                /
              </span>
              <span className="text-white text-2xl font-bold tracking-tight">
                \X
              </span>
            </div>
            <div className="hidden sm:block h-6 w-px bg-ommax-navy" />
            <span className="hidden sm:block text-white/80 text-sm font-medium tracking-wide">
              Use Case Library
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-1">
            <Link
              to="/explore"
              className="px-4 py-2 text-white/90 text-sm font-medium tracking-wide hover:text-white transition-colors"
            >
              Explore
            </Link>
            <Link
              to="/add"
              className="ml-2 px-4 py-2 bg-ommax-red text-white text-sm font-semibold uppercase tracking-wider hover:bg-ommax-red-dark transition-colors"
            >
              Add New
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

// =============================================================================
// LAYOUT COMPONENT
// =============================================================================

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-ommax-off-white">
      <Navbar />
      <main className="pt-16">{children}</main>
      <footer className="border-t border-ommax-border-gray bg-white py-8 mt-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-ommax-black font-bold">OMM</span>
              <span className="text-ommax-red font-bold">/</span>
              <span className="text-ommax-black font-bold">\X</span>
            </div>
            <p className="text-ommax-light-gray text-sm">
              &copy; {new Date().getFullYear()} OMMAX. Building Digital Leaders.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

// =============================================================================
// USE CASE CARD COMPONENT
// =============================================================================

const UseCaseCard = ({
  useCase,
  index,
}: {
  useCase: UseCase;
  index: number;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <article
      className="card p-6 animate-slide-up"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <h3 className="text-lg font-bold text-ommax-black leading-tight">
          {useCase.useCase}
        </h3>
        {useCase.industry && (
          <span className="flex-shrink-0 px-2 py-1 bg-ommax-light-bg text-ommax-medium-gray text-xs font-semibold uppercase tracking-wider">
            {useCase.industry}
          </span>
        )}
      </div>

      {/* Meta Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        {useCase.valueChainStep && (
          <span className="px-2 py-1 border border-ommax-border-gray text-ommax-light-gray text-xs font-medium">
            {useCase.valueChainStep}
          </span>
        )}
        {useCase.department && (
          <span className="px-2 py-1 border border-ommax-border-gray text-ommax-light-gray text-xs font-medium">
            {useCase.department}
          </span>
        )}
      </div>

      {/* Description */}
      <p
        className={`text-ommax-medium-gray text-sm leading-relaxed mb-4 ${
          !isExpanded ? 'line-clamp-3' : ''
        }`}
      >
        {useCase.conceptDescription}
      </p>

      {/* Expandable Content */}
      {isExpanded && (
        <div className="space-y-4 pt-4 border-t border-ommax-border-gray animate-fade-in">
          {useCase.concreteImplementation && (
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-ommax-light-gray mb-2">
                Implementation
              </h4>
              <p className="text-ommax-medium-gray text-sm leading-relaxed">
                {useCase.concreteImplementation}
              </p>
            </div>
          )}
          {useCase.benefit && (
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-ommax-light-gray mb-2">
                Benefits
              </h4>
              <p className="text-ommax-medium-gray text-sm leading-relaxed">
                {useCase.benefit}
              </p>
            </div>
          )}
          {useCase.url && (
            <div>
              <a
                href={useCase.url.startsWith('http') ? useCase.url : `https://${useCase.url}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-ommax-red text-sm font-semibold hover:underline"
              >
                Learn More
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="square"
                    strokeLinejoin="miter"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>
            </div>
          )}
        </div>
      )}

      {/* Expand/Collapse Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="mt-4 text-ommax-black text-sm font-semibold uppercase tracking-wider flex items-center gap-1 hover:text-ommax-red transition-colors"
      >
        {isExpanded ? 'Show Less' : 'View Details'}
        <svg
          className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="square"
            strokeLinejoin="miter"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
    </article>
  );
};

// =============================================================================
// FILTER DROPDOWN COMPONENT
// =============================================================================

const FilterDropdown = ({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) => {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold uppercase tracking-wider text-ommax-light-gray">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input-field py-2 text-sm cursor-pointer"
      >
        <option value="">All</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
};

// =============================================================================
// PAGINATION COMPONENT
// =============================================================================

const Pagination = ({
  pagination,
  onPageChange,
}: {
  pagination: PaginatedResponse['pagination'];
  onPageChange: (page: number) => void;
}) => {
  const { page, totalPages, hasNext, hasPrev, total } = pagination;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-6 border-t border-ommax-border-gray">
      <p className="text-ommax-light-gray text-sm">
        Showing page <span className="font-semibold text-ommax-black">{page}</span> of{' '}
        <span className="font-semibold text-ommax-black">{totalPages}</span> ({total} total)
      </p>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={!hasPrev}
          className="px-4 py-2 border border-ommax-border-gray text-sm font-semibold text-ommax-black disabled:opacity-40 disabled:cursor-not-allowed hover:border-ommax-black transition-colors"
        >
          Previous
        </button>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={!hasNext}
          className="px-4 py-2 border border-ommax-border-gray text-sm font-semibold text-ommax-black disabled:opacity-40 disabled:cursor-not-allowed hover:border-ommax-black transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  );
};

// =============================================================================
// LANDING PAGE
// =============================================================================

const LandingPage = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<{ total: number } | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/use-cases?limit=1`);
        if (response.ok) {
          const data = (await response.json()) as PaginatedResponse;
          setStats({ total: data.pagination.total });
        }
      } catch {
        // Silently fail - stats are optional
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <section className="relative bg-ommax-deep-blue overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `linear-gradient(45deg, #E30613 25%, transparent 25%), linear-gradient(-45deg, #E30613 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #E30613 75%), linear-gradient(-45deg, transparent 75%, #E30613 75%)`,
            backgroundSize: '60px 60px',
            backgroundPosition: '0 0, 0 30px, 30px -30px, -30px 0px',
          }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-24 lg:py-32">
          <div className="max-w-3xl">
            <p className="text-[#00D4AA] font-semibold text-sm uppercase tracking-widest mb-4 animate-fade-in">
              Building Digital Leaders
            </p>
            <h1 className="text-display-lg lg:text-display-xl text-white mb-6 animate-slide-up">
              Your <span className="font-extrabold">end-to-end consulting partner</span>: From strategy to AI-powered value creation
            </h1>
            <p className="text-white/80 text-lg lg:text-xl leading-relaxed mb-10 max-w-2xl animate-slide-up" style={{ animationDelay: '100ms' }}>
              Explore our comprehensive Use Case Library. Discover proven digital 
              transformation solutions across industries—from concept to implementation.
            </p>
            
            <div className="flex flex-wrap gap-4 animate-slide-up" style={{ animationDelay: '200ms' }}>
              <button
                onClick={() => navigate('/explore')}
                className="inline-flex items-center justify-center px-6 py-3 bg-[#00D4AA] text-ommax-deep-blue font-semibold text-sm uppercase tracking-wider hover:bg-[#00E5BB] transition-colors"
              >
                Explore Use Cases
              </button>
              <button
                onClick={() => navigate('/add')}
                className="btn-secondary bg-transparent text-white border-white hover:bg-white hover:text-ommax-deep-blue"
              >
                Add New Use Case
              </button>
            </div>

            {stats && (
              <div className="mt-12 pt-8 border-t border-white/20 animate-fade-in" style={{ animationDelay: '400ms' }}>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold text-white">{stats.total}</span>
                  <span className="text-white/60 text-lg">use cases catalogued</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-display-md text-ommax-black mb-4">
              Strategic Digital Solutions
            </h2>
            <p className="text-ommax-light-gray text-lg max-w-2xl mx-auto">
              Leverage our curated library of proven use cases to accelerate your digital transformation journey.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'Industry-Specific',
                description: 'Use cases tailored to your industry vertical, from manufacturing to financial services.',
                icon: (
                  <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                ),
              },
              {
                title: 'Value Chain Coverage',
                description: 'End-to-end solutions spanning the entire value chain from procurement to customer service.',
                icon: (
                  <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                ),
              },
              {
                title: 'Measurable Impact',
                description: 'Each use case includes quantifiable benefits and implementation guidelines.',
                icon: (
                  <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                ),
              },
            ].map((feature, index) => (
              <div
                key={feature.title}
                className="group p-8 border border-ommax-border-gray hover:border-ommax-black transition-all duration-300"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-12 h-12 bg-ommax-light-bg flex items-center justify-center mb-6 group-hover:bg-ommax-red transition-colors">
                  <svg
                    className="w-6 h-6 text-ommax-black group-hover:text-white transition-colors"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    {feature.icon}
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-ommax-black mb-3">
                  {feature.title}
                </h3>
                <p className="text-ommax-light-gray leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

// =============================================================================
// EXPLORE PAGE
// =============================================================================

const ExplorePage = () => {
  const [useCases, setUseCases] = useState<UseCase[]>([]);
  const [pagination, setPagination] = useState<PaginatedResponse['pagination'] | null>(null);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    industries: [],
    valueChainSteps: [],
    departments: [],
  });
  const [selectedIndustry, setSelectedIndustry] = useState('');
  const [selectedValueChainStep, setSelectedValueChainStep] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchFilterOptions = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/use-cases/filters`);
      if (response.ok) {
        const data = (await response.json()) as FilterOptions;
        setFilterOptions(data);
      }
    } catch {
      // Silently fail - filters are optional enhancement
    }
  }, []);

  const fetchUseCases = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.set('page', currentPage.toString());
      params.set('limit', '12');
      if (selectedIndustry) params.set('industry', selectedIndustry);
      if (selectedValueChainStep) params.set('valueChainStep', selectedValueChainStep);
      if (searchQuery) params.set('search', searchQuery);

      const response = await fetch(`${API_BASE_URL}/use-cases?${params.toString()}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch use cases: ${response.statusText}`);
      }

      const data = (await response.json()) as PaginatedResponse;
      setUseCases(data.data);
      setPagination(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, selectedIndustry, selectedValueChainStep, searchQuery]);

  useEffect(() => {
    fetchFilterOptions();
  }, [fetchFilterOptions]);

  useEffect(() => {
    fetchUseCases();
  }, [fetchUseCases]);

  const handleFilterChange = (filter: 'industry' | 'valueChainStep', value: string) => {
    setCurrentPage(1);
    if (filter === 'industry') {
      setSelectedIndustry(value);
    } else {
      setSelectedValueChainStep(value);
    }
  };

  const handleSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchUseCases();
  };

  const clearFilters = () => {
    setSelectedIndustry('');
    setSelectedValueChainStep('');
    setSearchQuery('');
    setCurrentPage(1);
  };

  const hasActiveFilters = selectedIndustry || selectedValueChainStep || searchQuery;

  return (
    <div className="min-h-[calc(100vh-4rem)] py-12">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-display-md text-ommax-black mb-2">Explore Use Cases</h1>
          <p className="text-ommax-light-gray text-lg">
            Browse and filter our comprehensive library of digital transformation use cases.
          </p>
        </div>

        {/* Search & Filters */}
        <div className="bg-white border border-ommax-border-gray p-6 mb-8">
          <form onSubmit={handleSearch} className="mb-6">
            <div className="flex gap-3">
              <div className="flex-1">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search use cases..."
                  className="input-field"
                />
              </div>
              <button type="submit" className="btn-primary">
                Search
              </button>
            </div>
          </form>

          <div className="flex flex-wrap items-end gap-4">
            <FilterDropdown
              label="Industry"
              value={selectedIndustry}
              options={filterOptions.industries}
              onChange={(value) => handleFilterChange('industry', value)}
            />
            <FilterDropdown
              label="Value Chain Step"
              value={selectedValueChainStep}
              options={filterOptions.valueChainSteps}
              onChange={(value) => handleFilterChange('valueChainStep', value)}
            />
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-ommax-red text-sm font-semibold uppercase tracking-wider hover:underline"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-8">
            <ErrorBanner message={error} onRetry={fetchUseCases} />
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <LoadingSpinner size="lg" />
              <p className="mt-4 text-ommax-light-gray">Loading use cases...</p>
            </div>
          </div>
        )}

        {/* Results */}
        {!isLoading && !error && (
          <>
            {useCases.length === 0 ? (
              <div className="text-center py-20 border border-ommax-border-gray bg-white">
                <svg
                  className="w-16 h-16 text-ommax-border-gray mx-auto mb-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="square"
                    strokeLinejoin="miter"
                    strokeWidth={1.5}
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <h3 className="text-xl font-bold text-ommax-black mb-2">No use cases found</h3>
                <p className="text-ommax-light-gray mb-6">
                  Try adjusting your filters or search query.
                </p>
                {hasActiveFilters && (
                  <button onClick={clearFilters} className="btn-secondary">
                    Clear All Filters
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {useCases.map((useCase, index) => (
                    <UseCaseCard key={useCase.id} useCase={useCase} index={index} />
                  ))}
                </div>

                {pagination && pagination.totalPages > 1 && (
                  <Pagination
                    pagination={pagination}
                    onPageChange={(page) => setCurrentPage(page)}
                  />
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

// =============================================================================
// ADD USE CASE PAGE
// =============================================================================

const AddUseCasePage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    useCase: '',
    conceptDescription: '',
    concreteImplementation: '',
    benefit: '',
    industry: '',
    department: '',
    valueChainStep: '',
    url: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.useCase.trim()) {
      newErrors.useCase = 'Use case name is required';
    } else if (formData.useCase.trim().length < 3) {
      newErrors.useCase = 'Use case name must be at least 3 characters';
    }

    if (!formData.conceptDescription.trim()) {
      newErrors.conceptDescription = 'Concept description is required';
    } else if (formData.conceptDescription.trim().length < 10) {
      newErrors.conceptDescription = 'Description must be at least 10 characters';
    }

    if (formData.url.trim()) {
      const urlRegex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/i;
      if (!urlRegex.test(formData.url.trim())) {
        newErrors.url = 'Please enter a valid URL';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const response = await fetch(`${API_BASE_URL}/use-cases`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': 'demo-api-key', // In production, this would come from auth
        },
        body: JSON.stringify({
          useCase: formData.useCase.trim(),
          conceptDescription: formData.conceptDescription.trim(),
          concreteImplementation: formData.concreteImplementation.trim() || undefined,
          benefit: formData.benefit.trim() || undefined,
          industry: formData.industry.trim() || undefined,
          department: formData.department.trim() || undefined,
          valueChainStep: formData.valueChainStep.trim() || undefined,
          url: formData.url.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json() as { error?: string };
        throw new Error(errorData.error ?? 'Failed to create use case');
      }

      setSubmitSuccess(true);
      setTimeout(() => {
        navigate('/explore');
      }, 2000);
    } catch (err) {
      setErrors({
        general: err instanceof Error ? err.message : 'An unexpected error occurred',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12">
        <div className="text-center animate-fade-in">
          <div className="w-16 h-16 bg-ommax-red mx-auto mb-6 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="square"
                strokeLinejoin="miter"
                strokeWidth={3}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-display-sm text-ommax-black mb-2">Use Case Created!</h2>
          <p className="text-ommax-light-gray">Redirecting to explore page...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] py-12">
      <div className="max-w-3xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-display-md text-ommax-black mb-2">Add New Use Case</h1>
          <p className="text-ommax-light-gray text-lg">
            Contribute to our library by adding a new digital transformation use case.
          </p>
        </div>

        {/* Error Banner */}
        {errors.general && (
          <div className="mb-8">
            <ErrorBanner message={errors.general} />
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white border border-ommax-border-gray p-8">
          <div className="space-y-6">
            {/* Use Case Name */}
            <div>
              <label
                htmlFor="useCase"
                className="block text-sm font-semibold uppercase tracking-wider text-ommax-black mb-2"
              >
                Use Case Name <span className="text-ommax-red">*</span>
              </label>
              <input
                type="text"
                id="useCase"
                name="useCase"
                value={formData.useCase}
                onChange={handleChange}
                className={`input-field ${errors.useCase ? 'border-ommax-red' : ''}`}
                placeholder="e.g., Predictive Maintenance for Manufacturing"
              />
              {errors.useCase && (
                <p className="mt-1 text-sm text-ommax-red">{errors.useCase}</p>
              )}
            </div>

            {/* Concept Description */}
            <div>
              <label
                htmlFor="conceptDescription"
                className="block text-sm font-semibold uppercase tracking-wider text-ommax-black mb-2"
              >
                Concept Description <span className="text-ommax-red">*</span>
              </label>
              <textarea
                id="conceptDescription"
                name="conceptDescription"
                value={formData.conceptDescription}
                onChange={handleChange}
                rows={4}
                className={`input-field resize-y ${errors.conceptDescription ? 'border-ommax-red' : ''}`}
                placeholder="Describe the core concept and approach..."
              />
              {errors.conceptDescription && (
                <p className="mt-1 text-sm text-ommax-red">{errors.conceptDescription}</p>
              )}
            </div>

            {/* Concrete Implementation */}
            <div>
              <label
                htmlFor="concreteImplementation"
                className="block text-sm font-semibold uppercase tracking-wider text-ommax-black mb-2"
              >
                Concrete Implementation
              </label>
              <textarea
                id="concreteImplementation"
                name="concreteImplementation"
                value={formData.concreteImplementation}
                onChange={handleChange}
                rows={3}
                className="input-field resize-y"
                placeholder="Describe specific implementation details..."
              />
            </div>

            {/* Benefits */}
            <div>
              <label
                htmlFor="benefit"
                className="block text-sm font-semibold uppercase tracking-wider text-ommax-black mb-2"
              >
                Benefits
              </label>
              <textarea
                id="benefit"
                name="benefit"
                value={formData.benefit}
                onChange={handleChange}
                rows={2}
                className="input-field resize-y"
                placeholder="Describe the key benefits and value..."
              />
            </div>

            {/* Industry & Department Row */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="industry"
                  className="block text-sm font-semibold uppercase tracking-wider text-ommax-black mb-2"
                >
                  Industry
                </label>
                <input
                  type="text"
                  id="industry"
                  name="industry"
                  value={formData.industry}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="e.g., Manufacturing"
                />
              </div>
              <div>
                <label
                  htmlFor="department"
                  className="block text-sm font-semibold uppercase tracking-wider text-ommax-black mb-2"
                >
                  Department
                </label>
                <input
                  type="text"
                  id="department"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="e.g., Operations"
                />
              </div>
            </div>

            {/* Value Chain Step */}
            <div>
              <label
                htmlFor="valueChainStep"
                className="block text-sm font-semibold uppercase tracking-wider text-ommax-black mb-2"
              >
                Value Chain Step
              </label>
              <input
                type="text"
                id="valueChainStep"
                name="valueChainStep"
                value={formData.valueChainStep}
                onChange={handleChange}
                className="input-field"
                placeholder="e.g., Production, Logistics, Customer Service"
              />
            </div>

            {/* URL */}
            <div>
              <label
                htmlFor="url"
                className="block text-sm font-semibold uppercase tracking-wider text-ommax-black mb-2"
              >
                Reference URL
              </label>
              <input
                type="text"
                id="url"
                name="url"
                value={formData.url}
                onChange={handleChange}
                className={`input-field ${errors.url ? 'border-ommax-red' : ''}`}
                placeholder="https://example.com/case-study"
              />
              {errors.url && (
                <p className="mt-1 text-sm text-ommax-red">{errors.url}</p>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-10 pt-6 border-t border-ommax-border-gray flex items-center justify-between">
            <button
              type="button"
              onClick={() => navigate('/explore')}
              className="text-ommax-light-gray font-semibold text-sm uppercase tracking-wider hover:text-ommax-black transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary min-w-[200px]"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <LoadingSpinner size="sm" />
                  Submitting...
                </span>
              ) : (
                'Create Use Case'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// =============================================================================
// 404 PAGE
// =============================================================================

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12">
      <div className="text-center">
        <h1 className="text-display-xl text-ommax-black mb-4">404</h1>
        <p className="text-ommax-light-gray text-xl mb-8">Page not found</p>
        <button onClick={() => navigate('/')} className="btn-primary">
          Return Home
        </button>
      </div>
    </div>
  );
};

// =============================================================================
// MAIN APP COMPONENT
// =============================================================================

const App = () => {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/add" element={<AddUseCasePage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
};

export default App;

