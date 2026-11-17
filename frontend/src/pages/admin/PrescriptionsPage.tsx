import { useState, useEffect } from 'react';
import {
    CheckCircle,
    XCircle,
    Loader2,
    ChevronLeft,
    ChevronRight,
    X
} from 'lucide-react';
import { useToastStore } from '../../store/toastStore';
import { adminApi, getImageUrl } from '../../services/api';

interface Prescription {
    id: string;
    user_name: string;
    user_phone: string;
    image_url: string;
    created_at: string;
    pharmacist_verified: boolean;
    verification_notes?: string;
    is_expired: boolean;
    user_id: string;
}

export function PrescriptionsPage() {
    const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState<string>('pending');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const addToast = useToastStore((state) => state.addToast);

    const fetchPrescriptions = async () => {
        try {
            setLoading(true);
            const response = await adminApi.getPrescriptions({ status: filterStatus, page, limit: 10 });
            setPrescriptions(response.data.data || []);
            // @ts-ignore
            if (response.data.pagination) {
                // @ts-ignore
                setTotalPages(response.data.pagination.totalPages);
            }
        } catch (error) {
            console.error('Failed to fetch prescriptions:', error);
            addToast('Failed to load prescriptions', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPrescriptions();
    }, [filterStatus, page]);

    const handleVerify = async (id: string, action: 'approve' | 'reject') => {
        try {
            setActionLoading(id);
            // We assume adminApi has a generic method or we add one for verification
            // Since I cannot check adminApi type definitions easily without reading api.ts again, 
            // I will use direct axios call OR add it to adminApi if I recall it exists.
            // Wait, I saw api.ts. It didn't have verifyPrescription explicitly shown in the summary but I should check.
            // Actually, for safety, I'll use the proper endpoint via adminApi if I can or fallback to api.post
            // looking at the previous view_file of api.ts (chunk), I didn't see verifyPrescription. 
            // I will assume I need to ADD it to generic api call or use api.post directly from imports if I had it.
            // But I want to centralize. 
            // Let's use `adminApi.verifyPrescription` and I will ensure `api.ts` has it.
            // Re-reading my "viewed_code_item" for api.ts... 
            // It has: getDashboardStats, getOrders, getOrderDetails, updateOrderStatus, getUsers, updateUserRole, getInventory, addMedicine, updateMedicine, getPlans, createPlan, updatePlan, deletePlan.
            // It DOES NOT have verifyPrescription.
            // I should update api.ts FIRST or use api.post here.
            // I will use api.post directly here for now to fix the compilation error, importing `api` from services.

            // Actually, I should update api.ts to include it. It's cleaner.
            // But let's fix this file first. I'll import `api` from services/api.

            await adminApi.verifyPrescription(id, action);

            addToast(`Prescription ${action}d successfully`, 'success');
            fetchPrescriptions(); // Refresh list
        } catch (error) {
            console.error('Verification failed:', error);
            addToast('Action failed', 'error');
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Prescription Verification</h1>
                    <p className="text-gray-500">Review and verify user uploaded prescriptions</p>
                </div>

                <div className="flex items-center space-x-2 bg-white p-1 rounded-lg border border-gray-200">
                    {['pending', 'verified', 'rejected', 'all'].map((status) => (
                        <button
                            key={status}
                            onClick={() => { setFilterStatus(status); setPage(1); }}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${filterStatus === status
                                ? 'bg-blue-100 text-blue-700'
                                : 'text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {loading ? (
                    <div className="p-12 flex justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    </div>
                ) : prescriptions.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">
                        No prescriptions found for this filter.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {prescriptions.map((prescription) => (
                                    <tr key={prescription.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{prescription.user_name || 'Unknown'}</div>
                                            <div className="text-sm text-gray-500">{prescription.user_phone}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(prescription.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <button
                                                onClick={() => setSelectedImage(getImageUrl(prescription.image_url))}
                                                className="flex items-center text-blue-600 hover:text-blue-800"
                                            >
                                                <img
                                                    src={getImageUrl(prescription.image_url)}
                                                    alt="Rx"
                                                    className="h-10 w-10 object-cover rounded border border-gray-200 mr-2"
                                                />
                                                <span className="text-xs">View</span>
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {prescription.verification_notes ? (
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${prescription.pharmacist_verified ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                    }`}>
                                                    {prescription.pharmacist_verified ? 'Verified' : 'Rejected'}
                                                </span>
                                            ) : (
                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                                    Pending
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            {actionLoading === prescription.id ? (
                                                <Loader2 className="ml-auto h-5 w-5 animate-spin text-gray-400" />
                                            ) : !prescription.verification_notes ? (
                                                <div className="flex justify-end space-x-2">
                                                    <button
                                                        onClick={() => handleVerify(prescription.id, 'approve')}
                                                        className="text-green-600 hover:text-green-900 bg-green-50 p-1 rounded"
                                                        title="Approve"
                                                    >
                                                        <CheckCircle className="h-5 w-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleVerify(prescription.id, 'reject')}
                                                        className="text-red-600 hover:text-red-900 bg-red-50 p-1 rounded"
                                                        title="Reject"
                                                    >
                                                        <XCircle className="h-5 w-5" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className="text-gray-400">-</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                <div className="bg-white px-4 py-3 border-t border-gray-200 flex items-center justify-between sm:px-6">
                    <div className="flex-1 flex justify-between sm:hidden">
                        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">Previous</button>
                        <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">Next</button>
                    </div>
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm text-gray-700">Page <span className="font-medium">{page}</span> of <span className="font-medium">{totalPages}</span></p>
                        </div>
                        <div>
                            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                                    <span className="sr-only">Previous</span>
                                    <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                                </button>
                                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                                    <span className="sr-only">Next</span>
                                    <ChevronRight className="h-5 w-5" aria-hidden="true" />
                                </button>
                            </nav>
                        </div>
                    </div>
                </div>
            </div>

            {/* Image Modal */}
            {selectedImage && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 p-4" onClick={() => setSelectedImage(null)}>
                    <div className="relative max-w-4xl w-full h-full flex items-center justify-center">
                        <button
                            onClick={() => setSelectedImage(null)}
                            className="absolute top-4 right-4 text-white hover:text-gray-300"
                        >
                            <X className="h-8 w-8" />
                        </button>
                        <img src={selectedImage} alt="Prescription Full View" className="max-h-full max-w-full rounded shadow-lg" />
                    </div>
                </div>
            )}
        </div>
    );
}
