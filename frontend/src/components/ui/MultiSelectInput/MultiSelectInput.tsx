import { useEffect, useRef, useState } from 'react';

import { Check, ChevronsUpDown, X } from 'lucide-react';

interface Option {
    value: string | number;
    label: string;
}

interface MultiSelectInputProps {
    label?: string;
    options: Option[];
    value: (string | number)[];
    onChange: (value: (string | number)[]) => void;
    error?: string;
    placeholder?: string;
    className?: string;
    disabled?: boolean;
    required?: boolean;
}

export const MultiSelectInput = ({
    label,
    options = [],
    value = [],
    onChange,
    error,
    placeholder = 'Sélectionner...',
    className = '',
    disabled = false,
    required = false,
}: MultiSelectInputProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);

    // Filtrer les options selon le terme de recherche
    const filteredOptions = options.filter((option) =>
        option && option.label
            ? option.label.toLowerCase().includes(searchTerm.toLowerCase())
            : false
    );

    // Gérer le clic à l'extérieur pour fermer le menu
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Toggle une option
    const toggleOption = (optionValue: string | number) => {
        if (!value) return onChange([optionValue]);

        const newValue = value.includes(optionValue)
            ? value.filter((val) => val !== optionValue)
            : [...value, optionValue];
        onChange(newValue);
    };

    // Supprimer une option sélectionnée
    const removeOption = (optionValue: string | number, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!value) return;
        onChange(value.filter((val) => val !== optionValue));
    };

    // Récupérer les labels des valeurs sélectionnées
    const selectedLabels =
        value?.map((val) => {
            const option = options.find((opt) => opt.value.toString() === val.toString());
            return option ? option.label : val.toString();
        }) || [];

    return (
        <div className={`relative ${className}`} ref={containerRef}>
            {label && (
                <label className="mb-1 block text-sm font-medium text-gray-700">
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
            )}
            <div
                className={`flex min-h-[38px] cursor-pointer items-center justify-between rounded-md border ${
                    error ? 'border-red-500' : 'border-gray-300'
                } bg-white px-3 py-2 text-sm ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
                onClick={() => !disabled && setIsOpen(!isOpen)}
            >
                <div className="flex flex-1 flex-wrap gap-1">
                    {!value || value.length === 0 ? (
                        <span className="text-gray-400">{placeholder}</span>
                    ) : (
                        selectedLabels.map((label, index) => (
                            <div
                                key={index}
                                className="flex items-center gap-1 rounded-md bg-blue-100 px-2 py-1 text-xs text-blue-800"
                            >
                                <span>{label}</span>
                                <button
                                    type="button"
                                    onClick={(e) => value && removeOption(value[index], e)}
                                    className="rounded-full p-0.5 hover:bg-blue-200"
                                >
                                    <X size={12} />
                                </button>
                            </div>
                        ))
                    )}
                </div>
                <ChevronsUpDown size={16} className="ml-2 flex-shrink-0 text-gray-400" />
            </div>

            {error && <p className="mt-1 text-xs text-red-500">{error}</p>}

            {isOpen && !disabled && (
                <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-md border border-gray-300 bg-white shadow-lg">
                    <div className="p-2">
                        <input
                            type="text"
                            placeholder="Rechercher..."
                            className="w-full rounded-md border border-gray-300 p-2 text-sm focus:border-blue-500 focus:outline-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                    <ul className="scrollbar-simple max-h-60 overflow-y-auto py-1">
                        {!filteredOptions || filteredOptions.length === 0 ? (
                            <li className="px-3 py-2 text-center text-sm text-gray-500">
                                Aucun résultat
                            </li>
                        ) : (
                            filteredOptions.map((option) => (
                                <li
                                    key={option.value.toString()}
                                    className={`flex cursor-pointer items-center justify-between px-3 py-2 text-sm hover:bg-gray-100 ${
                                        value?.includes(option.value) ? 'bg-blue-50' : ''
                                    }`}
                                    onClick={() => toggleOption(option.value)}
                                >
                                    <span>{option.label}</span>
                                    {value?.includes(option.value) && (
                                        <Check size={16} className="text-blue-600" />
                                    )}
                                </li>
                            ))
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
};
