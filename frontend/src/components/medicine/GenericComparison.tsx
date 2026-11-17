import { motion } from 'framer-motion';
import { TrendingDown, Check, Sparkles } from 'lucide-react';

interface Props {
    branded: {
        name: string;
        price: number;
        manufacturer: string | null;
    };
    generic: {
        id: string;
        name: string;
        price: number;
        manufacturer: string | null;
        savings: number;
        savings_percent: number;
    };
    onSelectBranded: () => void;
    onSelectGeneric: () => void;
    selectedIsGeneric: boolean;
}

export function GenericComparison({ branded, generic, onSelectBranded, onSelectGeneric, selectedIsGeneric }: Props) {
    return (
        <div className="bg-gradient-to-br from-ayurveda-50 to-teal-50 rounded-2xl p-6 border-2 border-ayurveda-200">
            {/* Header */}
            <div className="flex items-center gap-2 mb-5">
                <div className="w-10 h-10 rounded-full bg-ayurveda-500 flex items-center justify-center">
                    <TrendingDown className="text-white" size={20} />
                </div>
                <div>
                    <h3 className="font-bold text-gray-900">Save {generic.savings_percent}% with Generic</h3>
                    <p className="text-sm text-gray-600">Same salt composition, same effectiveness</p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                {/* Branded Option */}
                <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={onSelectBranded}
                    className={`relative rounded-xl p-4 text-left transition-all ${!selectedIsGeneric
                            ? 'bg-white border-2 border-primary-500 shadow-lg'
                            : 'bg-white/50 border-2 border-gray-200 hover:border-gray-300'
                        }`}
                >
                    {!selectedIsGeneric && (
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center">
                            <Check size={14} className="text-white" />
                        </div>
                    )}

                    <div className="text-xs text-gray-500 mb-1 font-medium">BRANDED</div>
                    <div className="font-semibold text-gray-900 line-clamp-2">{branded.name}</div>
                    {branded.manufacturer && (
                        <div className="text-sm text-gray-500 mt-1 truncate">{branded.manufacturer}</div>
                    )}
                    <div className="text-xl font-bold text-gray-900 mt-3">₹{branded.price}</div>
                </motion.button>

                {/* Generic Option */}
                <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={onSelectGeneric}
                    className={`relative rounded-xl p-4 text-left transition-all overflow-hidden ${selectedIsGeneric
                            ? 'bg-gradient-to-br from-ayurveda-500 to-ayurveda-600 border-2 border-ayurveda-700 shadow-lg'
                            : 'bg-ayurveda-100 border-2 border-ayurveda-300 hover:border-ayurveda-400'
                        }`}
                >
                    {selectedIsGeneric && (
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center">
                            <Check size={14} className="text-ayurveda-600" />
                        </div>
                    )}

                    {/* Savings badge */}
                    <motion.div
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${selectedIsGeneric ? 'bg-yellow-400 text-yellow-900' : 'bg-ayurveda-500 text-white'
                            }`}
                    >
                        <Sparkles size={10} />
                        SAVE ₹{generic.savings}
                    </motion.div>

                    <div className={`text-xs mb-1 font-medium ${selectedIsGeneric ? 'text-ayurveda-100' : 'text-ayurveda-700'}`}>
                        GENERIC (Same Salt)
                    </div>
                    <div className={`font-semibold line-clamp-2 ${selectedIsGeneric ? 'text-white' : 'text-gray-900'}`}>
                        {generic.name}
                    </div>
                    {generic.manufacturer && (
                        <div className={`text-sm mt-1 truncate ${selectedIsGeneric ? 'text-ayurveda-100' : 'text-gray-500'}`}>
                            {generic.manufacturer}
                        </div>
                    )}
                    <div className={`text-xl font-bold mt-3 ${selectedIsGeneric ? 'text-white' : 'text-gray-900'}`}>
                        ₹{generic.price}
                    </div>
                </motion.button>
            </div>

            {/* Info footer */}
            <div className="mt-4 pt-4 border-t border-ayurveda-200 flex items-center justify-center gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                    <Check size={14} className="text-ayurveda-600" />
                    Same active ingredient
                </span>
                <span className="flex items-center gap-1">
                    <Check size={14} className="text-ayurveda-600" />
                    CDSCO approved
                </span>
            </div>
        </div>
    );
}
