import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Video, Star, Clock, Calendar, User,
    Search, Award, MessageCircle, X
} from 'lucide-react';
import { consultationsApi } from '../services/api';

export default function DoctorsPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const queryClient = useQueryClient();
    const [selectedSpecialization, setSelectedSpecialization] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDoctor, setSelectedDoctor] = useState<any | null>(null);
    const [selectedSlot, setSelectedSlot] = useState<any | null>(null);
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [useCredit, setUseCredit] = useState(false);
    const [patientNotes, setPatientNotes] = useState('');
    const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'phonepe'>('phonepe');

    // Handle PhonePe Verification
    useEffect(() => {
        const source = searchParams.get('source');
        const action = searchParams.get('action');
        if (source === 'phonepe' && action === 'book') {
            // Payment callback
            // Invalidate queries and showing success
            queryClient.invalidateQueries({ queryKey: ['my-consultations'] });
            navigate('/consultations/my');
            import('../store/toastStore').then(({ useToastStore }) => {
                useToastStore.getState().addToast('Consultation booked successfully with PhonePe', 'success');
            });
        }
    }, [searchParams]);

    const { data: doctorsData, isLoading } = useQuery({
        queryKey: ['doctors', selectedSpecialization],
        queryFn: async () => {
            const res = await consultationsApi.getDoctors({ specialization: selectedSpecialization || undefined });
            return res.data.data;
        },
    });

    const { data: specializationsData } = useQuery({
        queryKey: ['specializations'],
        queryFn: async () => {
            const res = await consultationsApi.getSpecializations();
            return res.data.data;
        },
    });

    const { data: slotsData, isLoading: loadingSlots } = useQuery({
        queryKey: ['doctor-slots', selectedDoctor?.id],
        queryFn: async () => {
            if (!selectedDoctor) return [];
            const res = await consultationsApi.getSlots(selectedDoctor.id);
            return res.data.data;
        },
        enabled: !!selectedDoctor,
    });

    const bookMutation = useMutation({
        mutationFn: () => {
            // Ensure date is in YYYY-MM-DD format
            const dateObj = new Date(selectedSlot.date);
            const dateStr = dateObj.toISOString().split('T')[0]; // Extract YYYY-MM-DD

            return consultationsApi.book({
                doctorId: selectedDoctor.id,
                slotId: selectedSlot.availabilityId,
                scheduledAt: `${dateStr}T${selectedSlot.time}:00`, // ISO Format approximation
                useCredit,
                patientNotes,
                paymentMethod: !useCredit ? paymentMethod : undefined,
            })
                .then(res => res.data);
        },
        onSuccess: (data: any) => { // Accept data
            if (data.success && data.data?.redirectUrl) {
                // Handle Redirect
                window.location.href = data.data.redirectUrl;
                return;
            }

            queryClient.invalidateQueries({ queryKey: ['my-consultations'] });
            setShowBookingModal(false);
            setSelectedDoctor(null);
            setSelectedSlot(null);
            navigate('/consultations/my');
            import('../store/toastStore').then(({ useToastStore }) => {
                useToastStore.getState().addToast('Consultation booked successfully', 'success');
            });
        },
        onError: (error: any) => {
            import('../store/toastStore').then(({ useToastStore }) => {
                const message = error.response?.data?.error || 'Failed to book consultation';
                useToastStore.getState().addToast(message, 'error');
            });
        },
    });

    const filteredDoctors = doctorsData?.filter((doc: any) =>
        doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.specialization.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Group slots by date
    const groupedSlots = slotsData?.reduce((acc: any, slot: any) => {
        const dateKey = slot.date;
        if (!acc[dateKey]) acc[dateKey] = [];
        acc[dateKey].push(slot);
        return acc;
    }, {});

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50/30 to-teal-50/30 pb-24">
            {/* Header */}
            <div className="bg-gradient-to-r from-cyan-500 to-teal-500 text-white py-8 px-4">
                <div className="max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <Video size={28} />
                            <h1 className="text-2xl font-bold">Video Consultations</h1>
                        </div>
                        <p className="text-cyan-100">Consult with verified doctors from home</p>
                    </motion.div>
                </div>
            </div>

            {/* Search */}
            <div className="max-w-4xl mx-auto px-4 -mt-6">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search doctors by name or specialty..."
                        className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl shadow-lg border-0 focus:ring-2 focus:ring-cyan-500"
                    />
                </div>
            </div>

            {/* Specializations */}
            <div className="max-w-4xl mx-auto px-4 mt-6">
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                    <button
                        onClick={() => setSelectedSpecialization(null)}
                        className={`px-4 py-2 rounded-full whitespace-nowrap font-medium transition ${selectedSpecialization === null
                            ? 'bg-cyan-500 text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-100'
                            }`}
                    >
                        All Doctors
                    </button>
                    {specializationsData?.map((spec: any) => (
                        <button
                            key={spec.specialization}
                            onClick={() => setSelectedSpecialization(spec.specialization)}
                            className={`px-4 py-2 rounded-full whitespace-nowrap font-medium transition ${selectedSpecialization === spec.specialization
                                ? 'bg-cyan-500 text-white'
                                : 'bg-white text-gray-700 hover:bg-gray-100'
                                }`}
                        >
                            {spec.specialization} ({spec.doctor_count})
                        </button>
                    ))}
                </div>
            </div>

            {/* Doctors Grid */}
            <div className="max-w-4xl mx-auto px-4 mt-6">
                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="bg-white rounded-2xl p-4 animate-pulse">
                                <div className="flex gap-4">
                                    <div className="w-20 h-20 bg-gray-200 rounded-xl"></div>
                                    <div className="flex-1">
                                        <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : filteredDoctors?.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-2xl">
                        <User size={48} className="mx-auto text-gray-300 mb-4" />
                        <p className="text-gray-500">No doctors found</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filteredDoctors?.map((doctor: any) => (
                            <motion.div
                                key={doctor.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition cursor-pointer"
                                onClick={() => {
                                    setSelectedDoctor(doctor);
                                    setShowBookingModal(true);
                                }}
                            >
                                <div className="flex gap-4">
                                    <div className="w-20 h-20 bg-gradient-to-br from-cyan-100 to-teal-100 rounded-xl flex items-center justify-center">
                                        <User size={32} className="text-cyan-600" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-gray-900">{doctor.name}</h4>
                                        <p className="text-cyan-600 text-sm">{doctor.specialization}</p>
                                        <p className="text-gray-500 text-sm">{doctor.qualification}</p>
                                        <div className="flex items-center gap-3 mt-2">
                                            <div className="flex items-center gap-1 text-amber-500">
                                                <Star size={14} fill="currentColor" />
                                                <span className="text-sm font-medium">{doctor.rating}</span>
                                            </div>
                                            <span className="text-gray-400">•</span>
                                            <span className="text-gray-500 text-sm">{doctor.experience_years}+ yrs</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                                    <div>
                                        <span className="text-2xl font-bold text-gray-900">₹{doctor.consultation_fee}</span>
                                        <span className="text-gray-500 text-sm"> / consult</span>
                                    </div>
                                    <button className="bg-cyan-500 text-white px-4 py-2 rounded-xl flex items-center gap-1 text-sm font-medium">
                                        <Video size={16} />
                                        Book Now
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Booking Modal */}
            {showBookingModal && selectedDoctor && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center"
                    onClick={() => {
                        setShowBookingModal(false);
                        setSelectedDoctor(null);
                        setSelectedSlot(null);
                    }}
                >
                    <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Doctor Info Header */}
                        <div className="bg-gradient-to-r from-cyan-500 to-teal-500 p-6 text-white rounded-t-3xl">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-bold">Book Consultation</h3>
                                <button onClick={() => setShowBookingModal(false)}>
                                    <X size={24} />
                                </button>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
                                    <User size={28} />
                                </div>
                                <div>
                                    <h4 className="font-bold">{selectedDoctor.name}</h4>
                                    <p className="text-cyan-100">{selectedDoctor.specialization}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Star size={14} fill="currentColor" className="text-amber-300" />
                                        <span className="text-sm">{selectedDoctor.rating} • {selectedDoctor.experience_years} yrs exp</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-6">
                            {/* Available Slots */}
                            <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Calendar size={18} />
                                Select Time Slot
                            </h4>

                            {loadingSlots ? (
                                <div className="text-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-cyan-500 border-t-transparent mx-auto"></div>
                                </div>
                            ) : Object.keys(groupedSlots || {}).length === 0 ? (
                                <div className="text-center py-8 bg-gray-50 rounded-xl">
                                    <Clock size={32} className="mx-auto text-gray-300 mb-2" />
                                    <p className="text-gray-500">No slots available</p>
                                </div>
                            ) : (
                                <div className="space-y-4 max-h-60 overflow-y-auto">
                                    {Object.entries(groupedSlots || {}).slice(0, 5).map(([date, slots]: [string, any]) => (
                                        <div key={date}>
                                            <p className="text-sm font-medium text-gray-500 mb-2">
                                                {new Date(date).toLocaleDateString('en-IN', {
                                                    weekday: 'short',
                                                    month: 'short',
                                                    day: 'numeric'
                                                })}
                                            </p>
                                            <div className="flex flex-wrap gap-2">
                                                {slots.slice(0, 8).map((slot: any, i: number) => (
                                                    <button
                                                        key={i}
                                                        onClick={() => setSelectedSlot(slot)}
                                                        className={`px-4 py-2 rounded-xl text-sm font-medium transition ${selectedSlot?.time === slot.time && selectedSlot?.date === slot.date
                                                            ? 'bg-cyan-500 text-white'
                                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                            }`}
                                                    >
                                                        {slot.time}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Patient Notes */}
                            <div className="mt-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                    <MessageCircle size={16} />
                                    Describe your concern (optional)
                                </label>
                                <textarea
                                    value={patientNotes}
                                    onChange={(e) => setPatientNotes(e.target.value)}
                                    rows={3}
                                    placeholder="Briefly describe your symptoms or reason for consultation..."
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 resize-none"
                                />
                            </div>

                            {/* Use Credit Toggle */}
                            <div className="mt-4 p-4 bg-amber-50 rounded-xl flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Award className="text-amber-500" size={20} />
                                    <div>
                                        <p className="font-medium text-gray-900">Use Max Credit</p>
                                        <p className="text-gray-500 text-sm">Free consult with MediGanga Max</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setUseCredit(!useCredit)}
                                    className={`w-12 h-6 rounded-full transition ${useCredit ? 'bg-cyan-500' : 'bg-gray-300'
                                        }`}
                                >
                                    <div className={`w-5 h-5 bg-white rounded-full shadow transition transform ${useCredit ? 'translate-x-6' : 'translate-x-0.5'
                                        }`}></div>
                                </button>
                            </div>

                            {/* Fee Summary */}
                            <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Consultation Fee</span>
                                    <span className={useCredit ? 'line-through text-gray-400' : 'font-bold text-gray-900'}>
                                        ₹{selectedDoctor.consultation_fee}
                                    </span>
                                </div>
                                {useCredit && (
                                    <div className="flex justify-between items-center text-green-600 mt-2">
                                        <span>Max Credit Applied</span>
                                        <span className="font-bold">FREE</span>
                                    </div>
                                )}
                            </div>

                        </div>

                        {/* Payment Method Selection (if not using credit) */}
                        {!useCredit && (
                            <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                                <h4 className="font-semibold text-gray-900 mb-3">Select Payment Method</h4>
                                <div className="space-y-3">
                                    <button
                                        onClick={() => setPaymentMethod('phonepe')}
                                        className={`w-full p-3 rounded-xl border-2 transition flex items-center justify-between ${paymentMethod === 'phonepe'
                                            ? 'border-cyan-500 bg-cyan-50'
                                            : 'border-white bg-white hover:border-gray-200'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-white rounded-full border border-gray-100 flex items-center justify-center p-1">
                                                <img src="https://phonepe.com/static/icon-512.png" alt="PhonePe" className="w-full h-full object-contain" />
                                            </div>
                                            <span className="font-medium text-gray-900">PhonePe</span>
                                        </div>
                                        {paymentMethod === 'phonepe' && <div className="w-4 h-4 rounded-full bg-cyan-500"></div>}
                                    </button>

                                    <button
                                        onClick={() => setPaymentMethod('razorpay')}
                                        className={`w-full p-3 rounded-xl border-2 transition flex items-center justify-between ${paymentMethod === 'razorpay'
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-white bg-white hover:border-gray-200'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                                R
                                            </div>
                                            <span className="font-medium text-gray-900">Razorpay / Card</span>
                                        </div>
                                        {paymentMethod === 'razorpay' && <div className="w-4 h-4 rounded-full bg-blue-500"></div>}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Book Button */}
                        <button
                            onClick={() => bookMutation.mutate()}
                            disabled={!selectedSlot || bookMutation.isPending}
                            className="w-full mt-6 bg-gradient-to-r from-cyan-500 to-teal-500 text-white py-4 rounded-xl font-bold disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {bookMutation.isPending ? (
                                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                            ) : (
                                <>
                                    <Video size={20} />
                                    Confirm Booking
                                </>
                            )}
                        </button>
                    </motion.div>
                </motion.div>
            )}
        </div>
    );
}
