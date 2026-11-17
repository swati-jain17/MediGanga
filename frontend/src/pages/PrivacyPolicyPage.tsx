import { ArrowLeft, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function PrivacyPolicyPage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            <div className="bg-white sticky top-0 z-10 shadow-sm">
                <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
                    <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full">
                        <ArrowLeft size={24} />
                    </button>
                    <h1 className="text-xl font-bold flex items-center gap-2">
                        <Shield className="text-primary-600" size={24} />
                        Privacy Policy
                    </h1>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="bg-white rounded-2xl p-6 md:p-10 shadow-sm space-y-6 text-gray-700 leading-relaxed">
                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-3">1. Information We Collect</h2>
                        <p>
                            We collect information you provide directly to us, such as when you create or modify your account, request on-demand services, contact customer support, or otherwise communicate with us. This information may include: name, email, phone number, postal address, profile picture, payment method, items requested (for delivery services), delivery notes, and other information you choose to provide.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-3">2. How We Use Your Information</h2>
                        <p>
                            We use the information we collect to provide, maintain, and improve our services, such as to:
                        </p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li>Process and deliver your orders including prescriptions.</li>
                            <li>Send you receipts and order updates.</li>
                            <li>Verify your identity and authority to use our services.</li>
                            <li>Provide customer support.</li>
                            <li>Send you communications we think will be of interest to you.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-3">3. Sharing of Information</h2>
                        <p>
                            We may share the information we collect about you as described in this Statement or as described at the time of collection or sharing, including as follows:
                        </p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li>With delivery partners to enable them to provide the services you request.</li>
                            <li>With third parties to provide you a service you requested through a partnership or promotional offering made by a third party or us.</li>
                            <li>With the general public if you submit content in a public forum, such as blog comments, social media posts, or other features of our Services that are viewable by the general public.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-3">4. Security</h2>
                        <p>
                            We take reasonable measures to help protect information about you from loss, theft, misuse and unauthorized access, disclosure, alteration and destruction.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-3">5. Contact Us</h2>
                        <p>
                            If you have any questions about this Privacy Policy, please contact us at <a href="mailto:officialmediganga@gmail.com" className="text-primary-600 font-medium">officialmediganga@gmail.com</a>.
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
