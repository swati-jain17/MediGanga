import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Search, Filter, X } from 'lucide-react';
import { medicinesApi } from '../services/api';
import { MedicineCard } from '../components/medicine/MedicineCard';
import type { ScheduleType } from '../types';

export function SearchPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const query = searchParams.get('q') || '';
    const category = searchParams.get('category') || '';
    const [searchInput, setSearchInput] = useState(query);
    const [showFilters, setShowFilters] = useState(false);

    // Filters
    const [scheduleFilter, setScheduleFilter] = useState<ScheduleType | ''>('');
    const [page, setPage] = useState(1);

    const { data, isLoading, isFetching } = useQuery({
        queryKey: ['medicines', 'search', query, category, scheduleFilter, page],
        queryFn: async () => {
            const res = await medicinesApi.search({
                query: query.trim() || undefined,
                page,
                limit: 20,
                schedule_type: scheduleFilter || undefined,
                category: category || undefined,
            });
            return res.data;
        },
        enabled: true,
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchInput.trim()) {
            setSearchParams({ q: searchInput.trim() });
            setPage(1);
        }
    };

    const clearFilters = () => {
        setScheduleFilter('');
        setPage(1);
    };

    const hasActiveFilters = !!scheduleFilter;

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="mb-6">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={22} />
                    <input
                        type="text"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        placeholder="Search medicines, health products..."
                        className="w-full pl-12 pr-4 py-4 rounded-xl bg-white border-2 border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 transition text-lg card-shadow"
                    />
                    <button
                        type="button"
                        onClick={() => setShowFilters(!showFilters)}
                        className={`absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-lg transition ${hasActiveFilters ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-600'
                            }`}
                    >
                        <Filter size={20} />
                    </button>
                </div>
            </form>

            {/* Filters Panel */}
            {showFilters && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-white rounded-xl p-4 mb-6 card-shadow"
                >
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-gray-900">Filters</h3>
                        {hasActiveFilters && (
                            <button onClick={clearFilters} className="text-sm text-primary-600 hover:text-primary-700">
                                Clear all
                            </button>
                        )}
                    </div>

                    <div className="flex flex-wrap gap-4">
                        {/* Schedule Type */}
                        <div>
                            <label className="text-sm text-gray-600 block mb-1.5">Medicine Type</label>
                            <div className="flex gap-2">
                                {(['OTC', 'H', 'X'] as ScheduleType[]).map((type) => (
                                    <button
                                        key={type}
                                        onClick={() => setScheduleFilter(scheduleFilter === type ? '' : type)}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition ${scheduleFilter === type
                                            ? type === 'OTC'
                                                ? 'bg-teal-500 text-white'
                                                : type === 'H'
                                                    ? 'bg-saffron-500 text-white'
                                                    : 'bg-coral-500 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                    >
                                        {type === 'OTC' ? 'Over the Counter' : type === 'H' ? 'Prescription (H)' : 'Schedule X'}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        {isLoading ? 'Searching...' :
                            category && !query ? `Category: ${category}` :
                                query ? `Results for "${query}"` :
                                    'All Medicines'}
                    </h1>
                    {data?.pagination && (
                        <p className="text-gray-500 text-sm mt-1">
                            {data.pagination.total} products found
                        </p>
                    )}
                </div>

                {/* Active filter tags */}
                {hasActiveFilters && (
                    <div className="flex gap-2">
                        {scheduleFilter && (
                            <span className="inline-flex items-center gap-1 bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm">
                                {scheduleFilter}
                                <button onClick={() => setScheduleFilter('')}><X size={14} /></button>
                            </span>
                        )}
                    </div>
                )}
            </div>

            {/* Loading State */}
            {(isLoading || isFetching) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="bg-white rounded-2xl overflow-hidden card-shadow">
                            <div className="aspect-square skeleton" />
                            <div className="p-4 space-y-3">
                                <div className="h-4 skeleton rounded w-3/4" />
                                <div className="h-3 skeleton rounded w-1/2" />
                                <div className="h-5 skeleton rounded w-1/3" />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Results Grid */}
            {!isLoading && data?.data && data.data.length > 0 && (
                <>
                    <motion.div
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
                        initial="hidden"
                        animate="visible"
                        variants={{
                            visible: { transition: { staggerChildren: 0.05 } }
                        }}
                    >
                        {data.data.map((medicine: any) => (
                            <motion.div
                                key={medicine.id}
                                variants={{
                                    hidden: { opacity: 0, y: 20 },
                                    visible: { opacity: 1, y: 0 }
                                }}
                            >
                                <MedicineCard medicine={medicine} />
                            </motion.div>
                        ))}
                    </motion.div>

                    {/* Pagination */}
                    {data.pagination.totalPages > 1 && (
                        <div className="flex justify-center gap-2 mt-8">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
                            >
                                Previous
                            </button>
                            <span className="px-4 py-2 text-gray-600">
                                Page {page} of {data.pagination.totalPages}
                            </span>
                            <button
                                onClick={() => setPage(p => Math.min(data.pagination.totalPages, p + 1))}
                                disabled={page === data.pagination.totalPages}
                                className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </>
            )}

            {/* Empty State */}
            {!isLoading && (query || category) && (!data?.data || data.data.length === 0) && (
                <div className="text-center py-16">
                    <div className="w-20 h-20 bg-gray-100 rounded-full mx-auto flex items-center justify-center mb-4">
                        <Search size={32} className="text-gray-400" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">No results found</h2>
                    <p className="text-gray-500">Try adjusting your search or filters</p>
                </div>
            )}

            {/* No Products at all state */}
            {!isLoading && !query && !category && (!data?.data || data.data.length === 0) && (
                <div className="text-center py-16">
                    <div className="w-20 h-20 bg-primary-100 rounded-full mx-auto flex items-center justify-center mb-4">
                        <Search size={32} className="text-primary-500" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">No medicines available</h2>
                    <p className="text-gray-500">We're updating our stock. Please check back soon!</p>
                </div>
            )}
        </div>
    );
}
