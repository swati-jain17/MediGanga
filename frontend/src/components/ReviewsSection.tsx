import React, { useEffect, useState } from 'react';
import { Star, MessageSquareQuote } from 'lucide-react';
import api from '../services/api';
import { ReviewModal } from './ReviewModal';
import { useAuthStore } from '../store/authStore';
import { useToastStore } from '../store/toastStore';

interface Review {
    id: string;
    user_name: string;
    profile_picture?: string;
    rating: number;
    comment: string;
    created_at: string;
}

export const ReviewsSection: React.FC = () => {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { isAuthenticated } = useAuthStore();
    const addToast = useToastStore((state) => state.addToast);

    const fetchReviews = async () => {
        try {
            const response = await api.get('/reviews');
            if (response.data && Array.isArray(response.data.data)) {
                setReviews(response.data.data);
            } else {
                setReviews([]);
            }
        } catch (error) {
            console.error('Failed to fetch reviews:', error);
            setReviews([]);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, []);

    const handleWriteReview = () => {
        if (!isAuthenticated) {
            addToast('Please login to write a review', 'error');
            return;
        }
        setIsModalOpen(true);
    };

    return (
        <section className="py-16 bg-gradient-to-br from-blue-50 to-indigo-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row justify-between items-center mb-12">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">
                            What Our Users Say
                        </h2>
                        <p className="text-lg text-gray-600 max-w-2xl">
                            Trusted by thousands of happy customers for their healthcare needs.
                        </p>
                    </div>
                    <button
                        onClick={handleWriteReview}
                        className="mt-6 md:mt-0 px-8 py-3 bg-white text-blue-600 font-semibold rounded-xl shadow-lg border border-blue-100 hover:bg-blue-50 transition-all flex items-center"
                    >
                        <Star className="w-5 h-5 mr-2" />
                        Write a Review
                    </button>
                </div>

                {(!reviews || reviews.length === 0) ? (
                    <div className="text-center py-12 bg-white rounded-2xl border border-gray-100 shadow-sm">
                        <MessageSquareQuote className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">No reviews yet. Be the first to share your experience!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {(reviews || []).map((review) => (
                            <div
                                key={review.id}
                                className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100"
                            >
                                <div className="flex items-center mb-4">
                                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold overflow-hidden">
                                        {review.profile_picture ? (
                                            <img src={review.profile_picture} alt={review.user_name} className="w-full h-full object-cover" />
                                        ) : (
                                            review.user_name?.charAt(0) || 'U'
                                        )}
                                    </div>
                                    <div className="ml-3">
                                        <h3 className="font-semibold text-gray-900">{review.user_name || 'Anonymous User'}</h3>
                                        <div className="flex items-center text-sm text-gray-500">
                                            <div className="flex text-yellow-400 mr-2">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        className={`w-3 h-3 ${i < review.rating ? 'fill-current' : 'text-gray-300'}`}
                                                    />
                                                ))}
                                            </div>
                                            <span>• {new Date(review.created_at).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>
                                <p className="text-gray-600 leading-relaxed italic">
                                    "{review.comment}"
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <ReviewModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchReviews}
            />
        </section>
    );
};
