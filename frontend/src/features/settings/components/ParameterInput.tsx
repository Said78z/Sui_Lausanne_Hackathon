import { Input } from '@/components';
import { SelectInput } from '@/components/ui/SelectInput/SelectInput';
import { Switch } from '@/components/ui/Switch/Switch';
import { ApplicationParameterDto } from '@shared/dto';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface ParameterInputProps {
    parameter: ApplicationParameterDto;
    value: string;
    onChange: (value: string) => void;
    options?: { value: string; label: string }[];
    disabled?: boolean;
    label?: string;
}

export const ParameterInput: React.FC<ParameterInputProps> = ({
    parameter,
    value,
    onChange,
    options,
    disabled = false,
    label
}) => {
    const { t } = useTranslation();

    // Détermine le type d'input basé sur le nom du paramètre
    const getInputType = () => {
        const name = parameter.name.toLowerCase();
        
        if (name.includes('enabled') || name.includes('active') || name.includes('autopilot')) {
            return 'boolean';
        }
        if (name.includes('time') || name.includes('Time')) {
            return 'time';
        }
        if (name.includes('percentage') || name.includes('yield') || name.includes('Yield') || 
            name.includes('downpayment') || name.includes('income') || name.includes('saving')) {
            return 'number';
        }
        if (options && options.length > 0) {
            return 'select';
        }
        if (name.includes('hours') || name.includes('days') || name.includes('threshold') || 
            name.includes('amount') || name.includes('size') || name.includes('meetings') ||
            name.includes('opportunities') || name.includes('calls')) {
            return 'number';
        }
        return 'text';
    };

    const inputType = getInputType();
    
    // Détermine l'unité à afficher
    const getUnit = () => {
        const name = parameter.name.toLowerCase();
        if (name.includes('yield') || name.includes('percentage') || name.includes('downpayment')) {
            return '%';
        }
        if (name.includes('days')) {
            return t('settings.common.days');
        }
        if (name.includes('hours')) {
            return t('settings.common.hours');
        }
        if (name.includes('income') || name.includes('saving') || name.includes('amount')) {
            return '€';
        }
        return null;
    };

    const unit = getUnit();
    const hasUnit = !!unit;
    const displayLabel = label || parameter.name;

    if (inputType === 'boolean') {
        return (
            <Switch
                label={displayLabel}
                checked={value === 'true' || value === '1'}
                onChange={(checked) => onChange(checked ? 'true' : 'false')}
                disabled={disabled}
            />
        );
    }

    if (inputType === 'select') {
        return (
            <SelectInput
                name={parameter.name}
                label={displayLabel}
                options={options || []}
                value={value}
                onChange={onChange}
                disabled={disabled}
            />
        );
    }

    return (
        <div className="relative">
            <Input
                name={parameter.name}
                label={displayLabel}
                type={inputType === 'number' ? 'number' : inputType}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className={hasUnit ? 'pr-16' : ''}
                disabled={disabled}
                min={inputType === 'number' ? 0 : undefined}
                step={inputType === 'number' && parameter.name.includes('yield') ? 0.1 : undefined}
            />
            {hasUnit && (
                <span className="absolute right-3 top-8 text-sm text-gray-500">
                    {unit}
                </span>
            )}
        </div>
    );
};
