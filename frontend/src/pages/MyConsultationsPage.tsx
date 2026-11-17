import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useToastStore } from '../store/toastStore';
import { Video, Calendar, Clock, User, ChevronRight, XCircle } from 'lucide-react';
import { consultationsApi } from '../services/api';
import type { Consultation } from '../types';

export default function MyConsultationsPage() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { addToast } = useToastStore();
    const [filter, setFilter] = useState<'upcoming' | 'past'>('upcoming');

    const { data: consultations, isLoading } = useQuery<Consultation[]>({
        queryKey: ['my-consultations', filter],
        queryFn: async () => {
            const res = await consultationsApi.getMyConsultations();
            return res.data.data || [];
        }
    });

    const upcomingConsultations = consultations?.filter((c) =>
        ['scheduled', 'in_progress'].includes(c.status)
    ) || [];

    const pastConsultations = consultations?.filter((c) =>
        ['completed', 'cancelled', 'no_show'].includes(c.status)
    ) || [];

    const displayList = filter === 'upcoming' ? upcomingConsultations : pastConsultations;

    const handleJoinClick = (id: string, _scheduledAt: string) => {
        // Allow joining for testing purposes
        navigate(`/consultations/video/${id}`);
    };

    const handleCancel = async (id: string) => {
        if (!window.confirm('Are you sure you want to cancel this consultation?')) return;

        try {
            await consultationsApi.cancel(id);
            addToast('Consultation cancelled successfully');
            queryClient.invalidateQueries({ queryKey: ['my-consultations'] });
        } catch (error) {
            console.error(error);
            addToast('Failed to cancel consultation', 'error');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            {/* Header */}
            <div className="bg-white p-4 sticky top-0 z-10 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate('/profile')} className="p-2 hover:bg-gray-100 rounded-full">
                        <ChevronRight className="rotate-180" size={24} />
                    </button>
                    <h1 className="text-xl font-bold">My Consultations</h1>
                </div>
                <button
                    onClick={() => navigate('/doctors')}
                    className="text-primary-600 font-medium text-sm bg-primary-50 px-3 py-1.5 rounded-full"
                >
                    + Book New
                </button>
            </div>

            <div className="max-w-xl mx-auto p-4">
                {/* Filter Tabs */}
                <div className="flex bg-gray-200 rounded-xl p-1 mb-6">
                    <button
                        onClick={() => setFilter('upcoming')}
                        className={`flex-1 py-2 rounded-lg font-medium text-sm transition ${filter === 'upcoming'
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Upcoming
                    </button>
                    <button
                        onClick={() => setFilter('past')}
                        className={`flex-1 py-2 rounded-lg font-medium text-sm transition ${filter === 'past'
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Past
                    </button>
                </div>

                {isLoading ? (
                    <div className="space-y-4">
                        {[1, 2].map(i => (
                            <div key={i} className="bg-white p-4 rounded-xl animate-pulse h-32" />
                        ))}
                    </div>
                ) : displayList.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        <Video size={48} className="mx-auto mb-4 opacity-20" />
                        <p>No {filter} consultations found.</p>
                        {filter === 'upcoming' && (
                            <button
                                onClick={() => navigate('/doctors')}
                                className="mt-4 text-primary-600 font-bold"
                            >
                                Book your first consultation
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {displayList.map((consultation) => (
                            <motion.div
                                key={consultation.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex gap-3">
                                        <div className="w-12 h-12 bg-gray-100 rounded-full overflow-hidden">
                                            {consultation.profile_image ? (
                                                <img src={consultation.profile_image} alt="Dr" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                    <User size={24} />
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900">{consultation.doctor_name}</h3>
                                            <p className="text-sm text-gray-500">{consultation.specialization}</p>
                                        </div>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${consultation.status === 'scheduled' ? 'bg-blue-50 text-blue-700' :
                                        consultation.status === 'completed' ? 'bg-green-50 text-green-700' :
                                            'bg-red-50 text-red-700'
                                        }`}>
                                        {consultation.status}
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Calendar size={16} className="text-gray-400" />
                                        <span>{new Date(consultation.scheduled_at).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Clock size={16} className="text-gray-400" />
                                        <span>{new Date(consultation.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                </div>

                                {filter === 'upcoming' && (
                                    <div className="flex gap-3 mt-4 pt-4 border-t border-gray-50">
                                        {consultation.status !== 'cancelled' && (
                                            <>
                                                <button
                                                    className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-medium text-sm hover:bg-gray-50"
                                                    onClick={() => handleCancel(consultation.id)}
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    onClick={() => handleJoinClick(consultation.id, consultation.scheduled_at)}
                                                    className="flex-1 py-2.5 rounded-xl bg-primary-600 text-white font-bold text-sm shadow-lg shadow-primary-600/20 flex items-center justify-center gap-2"
                                                >
                                                    <Video size={18} />
                                                    Join Call
                                                </button>
                                            </>
                                        )}
                                        {consultation.status === 'cancelled' && (
                                            <div className="w-full bg-red-50 text-red-600 p-2 rounded-lg text-sm flex items-center justify-center gap-2">
                                                <XCircle size={16} />
                                                Cancelled
                                            </div>
                                        )}
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
