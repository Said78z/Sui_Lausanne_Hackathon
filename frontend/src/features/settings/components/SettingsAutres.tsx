import { Input } from '@/components';
import { Switch } from '@/components/ui/Switch/Switch';
import { useSettingsStore } from '@/stores/settingsStore';
import { ApplicationParameterName } from '@shared/enums';
import { useTranslation } from 'react-i18next';

const SettingsAutres = () => {
    const { t } = useTranslation();
    const { getParameterValue, updateParameterValue } = useSettingsStore();

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

    return (
        <div className="space-y-8">
            {/* Paramètres généraux */}
            <section>
                <h2 className="mb-4 text-lg font-bold">{t('settings.autres.generalParameters')}</h2>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <Input
                        name="downpaymentProportion"
                        label={t('settings.autres.downpaymentProportion')}
                        type="number"
                        placeholder="20"
                        value={getFormValue(ApplicationParameterName.DOWNPAYMENT_PROPORTION)}
                        onChange={(e) => handleFieldChange(ApplicationParameterName.DOWNPAYMENT_PROPORTION, e.target.value)}
                    />
                    <Input
                        name="adRentalsDaysCheck"
                        label={t('settings.autres.adRentalsDaysCheck')}
                        type="number"
                        placeholder="30"
                        value={getFormValue(ApplicationParameterName.AD_RENTALS_DAYS_CHECK)}
                        onChange={(e) => handleFieldChange(ApplicationParameterName.AD_RENTALS_DAYS_CHECK, e.target.value)}
                    />
                </div>
            </section>

            {/* Opportunités */}
            <section>
                <h2 className="mb-4 text-lg font-bold">
                    {t('settings.autres.opportunityManagement')}
                </h2>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <Input
                        name="minRelevantOpportunityPerDossier"
                        label={t('settings.autres.minRelevantOpportunityPerDossier')}
                        type="number"
                        placeholder="5"
                        value={getFormValue(ApplicationParameterName.MIN_RELEVANT_OPPORTUNITY_PER_DOSSIER)}
                        onChange={(e) => handleFieldChange(ApplicationParameterName.MIN_RELEVANT_OPPORTUNITY_PER_DOSSIER, e.target.value)}
                    />
                    <div className="relative">
                        <Input
                            name="minPrequalifiedRentalYield"
                            label={t('settings.autres.minPrequalifiedRentalYield')}
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
                            name="maxPrequalifiedRentalYield"
                            label={t('settings.autres.maxPrequalifiedRentalYield')}
                            type="number"
                            placeholder="15"
                            className="pr-8"
                            value={getFormValue(ApplicationParameterName.MAX_PREQUALIFIED_RENTAL_YIELD)}
                            onChange={(e) => handleFieldChange(ApplicationParameterName.MAX_PREQUALIFIED_RENTAL_YIELD, e.target.value)}
                        />
                        <span className="absolute right-3 top-8 text-sm text-gray-500">
                            {t('settings.common.percent')}
                        </span>
                    </div>
                    <div className="relative">
                        <Input
                            name="opportunitiesExpirationDays"
                            label={t('settings.autres.opportunitiesExpirationDays')}
                            type="number"
                            placeholder="30"
                            className="pr-16"
                            value={getFormValue(ApplicationParameterName.OPPORTUNITIES_EXPIRATION_DAYS)}
                            onChange={(e) => handleFieldChange(ApplicationParameterName.OPPORTUNITIES_EXPIRATION_DAYS, e.target.value)}
                        />
                        <span className="absolute right-3 top-8 text-sm text-gray-500">
                            {t('settings.common.days')}
                        </span>
                    </div>
                    <div className="relative">
                        <Input
                            name="opportunitiesHoursBeforeWaitingToReset"
                            label={t('settings.autres.opportunitiesHoursBeforeWaitingToReset')}
                            type="number"
                            placeholder="24"
                            className="pr-16"
                            value={getFormValue(ApplicationParameterName.OPPORTUNITIES_HOURS_BEFORE_WAITING_TO_RESET)}
                            onChange={(e) => handleFieldChange(ApplicationParameterName.OPPORTUNITIES_HOURS_BEFORE_WAITING_TO_RESET, e.target.value)}
                        />
                        <span className="absolute right-3 top-8 text-sm text-gray-500">
                            {t('settings.common.hours')}
                        </span>
                    </div>
                    <Input
                        name="opportunitiesCallsBeforeNotAvailable"
                        label={t('settings.autres.opportunitiesCallsBeforeNotAvailable')}
                        type="number"
                        placeholder="3"
                        value={getFormValue(ApplicationParameterName.OPPORTUNITIES_CALLS_BEFORE_NOT_AVAILABLE)}
                        onChange={(e) => handleFieldChange(ApplicationParameterName.OPPORTUNITIES_CALLS_BEFORE_NOT_AVAILABLE, e.target.value)}
                    />
                    <div className="relative">
                        <Input
                            name="opportunitiesRealEstateYield"
                            label={t('settings.autres.opportunitiesRealEstateYield')}
                            type="number"
                            placeholder="10"
                            className="pr-8"
                            value={getFormValue(ApplicationParameterName.OPPORTUNITIES_REAL_ESTATE_YIELD)}
                            onChange={(e) => handleFieldChange(ApplicationParameterName.OPPORTUNITIES_REAL_ESTATE_YIELD, e.target.value)}
                        />
                        <span className="absolute right-3 top-8 text-sm text-gray-500">
                            {t('settings.common.percent')}
                        </span>
                    </div>
                    <Input
                        name="searchCriteriaMinAmountOpportunitiesForMaxRentalYield"
                        label={t(
                            'settings.autres.searchCriteriaMinAmountOpportunitiesForMaxRentalYield'
                        )}
                        type="number"
                        placeholder="10"
                        value={getFormValue(ApplicationParameterName.SEARCH_CRITERIA_MIN_AMOUNT_OPPORTUNITIES_FOR_MAX_RENTAL_YIELD)}
                        onChange={(e) => handleFieldChange(ApplicationParameterName.SEARCH_CRITERIA_MIN_AMOUNT_OPPORTUNITIES_FOR_MAX_RENTAL_YIELD, e.target.value)}
                    />
                </div>
            </section>

            {/* Power Dialer */}
            <section>
                <h2 className="mb-4 text-lg font-bold">{t('settings.autres.powerDialer')}</h2>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <Input
                        name="minPowerDialerSessionStockSize"
                        label={t('settings.autres.minPowerDialerSessionStockSize')}
                        type="number"
                        placeholder="100"
                        value={getFormValue(ApplicationParameterName.MIN_POWER_DIALER_SESSION_STOCK_SIZE)}
                        onChange={(e) => handleFieldChange(ApplicationParameterName.MIN_POWER_DIALER_SESSION_STOCK_SIZE, e.target.value)}
                    />
                    <Input
                        name="maxPowerDialerSessionBatchSize"
                        label={t('settings.autres.maxPowerDialerSessionBatchSize')}
                        type="number"
                        placeholder="50"
                        value={getFormValue(ApplicationParameterName.MAX_POWER_DIALER_SESSION_BATCH_SIZE)}
                        onChange={(e) => handleFieldChange(ApplicationParameterName.MAX_POWER_DIALER_SESSION_BATCH_SIZE, e.target.value)}
                    />
                </div>
            </section>

            {/* Notifications automatiques */}
            <section>
                <h2 className="mb-4 text-lg font-bold">
                    {t('settings.autres.automaticNotifications')}
                </h2>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <Switch
                        label={t('settings.autres.emailOffer')}
                        checked={getBooleanFormValue(ApplicationParameterName.EMAIL_OFFER)}
                        onChange={(checked) => handleFieldChange(ApplicationParameterName.EMAIL_OFFER, checked ? 'true' : 'false')}
                    />
                    <Switch
                        label={t('settings.autres.smsOffer')}
                        checked={getBooleanFormValue(ApplicationParameterName.SMS_OFFER)}
                        onChange={(checked) => handleFieldChange(ApplicationParameterName.SMS_OFFER, checked ? 'true' : 'false')}
                    />
                    <Switch
                        label={t('settings.autres.emailAgentSigned')}
                        checked={getBooleanFormValue(ApplicationParameterName.EMAIL_AGENT_SIGNED)}
                        onChange={(checked) => handleFieldChange(ApplicationParameterName.EMAIL_AGENT_SIGNED, checked ? 'true' : 'false')}
                    />
                    <Switch
                        label={t('settings.autres.smsAgentSigned')}
                        checked={getBooleanFormValue(ApplicationParameterName.SMS_AGENT_SIGNED)}
                        onChange={(checked) => handleFieldChange(ApplicationParameterName.SMS_AGENT_SIGNED, checked ? 'true' : 'false')}
                    />
                    <Switch
                        label={t('settings.autres.smsQualified')}
                        checked={getBooleanFormValue(ApplicationParameterName.SMS_QUALIFIED)}
                        onChange={(checked) => handleFieldChange(ApplicationParameterName.SMS_QUALIFIED, checked ? 'true' : 'false')}
                    />
                    <Switch
                        label={t('settings.autres.smsExpired')}
                        checked={getBooleanFormValue(ApplicationParameterName.SMS_EXPIRED)}
                        onChange={(checked) => handleFieldChange(ApplicationParameterName.SMS_EXPIRED, checked ? 'true' : 'false')}
                    />
                </div>
            </section>

            {/* Autopilote */}
            <section>
                <h2 className="mb-4 text-lg font-bold">{t('settings.autres.autopilot')}</h2>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <Switch
                        label={t('settings.autres.autopilotActive')}
                        checked={getBooleanFormValue(ApplicationParameterName.AUTOPILOT_ACTIVE)}
                        onChange={(checked) => handleFieldChange(ApplicationParameterName.AUTOPILOT_ACTIVE, checked ? 'true' : 'false')}
                    />
                    <div className="relative">
                        <Input
                            name="dossierAutopilotFrequencyDays"
                            label={t('settings.autres.autopilotFrequency')}
                            type="number"
                            placeholder="7"
                            className="pr-16"
                            value={getFormValue(ApplicationParameterName.DOSSIER_AUTOPILOT_FREQUENCY_DAYS)}
                            onChange={(e) => handleFieldChange(ApplicationParameterName.DOSSIER_AUTOPILOT_FREQUENCY_DAYS, e.target.value)}
                        />
                        <span className="absolute right-3 top-8 text-sm text-gray-500">
                            {t('settings.common.days')}
                        </span>
                    </div>
                    <Input
                        name="maxAutopilotPerDay"
                        label={t('settings.autres.maxAutopilotPerDay')}
                        type="number"
                        placeholder="10"
                        value={getFormValue(ApplicationParameterName.MAX_AUTOPILOT_PER_DAY)}
                        onChange={(e) => handleFieldChange(ApplicationParameterName.MAX_AUTOPILOT_PER_DAY, e.target.value)}
                    />
                    <Input
                        name="ownerAvailabilityHours"
                        label={t('settings.autres.ownerAvailability')}
                        type="text"
                        placeholder="09:00-18:00"
                        value={getFormValue(ApplicationParameterName.OWNER_AVAILABILITY_HOURS)}
                        onChange={(e) => handleFieldChange(ApplicationParameterName.OWNER_AVAILABILITY_HOURS, e.target.value)}
                    />
                </div>
            </section>
        </div>
    );
};

SettingsAutres.displayName = 'SettingsAutres';

export default SettingsAutres;
