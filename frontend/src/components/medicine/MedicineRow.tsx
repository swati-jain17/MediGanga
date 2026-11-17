import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { medicinesApi } from '../../services/api';
import { MedicineCard } from './MedicineCard';
import { motion } from 'framer-motion';

interface MedicineRowProps {
    title: string;
    category: string;
    delay?: number;
}

export function MedicineRow({ title, category, delay = 0 }: MedicineRowProps) {
    const { data, isLoading } = useQuery({
        queryKey: ['medicines', category],
        queryFn: async () => {
            const response = await medicinesApi.getByCategory(category, 1, 10);
            return response.data.data;
        },
    });

    if (isLoading) {
        return (
            <div className="py-8">
                <div className="flex items-center justify-between mb-4 px-4">
                    <div className="h-8 bg-gray-100 rounded-lg w-48 animate-pulse" />
                    <div className="h-6 bg-gray-100 rounded w-20 animate-pulse" />
                </div>
                <div className="flex gap-4 overflow-x-auto px-4 pb-4 no-scrollbar">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="min-w-[200px] md:min-w-[240px] h-[340px] bg-gray-50 rounded-2xl animate-pulse flex-shrink-0" />
                    ))}
                </div>
            </div>
        );
    }

    if (!data || data.length === 0) return null;

    return (
        <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: delay * 0.1 }}
            className="py-8"
        >
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-6 px-4">
                    <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
                    <Link
                        to={`/search?category=${encodeURIComponent(category)}`}
                        className="text-primary-600 font-medium flex items-center gap-1 hover:gap-2 transition-all"
                    >
                        View all <ChevronRight size={18} />
                    </Link>
                </div>

                <div className="flex gap-4 overflow-x-auto px-4 pb-8 no-scrollbar snap-x">
                    {data.map((medicine: any) => (
                        <div key={medicine.id} className="min-w-[200px] md:min-w-[240px] snap-start flex-shrink-0">
                            <MedicineCard medicine={medicine} />
                        </div>
                    ))}

                    {/* View More Card */}
                    <div className="min-w-[160px] flex-shrink-0 flex items-center justify-center snap-start">
                        <Link
                            to={`/search?category=${encodeURIComponent(category)}`}
                            className="w-14 h-14 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center hover:bg-primary-500 hover:text-white transition-all shadow-sm hover:shadow-md"
                        >
                            <ChevronRight size={24} />
                        </Link>
                    </div>
                </div>
            </div>
        </motion.section>
    );
}
