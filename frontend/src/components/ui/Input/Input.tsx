import { forwardRef, useEffect, useState } from 'react';

import { CountrySelector } from './components/CountrySelector';
import { countryPrefixes } from './components/constants';
import type { InputProps } from './components/types';

export const Input = forwardRef<HTMLInputElement, InputProps>(
    (
        {
            label,
            name,
            type = 'text',
            error,
            className = '',
            isRequired,
            leftIcon,
            rightIcon,
            placeholder: userProvidedPlaceholder,
            value,
            onChange,
            ...props
        },
        ref
    ) => {
        const [selectedCountry, setSelectedCountry] = useState('FR');
        const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
        const [formattedValue, setFormattedValue] = useState('');
        const showPhonePrefix = type === 'tel';

        useEffect(() => {
            if (showPhonePrefix && value) {
                const formatted = countryPrefixes[selectedCountry].formatNumber(value as string);
                setFormattedValue(formatted);
            }
        }, [value, selectedCountry, showPhonePrefix]);

        const handleCountrySelect = (country: string) => {
            setSelectedCountry(country);
            setIsCountryDropdownOpen(false);
            if (value) {
                const formatted = countryPrefixes[country].formatNumber(value as string);
                setFormattedValue(formatted);
            }
        };

        const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const newValue = e.target.value;
            if (showPhonePrefix) {
                const formatted = countryPrefixes[selectedCountry].formatNumber(newValue);
                setFormattedValue(formatted);
                const formattedEvent = {
                    ...e,
                    target: {
                        ...e.target,
                        value: formatted,
                    },
                };
                onChange?.(formattedEvent);
            } else {
                onChange?.(e);
            }
        };

        const placeholder = showPhonePrefix
            ? countryPrefixes[selectedCountry]?.placeholder || ''
            : userProvidedPlaceholder;

        return (
            <div className="flex w-full flex-col">
                <label htmlFor={name} className="mb-1 block text-sm font-medium text-gray-700">
                    {label}
                    {isRequired && <span className="ml-1 text-red-500">*</span>}
                </label>
                <div className="relative">
                    {showPhonePrefix && (
                        <CountrySelector
                            selectedCountry={selectedCountry}
                            countryPrefixes={countryPrefixes}
                            isOpen={isCountryDropdownOpen}
                            onToggle={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
                            onSelect={handleCountrySelect}
                        />
                    )}
                    <input
                        id={name}
                        name={name}
                        type={type}
                        ref={ref}
                        value={showPhonePrefix ? formattedValue : value}
                        onChange={handleInputChange}
                        placeholder={placeholder}
                        className={`relative block w-full appearance-none rounded-lg px-3 py-2 ${
                            showPhonePrefix ? 'pl-28' : leftIcon ? 'pl-10' : ''
                        } ${rightIcon ? 'pr-10' : ''} group border border-gray-300 text-gray-900 placeholder-gray-500 transition duration-150 ease-in-out focus:z-10 focus:border-tertiary focus:outline-none sm:text-sm ${
                            error ? 'border-red-500' : ''
                        } ${className}`}
                        aria-invalid={error ? 'true' : 'false'}
                        aria-describedby={error ? `${name}-error` : undefined}
                        {...props}
                    />
                    {leftIcon && !showPhonePrefix && (
                        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 flex items-center pl-3 group-focus:text-tertiary">
                            {leftIcon}
                        </div>
                    )}
                    {rightIcon && (
                        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 flex items-center pr-3 group-focus:text-tertiary">
                            {rightIcon}
                        </div>
                    )}
                </div>
                {error && (
                    <p className="mt-1 text-sm text-red-600" id={`${name}-error`}>
                        {error}
                    </p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';
