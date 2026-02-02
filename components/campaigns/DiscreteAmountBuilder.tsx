'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiX } from 'react-icons/fi';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import Card from '@/components/ui/Card';

interface DiscreteAmountBuilderProps {
    amounts: number[];
    onChange: (amounts: number[]) => void;
}

const PRESET_AMOUNTS = [10, 50, 100, 500, 1000];

export default function DiscreteAmountBuilder({ amounts, onChange }: DiscreteAmountBuilderProps) {
    const [inputValue, setInputValue] = useState('');
    const [error, setError] = useState('');

    const handleAddAmount = () => {
        const amount = parseInt(inputValue);

        if (!inputValue || isNaN(amount)) {
            setError('Please enter a valid amount');
            return;
        }

        if (amount < 10) {
            setError('Amount must be at least 10 tokens (no single digits)');
            return;
        }

        if (amounts.includes(amount)) {
            setError('This amount is already in the list');
            return;
        }

        onChange([...amounts, amount]);
        setInputValue('');
        setError('');
    };

    const handleRemoveAmount = (amountToRemove: number) => {
        onChange(amounts.filter(a => a !== amountToRemove));
    };

    const handlePresetClick = (preset: number) => {
        if (!amounts.includes(preset)) {
            onChange([...amounts, preset]);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault(); // Prevent form submission
            handleAddAmount();
        }
    };

    return (
        <Card variant="glass" padding="md">
            <div className="space-y-4">
                {/* Input Section */}
                <div>
                    <label className="block text-sm font-medium mb-2">
                        Add Amount
                    </label>
                    <div className="flex gap-2">
                        <Input
                            type="number"
                            value={inputValue}
                            onChange={(e) => {
                                setInputValue(e.target.value);
                                setError('');
                            }}
                            onKeyPress={handleKeyPress}
                            placeholder="Enter amount (min 10)"
                            min="10"
                            error={error}
                            fullWidth
                        />
                        <Button
                            type="button"
                            variant="primary"
                            size="md"
                            onClick={handleAddAmount}
                            icon={<FiPlus />}
                        >
                            Add
                        </Button>
                    </div>
                </div>

                {/* Preset Buttons */}
                <div>
                    <label className="block text-sm font-medium text-[var(--text-tertiary)] mb-2">
                        Quick Add Presets
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {PRESET_AMOUNTS.map(preset => (
                            <motion.button
                                key={preset}
                                type="button"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handlePresetClick(preset)}
                                className={`
                  px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200
                  ${amounts.includes(preset)
                                        ? 'bg-[var(--bg-hover)] text-[var(--text-tertiary)] cursor-not-allowed'
                                        : 'bg-[var(--bg-elevated)] text-white hover:bg-[var(--bg-hover)] border border-[var(--border-default)]'
                                    }
                `}
                                disabled={amounts.includes(preset)}
                            >
                                {preset}
                            </motion.button>
                        ))}
                    </div>
                </div>

                {/* Amount List */}
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium">
                            Selected Amounts
                        </label>
                        <Badge variant="default" size="sm">
                            {amounts.length} amount{amounts.length !== 1 ? 's' : ''}
                        </Badge>
                    </div>

                    {amounts.length === 0 ? (
                        <div className="text-center py-8 border-2 border-dashed border-[var(--border-subtle)] rounded-lg">
                            <p className="text-sm text-[var(--text-tertiary)]">
                                No amounts added yet
                            </p>
                            <p className="text-xs text-[var(--text-tertiary)] mt-1">
                                Add at least one amount to continue
                            </p>
                        </div>
                    ) : (
                        <div className="flex flex-wrap gap-2">
                            <AnimatePresence>
                                {amounts.sort((a, b) => a - b).map((amount, index) => (
                                    <motion.div
                                        key={amount}
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.8 }}
                                        transition={{ duration: 0.2 }}
                                        className="inline-flex items-center gap-2 px-3 py-2 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-lg"
                                    >
                                        <span className="font-semibold">{amount.toLocaleString()}</span>
                                        <span className="text-xs text-[var(--text-tertiary)]">tokens</span>
                                        <button
                                            onClick={() => handleRemoveAmount(amount)}
                                            className="ml-1 text-[var(--text-tertiary)] hover:text-[var(--color-error)] transition-colors"
                                        >
                                            <FiX className="w-4 h-4" />
                                        </button>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </div>

                {/* Info */}
                {amounts.length > 0 && (
                    <div className="p-3 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-subtle)]">
                        <p className="text-xs text-[var(--text-tertiary)]">
                            <strong>Distribution:</strong> Random amount will be selected for each wallet from this list
                        </p>
                    </div>
                )}
            </div>
        </Card>
    );
}
