import { useTranslation } from 'react-i18next';

import { CheckCheck, CircleOff, SpellCheck } from 'lucide-react';

import { Input } from '@/components/ui/Input/Input';
import { SelectInput } from '@/components/ui/SelectInput/SelectInput';

const typeBienOptions = [
    { label: 'Appartement', value: 'appartment' },
    { label: 'Immeuble', value: 'building' },
];

interface BasisDataProps {
    selectedQualification: string;
    onQualificationChange: (value: string) => void;
    data?: {
        typeBien: string;
        ville: string;
        prix: number;
    };
    onChange?: (field: string, value: any) => void;
    showAllNotes: boolean;
}

export function BasisData({
    selectedQualification,
    onQualificationChange,
    data,
    onChange,
    showAllNotes,
}: BasisDataProps) {
    const { t } = useTranslation();

    return (
        <div className="relative rounded-lg border border-gray-200 px-6 py-8">
            <div className="absolute left-0 top-6 h-12 w-1 bg-tertiary"></div>
            <div className="flex items-center justify-between px-6">
                <h2 className="text-xl font-semibold">{t('powerdialer.basis.title')}</h2>
            </div>
            <div className="grid grid-cols-2 gap-4 px-2 pb-4 pt-6">
                <SelectInput
                    label={t('powerdialer.basis.propertyType')}
                    name="typeBien"
                    options={typeBienOptions}
                    value={data?.typeBien}
                    onChange={(value) => onChange?.('typeBien', value)}
                />
                <Input
                    label={t('powerdialer.basis.city')}
                    name="city"
                    type="text"
                    value={data?.ville}
                    onChange={(e) => onChange?.('ville', e.target.value)}
                />
            </div>
            <div className="flex px-2">
                <Input
                    label={t('powerdialer.basis.price')}
                    name="price"
                    type="number"
                    value={data?.prix ?? ''}
                    onChange={(e) => {
                        const value = e.target.value === '' ? undefined : Number(e.target.value);
                        onChange?.('prix', value);
                    }}
                />
            </div>
            <div className="relative mt-4 grid grid-cols-3 px-2">
                <div
                    className="absolute h-full rounded-lg bg-tertiary transition-all duration-300"
                    style={{
                        width: 'calc(33.333% - 8px)',
                        left:
                            selectedQualification === 'prequalifie'
                                ? '8px'
                                : selectedQualification === 'non-pertinent'
                                  ? `calc(33.333% + ${showAllNotes ? '0px' : '8px'})`
                                  : `calc(66.666% + ${showAllNotes ? '0px' : '8px'})`,
                        opacity: selectedQualification ? 1 : 0,
                    }}
                />
                <div
                    className={`group relative z-10 flex w-full cursor-pointer items-center justify-center rounded-lg px-4 py-2 transition-colors duration-300 ${selectedQualification === 'prequalifie' ? 'text-white' : 'text-gray-600'}`}
                    onClick={() => onQualificationChange('prequalifie')}
                >
                    <SpellCheck className={`mr-2 h-4 w-4 ${showAllNotes ? '' : 'mr-2'}`} />
                    <p className="text-sm transition-all duration-300 group-hover:translate-x-1">
                        {showAllNotes ? '' : t('powerdialer.basis.preQualified')}
                    </p>
                </div>
                <div
                    className={`group relative z-10 flex w-full cursor-pointer items-center justify-center rounded-lg px-4 py-2 transition-colors duration-300 ${selectedQualification === 'non-pertinent' ? 'text-white' : 'text-gray-600'}`}
                    onClick={() => onQualificationChange('non-pertinent')}
                >
                    <CircleOff className={`mr-2 h-4 w-4 ${showAllNotes ? '' : 'mr-2'}`} />
                    <p className="text-sm transition-all duration-300 group-hover:translate-x-1">
                        {showAllNotes ? '' : t('powerdialer.basis.notRelevant')}
                    </p>
                </div>
                <div
                    className={`group relative z-10 flex w-full cursor-pointer items-center justify-center rounded-lg px-4 py-2 transition-colors duration-300 ${selectedQualification === 'pertinent' ? 'text-white' : 'text-gray-600'}`}
                    onClick={() => onQualificationChange('pertinent')}
                >
                    <CheckCheck className={`mr-2 h-4 w-4 ${showAllNotes ? '' : 'mr-2'}`} />
                    <p className="text-sm transition-all duration-300 group-hover:translate-x-1">
                        {showAllNotes ? '' : t('powerdialer.basis.relevant')}
                    </p>
                </div>
            </div>
        </div>
    );
}
