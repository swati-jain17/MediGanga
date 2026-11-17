import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Trash2, Search, Filter } from 'lucide-react';
import api from '../../services/api';
import { useToastStore } from '../../store/toastStore';

interface Review {
    id: string;
    user_name: string;
    user_email: string;
    rating: number;
    comment: string;
    status: string;
    created_at: string;
}

export const ReviewsPage: React.FC = () => {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [ratingFilter, setRatingFilter] = useState<number | 'all'>('all');
    const addToast = useToastStore((state) => state.addToast);

    const fetchReviews = async () => {
        try {
            const response = await api.get('/admin/reviews');
            setReviews(response.data.data);
        } catch (error) {
            console.error('Failed to fetch reviews:', error);
            addToast('Failed to load reviews', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, []);

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this review?')) return;

        try {
            await api.delete(`/admin/reviews/${id}`);
            addToast('Review deleted successfully', 'success');
            setReviews(reviews.filter(r => r.id !== id));
        } catch (error) {
            console.error('Delete review error:', error);
            addToast('Failed to delete review', 'error');
        }
    };

    const filteredReviews = reviews.filter(review => {
        const matchesSearch =
            review.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            review.comment?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesRating = ratingFilter === 'all' || review.rating === ratingFilter;

        return matchesSearch && matchesRating;
    });

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">User Reviews</h1>
                    <p className="text-gray-500">Manage customer feedback and ratings</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search by user or comment..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>
                <div className="relative w-48">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <select
                        value={ratingFilter}
                        onChange={(e) => setRatingFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                    >
                        <option value="all">All Ratings</option>
                        <option value="5">5 Stars</option>
                        <option value="4">4 Stars</option>
                        <option value="3">3 Stars</option>
                        <option value="2">2 Stars</option>
                        <option value="1">1 Star</option>
                    </select>
                </div>
            </div>

            {/* Reviews List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {isLoading ? (
                    <div className="p-8 text-center text-gray-500">Loading reviews...</div>
                ) : filteredReviews.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">No reviews found matching your criteria.</div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {filteredReviews.map((review) => (
                            <motion.div
                                key={review.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="p-6 hover:bg-gray-50 transition-colors"
                            >
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="font-semibold text-gray-900">{review.user_name}</span>
                                            <span className="text-sm text-gray-500">{review.user_email}</span>
                                            <span className="text-xs text-gray-400">• {new Date(review.created_at).toLocaleDateString()}</span>
                                        </div>

                                        <div className="flex items-center text-yellow-400 mb-2">
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    className={`w-4 h-4 ${i < review.rating ? 'fill-current' : 'text-gray-300'}`}
                                                />
                                            ))}
                                        </div>

                                        <p className="text-gray-600">{review.comment}</p>
                                    </div>

                                    <button
                                        onClick={() => handleDelete(review.id)}
                                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors ml-4"
                                        title="Delete Review"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
