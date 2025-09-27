'use client';

import type React from 'react';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

interface CheckboxProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    label?: string;
    disabled?: boolean;
    className?: string;
    id?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({
    checked,
    onChange,
    label,
    disabled = false,
    className = '',
    id,
}) => {
    const uniqueId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;

    return (
        <div className={`flex items-center ${className}`}>
            <div className="relative flex items-center">
                <input
                    type="checkbox"
                    id={uniqueId}
                    checked={checked}
                    onChange={() => !disabled && onChange(!checked)}
                    disabled={disabled}
                    className="sr-only"
                />

                <motion.div
                    className={`flex h-5 w-5 items-center justify-center rounded border ${checked ? 'border-blue-600 bg-blue-600' : 'border-gray-300 bg-white'} ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'} `}
                    animate={{
                        backgroundColor: checked ? 'rgb(37, 99, 235)' : 'white',
                        borderColor: checked ? 'rgb(37, 99, 235)' : 'rgb(209, 213, 219)',
                    }}
                    onClick={() => !disabled && onChange(!checked)}
                >
                    {checked && (
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            transition={{ duration: 0.1 }}
                        >
                            <Check className="h-3 w-3 text-white" />
                        </motion.div>
                    )}
                </motion.div>
            </div>

            {label && (
                <label
                    htmlFor={uniqueId}
                    className={`ml-2 text-sm font-medium text-gray-700 ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                >
                    {label}
                </label>
            )}
        </div>
    );
};
