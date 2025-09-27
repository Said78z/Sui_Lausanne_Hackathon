import ReactCountryFlag from 'react-country-flag';
import { useTranslation } from 'react-i18next';

import { ChevronDown } from 'lucide-react';

import { CountryPrefix } from './types';

interface CountrySelectorProps {
    selectedCountry: string;
    countryPrefixes: Record<string, CountryPrefix>;
    isOpen: boolean;
    onToggle: () => void;
    onSelect: (country: string) => void;
}

export const CountrySelector = ({
    selectedCountry,
    countryPrefixes,
    isOpen,
    onToggle,
    onSelect,
}: CountrySelectorProps) => {
    const { t, i18n } = useTranslation();

    return (
        <>
            <div
                className="absolute left-0 top-0 z-[100] flex h-full cursor-pointer items-center border-r border-gray-300 pl-4 pr-2 text-sm"
                onClick={onToggle}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        onToggle();
                    }
                }}
                aria-label={t('common.selectCountry')}
                aria-expanded={isOpen}
                aria-haspopup="listbox"
            >
                <span className="mr-1 overflow-hidden rounded-md">
                    <ReactCountryFlag
                        countryCode={countryPrefixes[selectedCountry]?.code || 'FR'}
                        svg
                        style={{
                            width: '1.7em',
                            height: '1.7em',
                        }}
                        title={countryPrefixes[selectedCountry]?.name[i18n.language as 'fr' | 'en']}
                    />
                </span>
                <span className="text-gray-500">{countryPrefixes[selectedCountry]?.prefix}</span>
                <ChevronDown
                    className={`ml-1 h-4 w-4 text-gray-500 transition-transform duration-200 ${
                        isOpen ? 'rotate-180' : ''
                    }`}
                />
            </div>
            {isOpen && (
                <div
                    className="absolute left-0 top-full z-20 mt-1 max-h-56 w-48 overflow-y-auto rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5"
                    role="listbox"
                    aria-label={t('common.countryList')}
                >
                    <div className="py-1">
                        {Object.entries(countryPrefixes).map(
                            ([country, { prefix, code, name }]) => (
                                <div
                                    key={country}
                                    className="flex cursor-pointer items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    onClick={() => onSelect(country)}
                                    role="option"
                                    aria-selected={selectedCountry === country}
                                    tabIndex={0}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            onSelect(country);
                                        }
                                    }}
                                >
                                    <span className="mr-2 overflow-hidden rounded-md">
                                        <ReactCountryFlag
                                            countryCode={code}
                                            svg
                                            style={{
                                                width: '1.7em',
                                                height: '1.7em',
                                            }}
                                            title={name[i18n.language as 'fr' | 'en']}
                                        />
                                    </span>
                                    <span>{name[i18n.language as 'fr' | 'en']}</span>
                                    <span className="ml-auto text-gray-500">{prefix}</span>
                                </div>
                            )
                        )}
                    </div>
                </div>
            )}
        </>
    );
};
