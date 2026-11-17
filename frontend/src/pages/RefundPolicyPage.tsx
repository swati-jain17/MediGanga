import { ArrowLeft, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function RefundPolicyPage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            <div className="bg-white sticky top-0 z-10 shadow-sm">
                <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
                    <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full">
                        <ArrowLeft size={24} />
                    </button>
                    <h1 className="text-xl font-bold flex items-center gap-2">
                        <RefreshCw className="text-primary-600" size={24} />
                        Refund & Cancellation Policy
                    </h1>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="bg-white rounded-2xl p-6 md:p-10 shadow-sm space-y-6 text-gray-700 leading-relaxed">
                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-3">1. Order Cancellation</h2>
                        <p>
                            You may cancel your order at any time before it has been packed for delivery. Once the order status changes to "Out for Delivery", cancellation may not be possible or may incur a cancellation fee.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-3">2. Returns</h2>
                        <p>
                            We accept returns under the following conditions:
                        </p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li>The product delivered is incorrect or different from what was ordered.</li>
                            <li>The product is damaged or defective upon delivery.</li>
                            <li>The product is expired or nearing expiry (less than 3 months shelf life).</li>
                        </ul>
                        <p className="mt-2 text-sm text-gray-500 italic">
                            Note: Cut-strips of medicines and temperature-sensitive items (like insulin) are generally not eligible for return unless damaged.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-3">3. Refund Process</h2>
                        <p>
                            Upon successful verification of your return request, the refund will be initiated.
                        </p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li><strong>Online Payments:</strong> The amount will be refunded to the original source within 5-7 business days.</li>
                            <li><strong>Cash on Delivery:</strong> The refund will be credited to your MediGanga Wallet immediately, or to your bank account via UPI within 24-48 hours upon providing details.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-3">4. Concerns</h2>
                        <p>
                            If you have any issues with your refund, please contact our support team at <a href="mailto:officialmediganga@gmail.com" className="text-primary-600 font-medium">officialmediganga@gmail.com</a> with your Order ID.
                        </p>
                    </section>

                    <p className="text-sm text-gray-500 mt-8 pt-6 border-t border-gray-100">
                        Last Updated: February 2026
                    </p>
                </div>
            </div>
        </div>
    );
}
