import { formatCzechNumber, formatFrenchNumber } from '@/services/phoneNumberFormatService';

import type { CountryPrefix } from './types';

export const countryPrefixes: Record<string, CountryPrefix> = {
    FR: {
        prefix: '+33',
        code: 'FR',
        placeholder: '6 12 34 56 78',
        name: {
            fr: 'France',
            en: 'France',
        },
        formatNumber: formatFrenchNumber,
    },
    CZ: {
        prefix: '+420',
        code: 'CZ',
        placeholder: '123 456 789',
        name: {
            fr: 'République Tchèque',
            en: 'Czech Republic',
        },
        formatNumber: formatCzechNumber,
    },
};
