import { Button, Input } from '@/components';
import { SelectInput } from '@/components/ui/SelectInput/SelectInput';
import { useSettingsStore } from '@/stores/settingsStore';
import { ApplicationParameterName } from '@shared/enums';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

// Import Switch the same way as SettingsAutres
import { Switch } from '@/components/ui/Switch/Switch';

interface PowerDialerSlot {
    id: string;
    startTime: string;
    endTime: string;
    strategy: string;
}

const strategyOptions = [
    { value: 'rendement_decroissant', label: 'Rendement décroissant' },
    { value: 'completer_informations', label: 'Compléter les informations manquantes' },
    { value: 'recherche_dediee', label: 'Recherche dédiée dossiers actifs' },
];

const SettingsSourcing = () => {
    const { t } = useTranslation();
    const { getParameterValue, updateParameterValue } = useSettingsStore();

    // Local state for slots (since it's JSON data)
    const [slots, setSlots] = useState<PowerDialerSlot[]>([]);

    // Initialize slots from store when component mounts
    useEffect(() => {
        const slotsValue = getParameterValue(ApplicationParameterName.POWER_DIALER_SLOTS);
        if (slotsValue && slotsValue.trim() !== '') {
            try {
                const parsedSlots = JSON.parse(slotsValue);
                if (Array.isArray(parsedSlots)) {
                    setSlots(parsedSlots);
                } else {
                    console.warn('Slots value is not an array:', parsedSlots);
                    setSlots([]);
                }
            } catch (error) {
                console.error('Error parsing slots data:', error);
                setSlots([]);
            }
        } else {
            // Initialize with empty array if no value exists
            setSlots([]);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Only run on mount to prevent re-initialization loop

    // Update slots in store when local slots change (but prevent initial sync loop)
    useEffect(() => {
        // Always update the store, even for empty arrays
        const slotsValue = JSON.stringify(slots);
        updateParameterValue(ApplicationParameterName.POWER_DIALER_SLOTS, slotsValue);
    }, [slots, updateParameterValue]);

    // Helper functions using the store
    const getFormValue = (parameterName: ApplicationParameterName): string => {
        return getParameterValue(parameterName);
    };

    const getBooleanFormValue = (parameterName: ApplicationParameterName): boolean => {
        const value = getParameterValue(parameterName);
        return value === 'true';
    };

    const handleFieldChange = (parameterName: ApplicationParameterName, newValue: string) => {
        updateParameterValue(parameterName, newValue);
    };

    const addSlot = () => {
        const newSlot: PowerDialerSlot = {
            id: Date.now().toString(),
            startTime: '09:00',
            endTime: '10:00',
            strategy: 'rendement_decroissant',
        };
        console.log('🔧 Adding new slot:', newSlot);
        console.log('🔧 Current slots:', slots);
        const updatedSlots = [...slots, newSlot];
        console.log('🔧 Updated slots:', updatedSlots);
        setSlots(updatedSlots);
    };

    const removeSlot = (id: string) => {
        setSlots(slots.filter((slot) => slot.id !== id));
    };

    const updateSlot = (id: string, field: keyof PowerDialerSlot, value: string) => {
        setSlots(slots.map((slot) => (slot.id === id ? { ...slot, [field]: value } : slot)));
    };

    return (
        <div className="space-y-8">
            <section>
                <h2 className="mb-4 text-lg font-bold">
                    {t('settings.sourcing.opportunityCleaning')}
                </h2>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <Input
                        name="opportunitiesPerDossier"
                        label={t('settings.sourcing.opportunitiesPerDossier')}
                        type="number"
                        placeholder="10"
                        value={getFormValue(ApplicationParameterName.OPPORTUNITIES_PER_DOSSIER)}
                        onChange={(e) => handleFieldChange(ApplicationParameterName.OPPORTUNITIES_PER_DOSSIER, e.target.value)}
                    />
                    <div className="relative">
                        <Input
                            name="minPrequalifiedYield"
                            label={t('settings.sourcing.minPrequalifiedYield')}
                            type="number"
                            placeholder="8"
                            className="pr-8"
                            value={getFormValue(ApplicationParameterName.MIN_PREQUALIFIED_RENTAL_YIELD)}
                            onChange={(e) => handleFieldChange(ApplicationParameterName.MIN_PREQUALIFIED_RENTAL_YIELD, e.target.value)}
                        />
                        <span className="absolute right-3 top-8 text-sm text-gray-500">
                            {t('settings.common.percent')}
                        </span>
                    </div>
                    <div className="relative">
                        <Input
                            name="minQualifiedYield"
                            label={t('settings.sourcing.minQualifiedYield')}
                            type="number"
                            placeholder="10"
                            className="pr-8"
                            value={getFormValue(ApplicationParameterName.MIN_QUALIFIED_YIELD)}
                            onChange={(e) => handleFieldChange(ApplicationParameterName.MIN_QUALIFIED_YIELD, e.target.value)}
                        />
                        <span className="absolute right-3 top-8 text-sm text-gray-500">
                            {t('settings.common.percent')}
                        </span>
                    </div>
                    <div className="relative">
                        <Input
                            name="opportunityExpiration"
                            label={t('settings.sourcing.opportunityExpiration')}
                            type="number"
                            placeholder="30"
                            className="pr-16"
                            value={getFormValue(ApplicationParameterName.OPPORTUNITY_EXPIRATION_DAYS)}
                            onChange={(e) => handleFieldChange(ApplicationParameterName.OPPORTUNITY_EXPIRATION_DAYS, e.target.value)}
                        />
                        <span className="absolute right-3 top-8 text-sm text-gray-500">
                            {t('settings.common.days')}
                        </span>
                    </div>
                    <div className="relative">
                        <Input
                            name="relaunchDuration"
                            label={t('settings.sourcing.relaunchDuration')}
                            type="number"
                            placeholder="96"
                            className="pr-16"
                            value={getFormValue(ApplicationParameterName.RELAUNCH_DURATION_HOURS)}
                            onChange={(e) => handleFieldChange(ApplicationParameterName.RELAUNCH_DURATION_HOURS, e.target.value)}
                        />
                        <span className="absolute right-3 top-8 text-sm text-gray-500">
                            {t('settings.common.hours')}
                        </span>
                    </div>
                    <Input
                        name="callsBeforeUnavailable"
                        label={t('settings.sourcing.callsBeforeUnavailable')}
                        type="number"
                        placeholder="3"
                        value={getFormValue(ApplicationParameterName.CALLS_BEFORE_UNAVAILABLE)}
                        onChange={(e) => handleFieldChange(ApplicationParameterName.CALLS_BEFORE_UNAVAILABLE, e.target.value)}
                    />
                </div>
            </section>

            <section>
                <div className="flex justify-between">
                    <h2 className="mb-4 text-lg font-bold">
                        {t('settings.sourcing.powerDialerSlots')}
                    </h2>
                    {/* Bouton d'ajout */}
                    <Button
                        type="button"
                        variant="primary"
                        onClick={addSlot}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        {t('settings.sourcing.addSlot')}
                    </Button>
                </div>

                {/* Stratégie globale */}
                <div className="mb-6">
                    <SelectInput
                        name="callStrategy"
                        label={t('settings.sourcing.globalCallStrategy')}
                        options={strategyOptions}
                        value={getFormValue(ApplicationParameterName.GLOBAL_CALL_STRATEGY) || 'rendement_decroissant'}
                        onChange={(value) => handleFieldChange(ApplicationParameterName.GLOBAL_CALL_STRATEGY, value)}
                    />
                </div>

                {/* Liste des créneaux */}
                <div className="space-y-4">
                    {slots.map((slot) => (
                        <div
                            key={slot.id}
                            className="grid grid-cols-1 gap-4 rounded-lg border border-gray-200 bg-white p-4 md:grid-cols-4"
                        >
                            <Input
                                name={`slot_${slot.id}_from`}
                                label={t('settings.sourcing.slotStart')}
                                type="time"
                                value={slot.startTime}
                                onChange={(e) => updateSlot(slot.id, 'startTime', e.target.value)}
                            />

                            <Input
                                name={`slot_${slot.id}_to`}
                                label={t('settings.sourcing.slotEnd')}
                                type="time"
                                value={slot.endTime}
                                onChange={(e) => updateSlot(slot.id, 'endTime', e.target.value)}
                            />

                            <SelectInput
                                name={`slot_${slot.id}_strategy`}
                                label={t('settings.sourcing.callStrategy')}
                                options={strategyOptions}
                                value={slot.strategy}
                                onChange={(value) => updateSlot(slot.id, 'strategy', value)}
                            />

                            <div className="flex items-end">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => removeSlot(slot.id)}
                                    className="w-full border-red-300 text-red-600 hover:bg-red-50"
                                >
                                    {t('settings.common.delete')}
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <section>
                <h2 className="mb-4 text-lg font-bold">
                    {t('settings.sourcing.yieldSortingParameters')}
                </h2>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <Switch
                        label={t('settings.sourcing.descendingYieldSortEnabled')}
                        checked={getBooleanFormValue(ApplicationParameterName.DESCENDING_YIELD_SORT_ENABLED)}
                        onChange={(checked) => handleFieldChange(ApplicationParameterName.DESCENDING_YIELD_SORT_ENABLED, checked ? 'true' : 'false')}
                    />
                    <div className="relative">
                        <Input
                            name="descendingOrderRentalYieldPriceTargetedMin"
                            label={t('settings.sourcing.minTargetedYield')}
                            type="number"
                            placeholder="8"
                            className="pr-8"
                            value={getFormValue(ApplicationParameterName.MIN_TARGETED_YIELD)}
                            onChange={(e) => handleFieldChange(ApplicationParameterName.MIN_TARGETED_YIELD, e.target.value)}
                        />
                        <span className="absolute right-3 top-8 text-sm text-gray-500">
                            {t('settings.common.percent')}
                        </span>
                    </div>
                    <div className="relative">
                        <Input
                            name="descendingOrderRentalYieldPriceTargetedMax"
                            label={t('settings.sourcing.maxTargetedYield')}
                            type="number"
                            placeholder="15"
                            className="pr-8"
                            value={getFormValue(ApplicationParameterName.MAX_TARGETED_YIELD)}
                            onChange={(e) => handleFieldChange(ApplicationParameterName.MAX_TARGETED_YIELD, e.target.value)}
                        />
                        <span className="absolute right-3 top-8 text-sm text-gray-500">
                            {t('settings.common.percent')}
                        </span>
                    </div>
                </div>
            </section>

            <section>
                <h2 className="mb-4 text-lg font-bold">
                    {t('settings.sourcing.powerDialerThresholds')}
                </h2>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <Input
                        name="minOpportunityThreshold"
                        label={t('settings.sourcing.minOpportunityThreshold')}
                        type="number"
                        placeholder="30"
                        value={getFormValue(ApplicationParameterName.MIN_OPPORTUNITY_THRESHOLD)}
                        onChange={(e) => handleFieldChange(ApplicationParameterName.MIN_OPPORTUNITY_THRESHOLD, e.target.value)}
                    />
                    <Input
                        name="mediumOpportunityThreshold"
                        label={t('settings.sourcing.mediumOpportunityThreshold')}
                        type="number"
                        placeholder="50"
                        value={getFormValue(ApplicationParameterName.MEDIUM_OPPORTUNITY_THRESHOLD)}
                        onChange={(e) => handleFieldChange(ApplicationParameterName.MEDIUM_OPPORTUNITY_THRESHOLD, e.target.value)}
                    />
                    <Input
                        name="maxOpportunityThreshold"
                        label={t('settings.sourcing.maxOpportunityThreshold')}
                        type="number"
                        placeholder="70"
                        value={getFormValue(ApplicationParameterName.MAX_OPPORTUNITY_THRESHOLD)}
                        onChange={(e) => handleFieldChange(ApplicationParameterName.MAX_OPPORTUNITY_THRESHOLD, e.target.value)}
                    />
                </div>
            </section>
        </div>
    );
};

SettingsSourcing.displayName = 'SettingsSourcing';

export default SettingsSourcing;
