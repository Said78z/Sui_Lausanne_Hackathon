import type React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    name: string;
    error?: string;
    isRequired?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

export interface CountryPrefix {
    prefix: string;
    code: string;
    placeholder: string;
    name: {
        fr: string;
        en: string;
    };
    formatNumber: (value: string) => string;
}
