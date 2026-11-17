import { useState } from 'react';
import { motion } from 'framer-motion';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
    Activity, AlertTriangle, Phone, Stethoscope,
    ShoppingCart, ChevronRight, ArrowLeft, CheckCircle, Info
} from 'lucide-react';
import { symptomCheckerApi } from '../services/api';
import { Link, useNavigate } from 'react-router-dom';

export default function SymptomCheckerPage() {
    const navigate = useNavigate();
    const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
    const [description, setDescription] = useState('');
    const [result, setResult] = useState<any>(null);

    const { data: commonSymptoms, isLoading: loadingSymptoms } = useQuery({
        queryKey: ['common-symptoms'],
        queryFn: async () => {
            const res = await symptomCheckerApi.getSymptoms();
            return res.data.data;
        },
    });

    const analyzeMutation = useMutation({
        mutationFn: () => symptomCheckerApi.analyze({ symptoms: selectedSymptoms, description }),
        onSuccess: (res) => {
            setResult(res.data.data);
        },
    });

    const toggleSymptom = (symptomId: string) => {
        setSelectedSymptoms((prev) =>
            prev.includes(symptomId)
                ? prev.filter((s) => s !== symptomId)
                : [...prev, symptomId]
        );
    };

    const getUrgencyStyles = (urgency: string) => {
        switch (urgency) {
            case 'red':
                return {
                    bg: 'bg-red-500',
                    text: 'text-red-600',
                    lightBg: 'bg-red-50',
                    border: 'border-red-200',
                };
            case 'yellow':
                return {
                    bg: 'bg-amber-500',
                    text: 'text-amber-600',
                    lightBg: 'bg-amber-50',
                    border: 'border-amber-200',
                };
            default:
                return {
                    bg: 'bg-green-500',
                    text: 'text-green-600',
                    lightBg: 'bg-green-50',
                    border: 'border-green-200',
                };
        }
    };

    if (result) {
        const styles = getUrgencyStyles(result.urgency);

        return (
            <div className={`min-h-screen ${styles.lightBg} pb-24`}>
                {/* Result Header */}
                <div className={`${styles.bg} text-white py-8 px-4`}>
                    <div className="max-w-4xl mx-auto">
                        <button
                            onClick={() => setResult(null)}
                            className="flex items-center gap-2 text-white/80 mb-4 hover:text-white"
                        >
                            <ArrowLeft size={20} />
                            Back to Symptom Checker
                        </button>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center"
                        >
                            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                {result.urgency === 'red' ? (
                                    <AlertTriangle size={40} />
                                ) : result.urgency === 'yellow' ? (
                                    <Stethoscope size={40} />
                                ) : (
                                    <CheckCircle size={40} />
                                )}
                            </div>
                            <h1 className="text-3xl font-bold mb-2">{result.urgencyLabel}</h1>
                            <p className="text-white/80 max-w-md mx-auto">{result.recommendation}</p>
                        </motion.div>
                    </div>
                </div>

                {/* Next Steps */}
                <div className="max-w-4xl mx-auto px-4 mt-8">
                    <h3 className="font-bold text-gray-900 mb-4">Recommended Next Steps</h3>
                    <div className="space-y-3">
                        {result.nextSteps.map((step: any, i: number) => (
                            <motion.button
                                key={i}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                                onClick={() => {
                                    if (step.action === 'book_consult') navigate('/doctors');
                                    if (step.action === 'order_otc') navigate('/search');
                                    if (step.action === 'emergency_delivery') navigate('/emergency');
                                    if (step.action === 'set_reminder') navigate('/reminders');
                                }}
                                className="w-full bg-white rounded-2xl p-4 flex items-center justify-between shadow-sm hover:shadow-md transition"
                            >
                                <div className="flex items-center gap-4">
                                    <span className="text-2xl">{step.icon}</span>
                                    <span className="font-medium text-gray-900">{step.label}</span>
                                </div>
                                <ChevronRight className="text-gray-400" size={20} />
                            </motion.button>
                        ))}

                        {result.urgency === 'red' && (
                            <a
                                href="tel:108"
                                className="w-full bg-red-600 text-white rounded-2xl p-4 flex items-center justify-center gap-3 font-bold text-lg"
                            >
                                <Phone size={24} />
                                Call 108 Emergency
                            </a>
                        )}
                    </div>
                </div>

                {/* OTC Suggestions */}
                {result.urgency === 'green' && result.otcSuggestions?.length > 0 && (
                    <div className="max-w-4xl mx-auto px-4 mt-8">
                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <ShoppingCart size={20} />
                            Suggested OTC Medicines
                        </h3>
                        <div className="space-y-3">
                            {result.otcSuggestions.map((med: any, i: number) => (
                                <div key={i} className="bg-white rounded-2xl p-4 flex items-center justify-between shadow-sm">
                                    <div>
                                        <h4 className="font-bold text-gray-900">{med.name}</h4>
                                        <p className="text-gray-500 text-sm">{med.purpose}</p>
                                    </div>
                                    <Link
                                        to={`/search?q=${encodeURIComponent(med.name)}`}
                                        className="bg-green-500 text-white px-4 py-2 rounded-xl text-sm font-medium"
                                    >
                                        Order Now
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Disclaimer */}
                <div className="max-w-4xl mx-auto px-4 mt-8">
                    <div className={`${styles.lightBg} border-2 ${styles.border} rounded-2xl p-4`}>
                        <div className="flex items-start gap-3">
                            <Info className={styles.text} size={20} />
                            <p className="text-gray-600 text-sm">{result.disclaimer}</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50/30 to-fuchsia-50/30 pb-24">
            {/* Header */}
            <div className="bg-gradient-to-r from-violet-500 to-purple-600 text-white py-8 px-4">
                <div className="max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <Activity size={28} />
                            <h1 className="text-2xl font-bold">AI Symptom Checker</h1>
                        </div>
                        <p className="text-violet-100">Describe your symptoms for personalized guidance</p>
                    </motion.div>
                </div>
            </div>

            {/* Selection Area */}
            <div className="max-w-4xl mx-auto px-4 mt-8">
                <h3 className="font-bold text-gray-900 mb-4">Select your symptoms</h3>

                {loadingSymptoms ? (
                    <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                        {[...Array(12)].map((_, i) => (
                            <div key={i} className="h-24 bg-gray-200 rounded-2xl animate-pulse"></div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                        {commonSymptoms?.map((symptom: any) => (
                            <motion.button
                                key={symptom.id}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => toggleSymptom(symptom.id)}
                                className={`p-4 rounded-2xl text-center transition border-2 ${selectedSymptoms.includes(symptom.id)
                                    ? 'bg-violet-500 text-white border-violet-600'
                                    : 'bg-white text-gray-700 border-transparent hover:border-violet-200'
                                    }`}
                            >
                                <span className="text-2xl block mb-2">{symptom.icon}</span>
                                <span className="text-sm font-medium">{symptom.name}</span>
                            </motion.button>
                        ))}
                    </div>
                )}

                {/* Additional Description */}
                <div className="mt-8">
                    <h3 className="font-bold text-gray-900 mb-4">Describe your condition (optional)</h3>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={4}
                        placeholder="Tell us more about how you're feeling... How long have you had these symptoms? Any other details?"
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-violet-500 resize-none"
                    />
                </div>

                {/* Selected Count */}
                {selectedSymptoms.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-6 bg-violet-100 rounded-2xl p-4 flex items-center justify-between"
                    >
                        <span className="text-violet-800">
                            <strong>{selectedSymptoms.length}</strong> symptom{selectedSymptoms.length > 1 ? 's' : ''} selected
                        </span>
                        <button
                            onClick={() => setSelectedSymptoms([])}
                            className="text-violet-600 font-medium hover:text-violet-800"
                        >
                            Clear All
                        </button>
                    </motion.div>
                )}

                {/* Analyze Button */}
                <button
                    onClick={() => analyzeMutation.mutate()}
                    disabled={selectedSymptoms.length === 0 || analyzeMutation.isPending}
                    className="w-full mt-6 bg-gradient-to-r from-violet-500 to-purple-600 text-white py-4 rounded-2xl font-bold disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {analyzeMutation.isPending ? (
                        <>
                            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                            Analyzing...
                        </>
                    ) : (
                        <>
                            <Activity size={20} />
                            Analyze Symptoms
                        </>
                    )}
                </button>

                {/* Disclaimer */}
                <p className="text-gray-500 text-sm text-center mt-6">
                    This tool is for informational purposes only and does not replace professional medical advice.
                </p>
            </div>
        </div>
    );
}
