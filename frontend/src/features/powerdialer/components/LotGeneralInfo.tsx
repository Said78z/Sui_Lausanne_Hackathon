import { Button } from '@/components';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Calculator, Euro, HelpingHand, Scan, TrafficCone } from 'lucide-react';

import { Input } from '@/components/ui/Input/Input';
import { SelectInput } from '@/components/ui/SelectInput/SelectInput';
import { ToggleGroup } from '@/components/ui/ToggleButton/ToggleButton';

interface LotGeneralInfoProps {
    lotData?: {
        type: string;
        loyerHC: number;
        provisions: number;
        etage: string;
        travaux: number;
        locataire: string;
        debutBail: string;
        surface: number;
        caf: number;
        dpe: string;
        saisonnier: boolean;
        loue: boolean;
        meuble: string;
        souhaitMeubler: boolean;
        notes: string;
    };
    onDelete?: () => void;
    onChange?: (field: string, value: any) => void;
}

const typeOptions = [
    { label: 'Commercial', value: 'commercial' },
    { label: 'Garage', value: 'garage' },
    { label: 'Box', value: 'box' },
    { label: 'Chambre', value: 'chambre' },
    { label: 'Studio', value: 'studio' },
    { label: 'T2', value: 't2' },
    { label: 'T3', value: 't3' },
    { label: 'T4', value: 't4' },
    { label: 'T5', value: 't5' },
    { label: 'Loft', value: 'loft' },
    { label: 'Maison', value: 'maison' },
    { label: 'Duplex', value: 'duplex' },
    { label: 'T1Bis', value: 't1bis' },
    { label: 'Autre', value: 'autre' },
];

const etageOptions = [-2, -1, 0, 1, 2, 3, 4, 5, 6, 7].map((etage) => ({
    label: etage.toString(),
    value: etage.toString(),
}));

const locataireOptions = [
    { label: 'Retraité', value: 'retraite' },
    { label: 'Employé', value: 'employe' },
    { label: 'Chômeur', value: 'chomeur' },
    { label: 'Étudiant', value: 'etudiant' },
    { label: 'Social', value: 'social' },
    { label: 'Autre', value: 'autre' },
];

const meubleOptions = [
    { label: 'Oui', value: 'oui' },
    { label: 'Partiellement', value: 'partiellement' },
    { label: 'Non', value: 'non' },
];

const dpeOptions = ['A', 'B', 'C', 'D', 'E', 'F', 'G'].map((letter) => ({
    label: letter,
    value: letter,
}));

export function LotGeneralInfo({ lotData, onDelete, onChange }: LotGeneralInfoProps) {
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const { t } = useTranslation();

    return (
        <div className="space-y-6 p-4">
            <h3 className="text-xl font-semibold">{t('powerdialer.lots.generalInfo')}</h3>

            <div className="grid grid-cols-2 gap-4">
                <SelectInput
                    label={t('powerdialer.lots.type')}
                    name="type"
                    options={typeOptions}
                    value={lotData?.type}
                    onChange={(value) => onChange?.('type', value)}
                />

                <Input
                    label={t('powerdialer.lots.rentExcludingCharges')}
                    name="loyerHC"
                    type="number"
                    value={lotData?.loyerHC ?? ''}
                    onChange={(e) => {
                        const value = e.target.value === '' ? undefined : Number(e.target.value);
                        onChange?.('loyerHC', value);
                    }}
                    rightIcon={<Euro className="h-4 w-4 text-gray-500" />}
                />

                <Input
                    label={t('powerdialer.lots.provisions')}
                    name="provisions"
                    type="number"
                    value={lotData?.provisions ?? ''}
                    rightIcon={<Calculator className="h-4 w-4 text-gray-500" />}
                    onChange={(e) => {
                        const value = e.target.value === '' ? undefined : Number(e.target.value);
                        onChange?.('provisions', value);
                    }}
                />

                <SelectInput
                    label={t('powerdialer.lots.floor')}
                    name="etage"
                    options={etageOptions}
                    value={lotData?.etage}
                    onChange={(value) => onChange?.('etage', value)}
                />

                <Input
                    label={t('powerdialer.lots.work')}
                    name="travaux"
                    type="number"
                    value={lotData?.travaux ?? ''}
                    rightIcon={<TrafficCone className="h-4 w-4 text-gray-500" />}
                    onChange={(e) => {
                        const value = e.target.value === '' ? undefined : Number(e.target.value);
                        onChange?.('travaux', value);
                    }}
                />

                <SelectInput
                    label={t('powerdialer.lots.tenant')}
                    name="locataire"
                    options={locataireOptions}
                    value={lotData?.locataire}
                    onChange={(value) => onChange?.('locataire', value)}
                />

                <Input
                    label={t('powerdialer.lots.leaseStart')}
                    name="debutBail"
                    type="date"
                    value={lotData?.debutBail}
                    onChange={(e) => onChange?.('debutBail', e.target.value)}
                />

                <Input
                    label={t('powerdialer.lots.surface')}
                    name="surface"
                    type="number"
                    value={lotData?.surface ?? ''}
                    onChange={(e) => {
                        const value = e.target.value === '' ? undefined : Number(e.target.value);
                        onChange?.('surface', value);
                    }}
                    rightIcon={<Scan className="h-4 w-4 text-gray-500" />}
                />

                <div className="col-span-2">
                    <Input
                        label={t('powerdialer.lots.caf')}
                        name="caf"
                        type="number"
                        value={lotData?.caf ?? ''}
                        rightIcon={<HelpingHand className="h-4 w-4 text-gray-500" />}
                        onChange={(e) => {
                            const value =
                                e.target.value === '' ? undefined : Number(e.target.value);
                            onChange?.('caf', value);
                        }}
                    />
                </div>

                <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700">
                        {t('powerdialer.lots.dpe')}
                    </label>
                    <div className="mt-1">
                        <ToggleGroup
                            options={dpeOptions}
                            value={lotData?.dpe ?? ''}
                            onChange={(value) => onChange?.('dpe', value)}
                        />
                    </div>
                </div>

                <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700">
                        {t('powerdialer.lots.seasonal')}
                    </label>
                    <div className="mt-1">
                        <ToggleGroup
                            options={[
                                { label: 'Oui', value: 'true' },
                                { label: 'Non', value: 'false' },
                            ]}
                            value={lotData?.saisonnier ? 'true' : 'false'}
                            onChange={(value) => onChange?.('saisonnier', value === 'true')}
                        />
                    </div>
                </div>

                <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700">
                        {t('powerdialer.lots.rented')}
                    </label>
                    <div className="mt-1">
                        <ToggleGroup
                            options={[
                                { label: 'Loué', value: 'true' },
                                { label: 'Vide', value: 'false' },
                            ]}
                            value={lotData?.loue ? 'true' : 'false'}
                            onChange={(value) => onChange?.('loue', value === 'true')}
                        />
                    </div>
                </div>

                <div className="col-span-2">
                    <SelectInput
                        label={t('powerdialer.lots.furnished')}
                        name="meuble"
                        options={meubleOptions}
                        value={lotData?.meuble}
                        onChange={(value) => onChange?.('meuble', value)}
                    />
                </div>

                <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700">
                        {t('powerdialer.lots.wishToFurnish')}
                    </label>
                    <div className="mt-1">
                        <ToggleGroup
                            options={[
                                { label: 'Oui', value: 'true' },
                                { label: 'Non', value: 'false' },
                            ]}
                            value={lotData?.souhaitMeubler ? 'true' : 'false'}
                            onChange={(value) => onChange?.('souhaitMeubler', value === 'true')}
                        />
                    </div>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">
                    {t('powerdialer.lots.notes')}
                </label>
                <textarea
                    className="mt-1 block w-full resize-none rounded-md border border-gray-300 px-3 py-2"
                    rows={4}
                    value={lotData?.notes}
                    onChange={(e) => onChange?.('notes', e.target.value)}
                />
            </div>

            <div className="flex justify-end">
                <Button variant="danger" onClick={() => setShowDeleteModal(true)}>
                    {t('powerdialer.lots.delete')}
                </Button>
            </div>

            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="rounded-lg bg-white p-6">
                        <h3 className="mb-4 text-lg font-semibold">
                            {t('powerdialer.lots.confirmDelete')}
                        </h3>
                        <p className="mb-4">{t('powerdialer.lots.confirmDeleteMessage')}</p>
                        <div className="flex justify-end gap-4">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="rounded-md bg-gray-200 px-4 py-2 hover:bg-gray-300"
                            >
                                {t('powerdialer.lots.cancel')}
                            </button>
                            <button
                                onClick={() => {
                                    onDelete?.();
                                    setShowDeleteModal(false);
                                }}
                                className="rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700"
                            >
                                {t('powerdialer.lots.delete')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
