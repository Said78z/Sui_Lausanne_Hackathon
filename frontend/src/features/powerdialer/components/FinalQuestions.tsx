import { useTranslation } from 'react-i18next';

import { Euro, MapPin } from 'lucide-react';

import { Input } from '@/components/ui/Input/Input';
import { ToggleGroup } from '@/components/ui/ToggleButton/ToggleButton';

interface FinalQuestionsProps {
    finalData?: {
        raisonVente: string;
        prixNegocie: {
            montant: number;
            date: string;
        };
        adresse: string;
        telephone: string;
        email: string;
        permisLouer: boolean;
        visiteDistance: boolean;
    };
    onChange?: (field: string, value: any) => void;
}

export function FinalQuestions({ finalData, onChange }: FinalQuestionsProps) {
    const { t } = useTranslation();
    const goalPrice = 100000;

    return (
        <div className="relative space-y-6 rounded-lg border border-gray-200 px-8 pb-6 pt-2">
            <div className="absolute left-0 top-6 h-12 w-1 bg-tertiary"></div>
            <h3 className="px-6 text-xl font-semibold">{t('powerdialer.finalQuestions.title')}</h3>

            <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700">
                        {t('powerdialer.finalQuestions.saleReason')}
                    </label>
                    <textarea
                        className="mt-1 block w-full resize-none rounded-md border border-gray-300 px-3 py-2"
                        rows={4}
                        value={finalData?.raisonVente || ''}
                        onChange={(e) => onChange?.('raisonVente', e.target.value)}
                    />
                </div>

                <div className="col-span-2">
                    <Input
                        label={t('powerdialer.finalQuestions.negotiatedAmount.amount')}
                        name="prixNegocie.montant"
                        type="number"
                        value={finalData?.prixNegocie?.montant || ''}
                        onChange={(e) => {
                            const value = e.target.value === '' ? 0 : Number(e.target.value);
                            onChange?.('prixNegocie', {
                                ...finalData?.prixNegocie,
                                montant: value,
                            });
                        }}
                        rightIcon={<Euro className="h-4 w-4 text-gray-500" />}
                        required
                    />
                    <p className="mt-1 text-sm text-red-600">
                        {(finalData?.prixNegocie?.montant ?? 0) > goalPrice
                            ? `Attention : Le prix négocié ne doit pas dépasser ${goalPrice}€`
                            : ''}
                    </p>
                </div>

                <div className="col-span-2">
                    <Input
                        label={t('powerdialer.finalQuestions.address')}
                        name="adresse"
                        type="text"
                        value={finalData?.adresse || ''}
                        onChange={(e) => onChange?.('adresse', e.target.value)}
                        rightIcon={<MapPin className="h-4 w-4 text-gray-500" />}
                        required
                    />
                </div>

                <Input
                    label={t('powerdialer.finalQuestions.phone')}
                    name="telephone"
                    type="tel"
                    value={finalData?.telephone || ''}
                    onChange={(e) => onChange?.('telephone', e.target.value)}
                    required
                />

                <Input
                    label={t('powerdialer.finalQuestions.email')}
                    name="email"
                    type="email"
                    value={finalData?.email || ''}
                    onChange={(e) => onChange?.('email', e.target.value)}
                    required
                />

                <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                        {t('powerdialer.finalQuestions.permitToRent')}
                    </label>
                    <ToggleGroup
                        options={[
                            { label: t('powerdialer.finalQuestions.yes'), value: 'true' },
                            { label: t('powerdialer.finalQuestions.no'), value: 'false' },
                        ]}
                        value={finalData?.permisLouer ? 'true' : 'false'}
                        onChange={(value) => onChange?.('permisLouer', value === 'true')}
                    />
                </div>

                <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                        {t('powerdialer.finalQuestions.visitDistance')}
                    </label>
                    <ToggleGroup
                        options={[
                            { label: t('powerdialer.finalQuestions.yes'), value: 'true' },
                            { label: t('powerdialer.finalQuestions.no'), value: 'false' },
                        ]}
                        value={finalData?.visiteDistance ? 'true' : 'false'}
                        onChange={(value) => onChange?.('visiteDistance', value === 'true')}
                    />
                </div>
            </div>
        </div>
    );
}
