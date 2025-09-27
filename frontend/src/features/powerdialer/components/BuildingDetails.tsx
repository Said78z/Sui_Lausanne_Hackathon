import { Input } from '@/components';

import { useTranslation } from 'react-i18next';

import { Scan } from 'lucide-react';

import { SelectInput } from '@/components/ui/SelectInput/SelectInput';
import { ToggleGroup } from '@/components/ui/ToggleButton/ToggleButton';

interface BuildingDetailsProps {
    buildingData?: {
        doubleVitrage: string;
        copropriete: boolean;
        compteursElectriques: boolean;
        compteursEau: boolean;
        surface: number;
        etatToiture: boolean;
        etatFacade: boolean;
        meuble: boolean;
    };
    onChange?: (field: string, value: any) => void;
}

const doubleVitrageOptions = [
    { label: 'Oui', value: 'oui' },
    { label: 'Partiellement', value: 'partiellement' },
    { label: 'Non', value: 'non' },
];

export function BuildingDetails({ buildingData, onChange }: BuildingDetailsProps) {
    const { t } = useTranslation();

    return (
        <div className="relative space-y-6 rounded-lg border border-gray-200 px-8 pb-6 pt-2">
            <div className="absolute left-0 top-6 h-12 w-1 bg-tertiary"></div>
            <h3 className="px-6 text-xl font-semibold">{t('powerdialer.buildingDetails.title')}</h3>

            <div className="grid grid-cols-2 gap-x-10 gap-y-6">
                <SelectInput
                    label={t('powerdialer.buildingDetails.doubleGlazing')}
                    name="doubleVitrage"
                    options={doubleVitrageOptions}
                    value={buildingData?.doubleVitrage}
                    onChange={(value) => onChange?.('doubleVitrage', value)}
                />

                <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                        {t('powerdialer.buildingDetails.coOwnership')}
                    </label>
                    <ToggleGroup
                        options={[
                            { label: 'Pleine propriété', value: 'false' },
                            { label: 'Co-propriété', value: 'true' },
                        ]}
                        value={buildingData?.copropriete ? 'true' : 'false'}
                        onChange={(value) => onChange?.('copropriete', value === 'true')}
                    />
                </div>

                <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                        {t('powerdialer.buildingDetails.electricMeters')}
                    </label>
                    <ToggleGroup
                        options={[
                            { label: 'Individuels', value: 'true' },
                            { label: 'Communs', value: 'false' },
                        ]}
                        value={buildingData?.compteursElectriques ? 'true' : 'false'}
                        onChange={(value) => onChange?.('compteursElectriques', value === 'true')}
                    />
                </div>

                <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                        {t('powerdialer.buildingDetails.waterMeters')}
                    </label>
                    <ToggleGroup
                        options={[
                            { label: 'Individuels', value: 'true' },
                            { label: 'Communs', value: 'false' },
                        ]}
                        value={buildingData?.compteursEau ? 'true' : 'false'}
                        onChange={(value) => onChange?.('compteursEau', value === 'true')}
                    />
                </div>

                <div>
                    <Input
                        label={t('powerdialer.buildingDetails.area')}
                        type="number"
                        name="surface"
                        value={buildingData?.surface}
                        onChange={(e) => onChange?.('surface', Number(e.target.value))}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                        rightIcon={<Scan className="h-4 w-4 text-gray-500" />}
                        required
                    />
                </div>

                <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                        {t('powerdialer.buildingDetails.roofCondition')}
                    </label>
                    <ToggleGroup
                        options={[
                            { label: 'Bon', value: 'true' },
                            { label: 'Mauvais', value: 'false' },
                        ]}
                        value={buildingData?.etatToiture ? 'true' : 'false'}
                        onChange={(value) => onChange?.('etatToiture', value === 'true')}
                    />
                </div>

                <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                        {t('powerdialer.buildingDetails.facadeCondition')}
                    </label>
                    <ToggleGroup
                        options={[
                            { label: 'Bon', value: 'true' },
                            { label: 'Mauvais', value: 'false' },
                        ]}
                        value={buildingData?.etatFacade ? 'true' : 'false'}
                        onChange={(value) => onChange?.('etatFacade', value === 'true')}
                    />
                </div>

                <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                        {t('powerdialer.buildingDetails.furnished')}
                    </label>
                    <ToggleGroup
                        options={[
                            { label: 'Oui', value: 'true' },
                            { label: 'Non', value: 'false' },
                        ]}
                        value={buildingData?.meuble ? 'true' : 'false'}
                        onChange={(value) => onChange?.('meuble', value === 'true')}
                    />
                </div>
            </div>
        </div>
    );
}
