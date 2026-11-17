import { Link } from 'react-router-dom';
import { Phone, Mail, Shield, Truck } from 'lucide-react';

export function Footer() {
    return (
        <footer className="bg-gray-900 text-gray-300 mt-auto">
            {/* Features bar */}
            <div className="border-b border-gray-800">
                <div className="max-w-7xl mx-auto px-4 py-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary-500/20 flex items-center justify-center">
                                <Truck size={20} className="text-primary-400" />
                            </div>
                            <div>
                                <p className="font-semibold text-white">30-45 Min Delivery</p>
                                <p className="text-xs text-gray-400">Fastest in town</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-ayurveda-500/20 flex items-center justify-center">
                                <Shield size={20} className="text-ayurveda-400" />
                            </div>
                            <div>
                                <p className="font-semibold text-white">100% Genuine</p>
                                <p className="text-xs text-gray-400">Licensed pharmacy</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-saffron-500/20 flex items-center justify-center">
                                <Phone size={20} className="text-saffron-400" />
                            </div>
                            <div>
                                <p className="font-semibold text-white">24/7 Support</p>
                                <p className="text-xs text-gray-400">Always here</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-coral-500/20 flex items-center justify-center">
                                <Mail size={20} className="text-coral-400" />
                            </div>
                            <div>
                                <p className="font-semibold text-white">Easy Returns</p>
                                <p className="text-xs text-gray-400">Hassle-free</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main footer */}
            <div className="max-w-7xl mx-auto px-4 py-10">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    <div>
                        <h3 className="font-bold text-white mb-4">Shop</h3>
                        <ul className="space-y-2 text-sm">
                            <li><Link to="/category/pain-relief" className="hover:text-white transition">Pain Relief</Link></li>
                            <li><Link to="/category/diabetes" className="hover:text-white transition">Diabetes Care</Link></li>
                            <li><Link to="/category/cardiac" className="hover:text-white transition">Heart Health</Link></li>

                        </ul>
                    </div>
                    <div>
                        <h3 className="font-bold text-white mb-4">Services</h3>
                        <ul className="space-y-2 text-sm">
                            <li><Link to="/prescriptions" className="hover:text-white transition">Upload Prescription</Link></li>
                            <li><Link to="/orders" className="hover:text-white transition">Track Order</Link></li>
                            <li><Link to="/refills" className="hover:text-white transition">Refill Medicines</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-bold text-white mb-4">Cities</h3>
                        <ul className="space-y-2 text-sm">
                            <li><span className="cursor-pointer hover:text-white transition">Varanasi</span></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-bold text-white mb-4">Contact</h3>
                        <ul className="space-y-2 text-sm">
                            <li className="flex items-center gap-2">
                                <Phone size={14} />
                                <span>1800-123-4567</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <Mail size={14} />
                                <span>officialmediganga@gmail.com</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom */}
                <div className="mt-10 pt-6 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-gray-500">
                        © 2026 MediGanga. All rights reserved. Licensed Pharmacy.
                    </p>
                    <div className="flex gap-4 text-sm text-gray-500">
                        <Link to="/privacy-policy" className="hover:text-white transition">Privacy Policy</Link>
                        <Link to="/terms" className="hover:text-white transition">Terms</Link>
                        <Link to="/refund-policy" className="hover:text-white transition">Refund Policy</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
