import { ArrowLeft, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function TermsPage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            <div className="bg-white sticky top-0 z-10 shadow-sm">
                <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
                    <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full">
                        <ArrowLeft size={24} />
                    </button>
                    <h1 className="text-xl font-bold flex items-center gap-2">
                        <FileText className="text-primary-600" size={24} />
                        Terms & Conditions
                    </h1>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="bg-white rounded-2xl p-6 md:p-10 shadow-sm space-y-6 text-gray-700 leading-relaxed">
                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-3">1. Acceptance of Terms</h2>
                        <p>
                            By accessing or using the MediGanga platform, you agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use our services.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-3">2. Use of Services</h2>
                        <p>
                            You agree to use the platform only for lawful purposes and in accordance with these Terms. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-3">3. Medicine Orders & Prescriptions</h2>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li>All orders for Schedule H and H1 drugs must be accompanied by a valid prescription from a registered medical practitioner.</li>
                            <li>MediGanga reserves the right to cancel any order if the prescription is found to be invalid or unclear.</li>
                            <li>The display of medicines on our platform is for information purposes and does not constitute medical advice.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-3">4. Delivery</h2>
                        <p>
                            We strive to deliver products within the estimated time frame of 30-45 minutes (for locations within our prime zones), but delays may occur due to traffic, weather, or other unforeseen circumstances. Lightning Priority Delivery availability depends on store stock and rider availability.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-3">5. Intellectual Property</h2>
                        <p>
                            All content on MediGanga, including text, graphics, logos, and software, is the property of MediGanga or its content suppliers and is protected by copyright laws.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-3">6. Limitation of Liability</h2>
                        <p>
                            MediGanga shall not be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the services.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-3">7. Contact Information</h2>
                        <p>
                            For any queries regarding these Terms, please contact us at <a href="mailto:officialmediganga@gmail.com" className="text-primary-600 font-medium">officialmediganga@gmail.com</a>.
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
