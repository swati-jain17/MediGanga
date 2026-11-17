import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Camera, FileText, CheckCircle2, Clock, AlertCircle, X } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { prescriptionsApi, getImageUrl } from '../services/api';

export function PrescriptionsPage() {
    const [dragActive, setDragActive] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadError, setUploadError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const queryClient = useQueryClient();

    const { data: prescriptions, isLoading } = useQuery({
        queryKey: ['prescriptions'],
        queryFn: async () => {
            const response = await prescriptionsApi.getAll();
            return response.data.data || [];
        },
    });

    const uploadMutation = useMutation({
        mutationFn: async (file: File) => {
            const formData = new FormData();
            formData.append('prescription', file);
            formData.append('issued_date', new Date().toISOString().split('T')[0]);

            // Simulate progress
            const interval = setInterval(() => {
                setUploadProgress(prev => Math.min(prev + 20, 90));
            }, 200);

            const response = await prescriptionsApi.upload(formData);

            clearInterval(interval);
            setUploadProgress(100);

            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['prescriptions'] });
            setVerificationTimeLeft(120); // Start 2 minute timer
            // Don't reset progress immediately if we want to show "Verifying..."
        },
        onError: (error: any) => {
            setUploadError(error.response?.data?.error || 'Upload failed');
            setUploadProgress(0);
        },
    });

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleFile = (file: File) => {
        if (!file.type.startsWith('image/')) {
            setUploadError('Please upload an image file');
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            setUploadError('File size must be less than 10MB');
            return;
        }

        setUploadError('');
        uploadMutation.mutate(file);
    };

    const [verificationTimeLeft, setVerificationTimeLeft] = useState(0);

    // Timer Logic - Robust
    useEffect(() => {
        // Find if there is any recently uploaded prescription (within last 2 mins) that is not verified
        const recentPending = prescriptions?.find((p: any) =>
            !p.pharmacist_verified &&
            !p.is_expired &&
            (new Date().getTime() - new Date(p.created_at).getTime()) < 2 * 60 * 1000
        );

        if (recentPending) {
            const secondsPassed = (new Date().getTime() - new Date(recentPending.created_at).getTime()) / 1000;
            const remaining = Math.max(0, 120 - Math.floor(secondsPassed));
            setVerificationTimeLeft(remaining);
        }
    }, [prescriptions]);

    useEffect(() => {
        if (verificationTimeLeft <= 0) return;

        const interval = setInterval(() => {
            setVerificationTimeLeft((prev) => {
                const newVal = prev - 1;
                if (newVal <= 0) {
                    // Timer finished - Simulate verification
                    queryClient.setQueryData(['prescriptions'], (old: any[]) => {
                        return old?.map(p =>
                            (!p.pharmacist_verified && !p.is_expired) ? { ...p, pharmacist_verified: true } : p
                        ) || [];
                    });
                    queryClient.invalidateQueries({ queryKey: ['prescriptions'] });
                    return 0;
                }
                return newVal;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [verificationTimeLeft, queryClient]);

    // Block Navigation
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (verificationTimeLeft > 0) {
                e.preventDefault();
                e.returnValue = '';
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [verificationTimeLeft]);

    const getStatusBadge = (prescription: any) => {
        if (prescription.is_expired) {
            return (
                <span className="flex items-center gap-1 text-red-600 bg-red-50 px-2 py-1 rounded-full text-xs font-medium">
                    <AlertCircle size={12} />
                    Expired
                </span>
            );
        }
        if (prescription.pharmacist_verified) {
            return (
                <span className="flex items-center gap-1 text-ayurveda-600 bg-ayurveda-50 px-2 py-1 rounded-full text-xs font-medium">
                    <CheckCircle2 size={12} />
                    Verified
                </span>
            );
        }

        // Check if this is the prescription being verified
        const isRecent = (new Date().getTime() - new Date(prescription.created_at).getTime()) < 2 * 60 * 1000;

        if (isRecent && verificationTimeLeft > 0) {
            const minutes = Math.floor(verificationTimeLeft / 60);
            const seconds = verificationTimeLeft % 60;
            return (
                <span className="flex items-center gap-1 text-blue-600 bg-blue-50 px-2 py-1 rounded-full text-xs font-medium animate-pulse">
                    <Clock size={12} className="animate-spin" />
                    Verifying... {minutes}:{seconds.toString().padStart(2, '0')}
                </span>
            );
        }

        return (
            <span className="flex items-center gap-1 text-saffron-600 bg-saffron-50 px-2 py-1 rounded-full text-xs font-medium">
                <Clock size={12} />
                Pending
            </span>
        );
    };

    return (
        <div className="max-w-3xl mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Prescriptions</h1>

            {/* Upload Area */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-colors ${dragActive
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-300 hover:border-primary-400'
                    }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                    className="hidden"
                />

                {uploadProgress > 0 ? (
                    <div className="space-y-4">
                        <div className="w-16 h-16 mx-auto bg-primary-100 rounded-full flex items-center justify-center">
                            {uploadProgress === 100 ? (
                                <CheckCircle2 size={32} className="text-ayurveda-500" />
                            ) : (
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ repeat: Infinity, duration: 1 }}
                                >
                                    <Upload size={32} className="text-primary-500" />
                                </motion.div>
                            )}
                        </div>
                        <div className="max-w-xs mx-auto">
                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${uploadProgress}%` }}
                                    className="h-full bg-primary-500"
                                />
                            </div>
                            <p className="text-sm text-gray-500 mt-2">
                                {uploadProgress === 100 ? 'Upload complete!' : 'Uploading...'}
                            </p>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="w-16 h-16 mx-auto bg-primary-100 rounded-full flex items-center justify-center mb-4">
                            <Upload size={32} className="text-primary-500" />
                        </div>

                        <h3 className="font-semibold text-gray-900 mb-2">Upload Prescription</h3>
                        <p className="text-gray-500 text-sm mb-4">
                            Drag and drop an image or click to browse
                        </p>

                        <div className="flex gap-3 justify-center">
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="btn btn-primary"
                            >
                                <Upload size={18} />
                                Upload File
                            </button>
                            <label className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 cursor-pointer flex items-center gap-2">
                                <Camera size={18} />
                                Take Photo
                                <input
                                    type="file"
                                    accept="image/*"
                                    capture="environment"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) handleFile(file);
                                    }}
                                    className="hidden"
                                />
                            </label>
                        </div>

                        <p className="text-xs text-gray-400 mt-4">
                            Supported: JPG, PNG, HEIC • Max 10MB • Prescription valid for 30 days
                        </p>
                    </>
                )}

                {uploadError && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute bottom-4 left-4 right-4 bg-red-100 text-red-600 p-3 rounded-lg text-sm flex items-center justify-between"
                    >
                        {uploadError}
                        <button onClick={() => setUploadError('')}>
                            <X size={16} />
                        </button>
                    </motion.div>
                )}
            </motion.div>

            {/* Info Box */}
            <div className="bg-primary-50 rounded-xl p-4 mt-6 flex items-start gap-3">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <FileText size={20} className="text-primary-600" />
                </div>
                <div>
                    <h4 className="font-medium text-gray-900">Why upload prescriptions?</h4>
                    <p className="text-sm text-gray-600 mt-1">
                        Schedule H and H1 medicines require a valid prescription. Our pharmacist will verify
                        your prescription before dispatch. Auto-verification available for clear images.
                    </p>
                </div>
            </div>

            {/* Prescriptions List */}
            <div className="mt-8">
                <h2 className="font-semibold text-gray-900 mb-4">Your Prescriptions</h2>

                {isLoading ? (
                    <div className="space-y-4">
                        {[1, 2].map(i => (
                            <div key={i} className="bg-white rounded-xl p-4 card-shadow animate-pulse">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-20 bg-gray-200 rounded-lg" />
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 bg-gray-200 rounded w-1/3" />
                                        <div className="h-3 bg-gray-200 rounded w-1/2" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : prescriptions && prescriptions.length > 0 ? (
                    <AnimatePresence>
                        <div className="space-y-4">
                            {prescriptions.map((prescription: any) => (
                                <motion.div
                                    key={prescription.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-white rounded-xl p-4 card-shadow"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="w-16 h-20 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                                            {prescription.image_url ? (
                                                <img
                                                    src={getImageUrl(prescription.image_url)}
                                                    alt="Prescription"
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <FileText size={24} className="text-gray-400" />
                                            )}
                                        </div>

                                        <div className="flex-1">
                                            <div className="flex items-center justify-between">
                                                <p className="font-medium text-gray-900">
                                                    Prescription #{prescription.id.slice(0, 8)}
                                                </p>
                                                {getStatusBadge(prescription)}
                                            </div>

                                            <p className="text-sm text-gray-500 mt-1">
                                                Uploaded on {new Date(prescription.created_at).toLocaleDateString('en-IN', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric',
                                                })}
                                            </p>

                                            {prescription.expiry_date && !prescription.is_expired && (
                                                <p className="text-xs text-ayurveda-600 mt-1">
                                                    Valid until {new Date(prescription.expiry_date).toLocaleDateString('en-IN')}
                                                </p>
                                            )}

                                            {prescription.ocr_data?.medicines?.length > 0 && (
                                                <div className="mt-2 flex flex-wrap gap-1">
                                                    {prescription.ocr_data.medicines.slice(0, 3).map((med: string, idx: number) => (
                                                        <span key={idx} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                                                            {med}
                                                        </span>
                                                    ))}
                                                    {prescription.ocr_data.medicines.length > 3 && (
                                                        <span className="text-xs text-gray-500">
                                                            +{prescription.ocr_data.medicines.length - 3} more
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </AnimatePresence>
                ) : (
                    <div className="text-center py-12 bg-gray-50 rounded-xl">
                        <FileText size={48} className="text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">No prescriptions uploaded yet</p>
                    </div>
                )}
            </div>
        </div>
    );
}
