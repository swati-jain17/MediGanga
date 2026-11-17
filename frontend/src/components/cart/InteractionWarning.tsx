import { motion } from 'framer-motion';
import { AlertTriangle, XCircle, AlertCircle, Info } from 'lucide-react';
import type { DrugInteraction } from '../../types';

interface Props {
    interactions: DrugInteraction[];
    onAcknowledge?: () => void;
    showAcknowledgeButton?: boolean;
}

export function InteractionWarning({ interactions, onAcknowledge, showAcknowledgeButton = true }: Props) {
    const contraindicated = interactions.filter(i => i.severity === 'CONTRAINDICATED');
    const major = interactions.filter(i => i.severity === 'MAJOR');
    const moderate = interactions.filter(i => i.severity === 'MODERATE');
    const minor = interactions.filter(i => i.severity === 'MINOR');

    if (interactions.length === 0) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
        >
            {/* CONTRAINDICATED - Blocking */}
            {contraindicated.map((interaction, idx) => (
                <motion.div
                    key={`contra-${idx}`}
                    initial={{ x: -20 }}
                    animate={{ x: 0 }}
                    className="bg-red-50 border-2 border-red-500 rounded-xl p-5"
                >
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                            <XCircle className="text-red-600" size={28} />
                        </div>
                        <div className="flex-1">
                            <h4 className="font-bold text-red-900 text-lg flex items-center gap-2">
                                CONTRAINDICATED
                                <span className="text-xs bg-red-600 text-white px-2 py-0.5 rounded-full">
                                    Checkout Blocked
                                </span>
                            </h4>
                            <p className="text-red-800 mt-2">
                                <span className="font-semibold">{interaction.medicineA}</span>
                                <span className="mx-2 text-red-400">+</span>
                                <span className="font-semibold">{interaction.medicineB}</span>
                            </p>
                            <p className="text-red-700 text-sm mt-2 leading-relaxed">{interaction.description}</p>
                            {interaction.alternative && (
                                <p className="text-red-900 text-sm mt-3 font-medium bg-red-100 rounded-lg p-3">
                                    ✓ Safe alternative: {interaction.alternative}
                                </p>
                            )}
                        </div>
                    </div>
                </motion.div>
            ))}

            {/* MAJOR - Requires acknowledgment */}
            {major.map((interaction, idx) => (
                <motion.div
                    key={`major-${idx}`}
                    initial={{ x: -20 }}
                    animate={{ x: 0 }}
                    className="bg-orange-50 border-2 border-orange-400 rounded-xl p-5"
                >
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                            <AlertTriangle className="text-orange-600" size={24} />
                        </div>
                        <div className="flex-1">
                            <h4 className="font-bold text-orange-900 text-lg">MAJOR Interaction Warning</h4>
                            <p className="text-orange-800 mt-2">
                                <span className="font-semibold">{interaction.medicineA}</span>
                                <span className="mx-2 text-orange-400">+</span>
                                <span className="font-semibold">{interaction.medicineB}</span>
                            </p>
                            <p className="text-orange-700 text-sm mt-2 leading-relaxed">{interaction.description}</p>
                            {interaction.alternative && (
                                <p className="text-orange-900 text-sm mt-3 font-medium">
                                    Suggestion: {interaction.alternative}
                                </p>
                            )}
                        </div>
                    </div>
                </motion.div>
            ))}

            {/* MODERATE */}
            {moderate.map((interaction, idx) => (
                <motion.div
                    key={`moderate-${idx}`}
                    className="bg-amber-50 border border-amber-300 rounded-xl p-4"
                >
                    <div className="flex items-start gap-3">
                        <AlertCircle className="text-amber-600 mt-0.5 flex-shrink-0" size={20} />
                        <div>
                            <h4 className="font-semibold text-amber-900">Moderate Interaction</h4>
                            <p className="text-amber-800 text-sm mt-1">
                                {interaction.medicineA} + {interaction.medicineB}
                            </p>
                            <p className="text-amber-700 text-xs mt-1">{interaction.description}</p>
                        </div>
                    </div>
                </motion.div>
            ))}

            {/* MINOR */}
            {minor.length > 0 && (
                <div className="bg-teal-50 border border-teal-200 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                        <Info className="text-teal-600 mt-0.5 flex-shrink-0" size={20} />
                        <div>
                            <h4 className="font-semibold text-teal-900">Minor Interactions</h4>
                            <p className="text-teal-700 text-sm mt-1">
                                {minor.length} minor interaction{minor.length > 1 ? 's' : ''} detected. Usually not clinically significant.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Acknowledge button for MAJOR interactions */}
            {major.length > 0 && contraindicated.length === 0 && showAcknowledgeButton && onAcknowledge && (
                <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={onAcknowledge}
                    className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-4 rounded-xl font-semibold hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg shadow-orange-500/30"
                >
                    I Understand the Risks — Proceed
                </motion.button>
            )}
        </motion.div>
    );
}
