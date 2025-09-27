import { useTranslation } from 'react-i18next';

import {
    Building2,
    Calculator,
    Calendar,
    Coins,
    Euro,
    Home,
    Key,
    Landmark,
    Receipt,
    Wallet,
} from 'lucide-react';

import { Input } from '@/components/ui/Input/Input';
import { SelectInput } from '@/components/ui/SelectInput/SelectInput';

interface RentalInfoProps {
    rentalData?: {
        taxeFonciere: number;
        nombreLots: number;
        loyerAnnuelHC: number;
        loyerMensuelHC: number;
        vacancesLocatives: number;
        typeLoyer: string;
        provisionsChargesAnnuelles: number;
        chargesAnnuelles: number;
        cafAnnuelle: number;
        montantTotalTravaux: number;
        fraisSyndic: number;
    };
    onChange?: (field: string, value: any) => void;
}

const typeLoyerOptions = [
    { label: 'Hors charges', value: 'hors_charges' },
    { label: 'Charges comprises', value: 'charges_comprises' },
];

export function RentalInfo({ rentalData, onChange }: RentalInfoProps) {
    const { t } = useTranslation();
    return (
        <div className="relative space-y-6 rounded-lg border border-gray-200 px-8 pb-6 pt-2">
            <div className="absolute left-0 top-6 h-12 w-1 bg-tertiary"></div>
            <h3 className="px-6 text-xl font-semibold">{t('powerdialer.rental.title')}</h3>

            <div className="grid grid-cols-4 gap-x-10 gap-y-6">
                <Input
                    label={t('powerdialer.rental.propertyTax')}
                    name="taxeFonciere"
                    type="number"
                    value={rentalData?.taxeFonciere ?? ''}
                    onChange={(e) => {
                        const value = e.target.value === '' ? undefined : Number(e.target.value);
                        onChange?.('taxeFonciere', value);
                    }}
                    required
                    rightIcon={<Landmark className="h-4 w-4 text-gray-500" />}
                />

                <Input
                    label={t('powerdialer.rental.numberOfLots')}
                    name="nombreLots"
                    type="number"
                    value={rentalData?.nombreLots ?? ''}
                    onChange={(e) => {
                        const value = e.target.value === '' ? undefined : Number(e.target.value);
                        onChange?.('nombreLots', value);
                    }}
                    required
                    rightIcon={<Building2 className="h-4 w-4 text-gray-500" />}
                />

                <Input
                    label={t('powerdialer.rental.annualRentExcludingCharges')}
                    name="loyerAnnuelHC"
                    type="number"
                    value={rentalData?.loyerAnnuelHC ?? ''}
                    onChange={(e) => {
                        const value = e.target.value === '' ? undefined : Number(e.target.value);
                        onChange?.('loyerAnnuelHC', value);
                    }}
                    className="cursor-not-allowed"
                    disabled
                    rightIcon={<Calendar className="h-4 w-4 text-gray-500" />}
                />

                <Input
                    label={t('powerdialer.rental.monthlyRentExcludingCharges')}
                    name="loyerMensuelHC"
                    type="number"
                    value={rentalData?.loyerMensuelHC ?? ''}
                    onChange={(e) => {
                        const value = e.target.value === '' ? undefined : Number(e.target.value);
                        onChange?.('loyerMensuelHC', value);
                    }}
                    className="cursor-not-allowed"
                    disabled
                    rightIcon={<Coins className="h-4 w-4 text-gray-500" />}
                />

                <Input
                    label={t('powerdialer.rental.rentalVacancies')}
                    name="vacancesLocatives"
                    type="number"
                    value={rentalData?.vacancesLocatives ?? ''}
                    onChange={(e) => {
                        const value = e.target.value === '' ? undefined : Number(e.target.value);
                        onChange?.('vacancesLocatives', value);
                    }}
                    className="cursor-not-allowed"
                    disabled
                    rightIcon={<Home className="h-4 w-4 text-gray-500" />}
                />

                <SelectInput
                    label={t('powerdialer.rental.rentType')}
                    name="typeLoyer"
                    options={typeLoyerOptions}
                    value={rentalData?.typeLoyer}
                    onChange={(value) => onChange?.('typeLoyer', value)}
                />

                <Input
                    label={t('powerdialer.rental.annualChargesProvisions')}
                    name="provisionsChargesAnnuelles"
                    type="number"
                    value={rentalData?.provisionsChargesAnnuelles ?? ''}
                    onChange={(e) => {
                        const value = e.target.value === '' ? undefined : Number(e.target.value);
                        onChange?.('provisionsChargesAnnuelles', value);
                    }}
                    className="cursor-not-allowed"
                    disabled
                    rightIcon={<Calculator className="h-4 w-4 text-gray-500" />}
                />

                <Input
                    label={t('powerdialer.rental.annualCharges')}
                    name="chargesAnnuelles"
                    type="number"
                    value={rentalData?.chargesAnnuelles ?? ''}
                    onChange={(e) => {
                        const value = e.target.value === '' ? undefined : Number(e.target.value);
                        onChange?.('chargesAnnuelles', value);
                    }}
                    required
                    rightIcon={<Euro className="h-4 w-4 text-gray-500" />}
                />

                <Input
                    label={t('powerdialer.rental.annualHousingBenefit')}
                    name="cafAnnuelle"
                    type="number"
                    value={rentalData?.cafAnnuelle ?? ''}
                    onChange={(e) => {
                        const value = e.target.value === '' ? undefined : Number(e.target.value);
                        onChange?.('cafAnnuelle', value);
                    }}
                    className="cursor-not-allowed"
                    disabled
                    rightIcon={<Wallet className="h-4 w-4 text-gray-500" />}
                />

                <Input
                    label={t('powerdialer.rental.totalWorkAmount')}
                    name="montantTotalTravaux"
                    type="number"
                    value={rentalData?.montantTotalTravaux ?? ''}
                    onChange={(e) => {
                        const value = e.target.value === '' ? undefined : Number(e.target.value);
                        onChange?.('montantTotalTravaux', value);
                    }}
                    required
                    rightIcon={<Key className="h-4 w-4 text-gray-500" />}
                />

                <Input
                    label={t('powerdialer.rental.managementFees')}
                    name="fraisSyndic"
                    type="number"
                    value={rentalData?.fraisSyndic ?? ''}
                    onChange={(e) => {
                        const value = e.target.value === '' ? undefined : Number(e.target.value);
                        onChange?.('fraisSyndic', value);
                    }}
                    required
                    rightIcon={<Receipt className="h-4 w-4 text-gray-500" />}
                />
            </div>
        </div>
    );
}
