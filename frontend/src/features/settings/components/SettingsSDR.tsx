import { Input } from '@/components';

import { useQuery } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useTranslation } from 'react-i18next';

import { api } from '@/api/interceptor';
import { useSettingsStore } from '@/stores/settingsStore';
import { ApiResponse } from '@/types';
import { UserDto, UserRole } from '@shared/dto';
import { ApplicationParameterName } from '@shared/enums';

import { Consultant } from './ConsultantCard';
import GroupColumn from './GroupColumn';

// Convert UserDto to Consultant for the kanban
const convertToConsultant = (user: UserDto): Consultant => ({
    id: user.id,
    name: `${user.firstName} ${user.lastName}`,
    maxMeetings: 10, // Default value, could be stored in ApplicationParameters per user
    currentMeetings: 0, // Would need to be calculated from meetings
});

// Hook to get consultants (users with ROLE_CONSULTANT)
const useConsultants = () => {
    return useQuery({
        queryKey: ['consultants'],
        queryFn: async (): Promise<{ data: UserDto[] }> => {
            const response: ApiResponse<UserDto[]> = await api.fetchRequest('/api/users?limit=1000', 'GET', null, true);
            // Filter users by consultant role
            const consultants = response.data?.filter((user: UserDto) => 
                user.roles?.includes(UserRole.Consultant)
            ) || [];
            return { data: consultants };
        },
    });
};

const GROUPS = [1, 2, 3, 4];

const SettingsSDR = () => {
    const { t } = useTranslation();
    const { data: consultantsResponse } = useConsultants();
    const { getParameterValue, updateParameterValue } = useSettingsStore();

    // Convert users to consultants with useMemo to prevent re-renders
    const allConsultants = useMemo(() => 
        consultantsResponse?.data?.map(convertToConsultant) || [], 
        [consultantsResponse?.data]
    );

    // État : mapping groupId -> consultants
    const [groups, setGroups] = useState<{
        [groupId: string]: Consultant[];
    }>({
        none: [],
        '1': [],
        '2': [],
        '3': [],
        '4': [],
    });

    // Helper functions using the store
    const getFormValue = (parameterName: ApplicationParameterName): string => {
        return getParameterValue(parameterName);
    };

    const handleFieldChange = (parameterName: ApplicationParameterName, newValue: string) => {
        updateParameterValue(parameterName, newValue);
    };

    // Initialize consultant groups from store when consultants are loaded
    useEffect(() => {
        if (allConsultants.length > 0) {
            // Initialize empty groups
            const initialGroups: { [key: string]: Consultant[] } = {
                none: [],
                '1': [],
                '2': [],
                '3': [],
                '4': [],
            };

            // Parse saved groups if they exist
            let savedGroups: { [key: string]: string[] } = {};
            const consultantGroupsValue = getParameterValue(ApplicationParameterName.CONSULTANT_GROUPS);
            if (consultantGroupsValue && consultantGroupsValue.trim() !== '') {
                try {
                    savedGroups = JSON.parse(consultantGroupsValue);
                    console.log('Parsed saved groups:', savedGroups);
                } catch (error) {
                    console.error('Error parsing consultant groups:', error);
                }
            }

            // Distribute consultants to their assigned groups
            allConsultants.forEach(consultant => {
                let assigned = false;
                
                // Check if consultant is assigned to any group
                Object.entries(savedGroups).forEach(([groupId, consultantIds]) => {
                    if (Array.isArray(consultantIds) && consultantIds.includes(consultant.id)) {
                        if (groupId in initialGroups) {
                            initialGroups[groupId].push(consultant);
                            assigned = true;
                        }
                    }
                });
                
                // If not assigned to any group, put in 'none'
                if (!assigned) {
                    initialGroups.none.push(consultant);
                    console.log(`📝 ${consultant.name} assigned to 'none' group`);
                }
            });

            setGroups(initialGroups);
        }
    }, [allConsultants, getParameterValue]);

    const onDropConsultant = useCallback((consultantId: string, toGroup: string) => {
        setGroups((prev) => {
            // Trouver le consultant et son groupe d'origine
            let fromGroup = 'none';
            for (const key of Object.keys(prev)) {
                if (prev[key].some((c) => c.id === consultantId)) {
                    fromGroup = key;
                    break;
                }
            }
            if (fromGroup === toGroup) return prev;
            const consultant = prev[fromGroup].find((c) => c.id === consultantId);
            if (!consultant) return prev;
            
            const newGroups = {
                ...prev,
                [fromGroup]: prev[fromGroup].filter((c) => c.id !== consultantId),
                [toGroup]: [...prev[toGroup], consultant],
            };

            // Update consultant groups in store immediately
            const consultantGroupsData: { [key: string]: string[] } = {};
            Object.entries(newGroups).forEach(([groupId, consultants]) => {
                if (consultants.length > 0) {
                    consultantGroupsData[groupId] = consultants.map(c => c.id);
                }
            });
            updateParameterValue(ApplicationParameterName.CONSULTANT_GROUPS, JSON.stringify(consultantGroupsData));

            return newGroups;
        });
    }, [updateParameterValue]);

    return (
        <div className="space-y-8">
            <section>
                <h2 className="mb-4 text-lg font-bold">{t('settings.sdr.consultantGroups')}</h2>
                <DndProvider backend={HTML5Backend}>
                    <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-5">
                        <GroupColumn
                            groupId="none"
                            consultants={groups['none']}
                            onDropConsultant={onDropConsultant}
                            title={t('settings.sdr.noGroup')}
                        />
                        {GROUPS.map((g, index) => (
                            <GroupColumn
                                key={g}
                                groupId={g.toString()}
                                consultants={groups[g.toString()]}
                                onDropConsultant={onDropConsultant}
                                title={`${t('settings.sdr.group')} ${index + 1}`}
                            />
                        ))}
                    </div>
                </DndProvider>
            </section>
            <section>
                <h2 className="mb-4 text-lg font-bold">{t('settings.sdr.formR1')}</h2>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <Input
                        name="formMinDownPayment"
                        label={t('settings.sdr.minDownPayment')}
                        type="number"
                        value={getFormValue(ApplicationParameterName.FORM_MIN_DOWN_PAYMENT)}
                        onChange={(e) => handleFieldChange(ApplicationParameterName.FORM_MIN_DOWN_PAYMENT, e.target.value)}
                        placeholder="50000"
                    />
                    <Input
                        name="formMediumDownPayment"
                        label={t('settings.sdr.mediumDownPayment')}
                        type="number"
                        value={getFormValue(ApplicationParameterName.FORM_MEDIUM_DOWN_PAYMENT)}
                        onChange={(e) => handleFieldChange(ApplicationParameterName.FORM_MEDIUM_DOWN_PAYMENT, e.target.value)}
                        placeholder="100000"
                    />
                    <Input
                        name="formMaxDownPayment"
                        label={t('settings.sdr.maxDownPayment')}
                        type="number"
                        value={getFormValue(ApplicationParameterName.FORM_MAX_DOWN_PAYMENT)}
                        onChange={(e) => handleFieldChange(ApplicationParameterName.FORM_MAX_DOWN_PAYMENT, e.target.value)}
                        placeholder="200000"
                    />
                    <Input
                        name="formMinSaving"
                        label={t('settings.sdr.minSaving')}
                        type="number"
                        value={getFormValue(ApplicationParameterName.FORM_MIN_SAVING)}
                        onChange={(e) => handleFieldChange(ApplicationParameterName.FORM_MIN_SAVING, e.target.value)}
                        placeholder="10000"
                    />
                    <Input
                        name="formMediumSaving"
                        label={t('settings.sdr.mediumSaving')}
                        type="number"
                        value={getFormValue(ApplicationParameterName.FORM_MEDIUM_SAVING)}
                        onChange={(e) => handleFieldChange(ApplicationParameterName.FORM_MEDIUM_SAVING, e.target.value)}
                        placeholder="50000"
                    />
                    <Input
                        name="annualIncome"
                        label={t('settings.sdr.annualIncome')}
                        type="number"
                        value={getFormValue(ApplicationParameterName.ANNUAL_INCOME_THRESHOLD)}
                        onChange={(e) => handleFieldChange(ApplicationParameterName.ANNUAL_INCOME_THRESHOLD, e.target.value)}
                        placeholder="60000"
                    />
                </div>
            </section>
            <section>
                <h2 className="mb-4 text-lg font-bold">{t('settings.sdr.sdrParameters')}</h2>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <Input
                        name="sdrParameterBonus"
                        label={t('settings.sdr.sdrParameterBonus')}
                        type="number"
                        value={getFormValue(ApplicationParameterName.SDR_PARAMETER_BONUS)}
                        onChange={(e) => handleFieldChange(ApplicationParameterName.SDR_PARAMETER_BONUS, e.target.value)}
                        placeholder="100"
                    />
                    <Input
                        name="nbCallWithoutAnswer"
                        label={t('settings.sdr.nbCallWithoutAnswer')}
                        type="number"
                        value={getFormValue(ApplicationParameterName.NB_CALL_WITHOUT_ANSWER)}
                        onChange={(e) => handleFieldChange(ApplicationParameterName.NB_CALL_WITHOUT_ANSWER, e.target.value)}
                        placeholder="3"
                    />
                    <Input
                        name="callRepartition"
                        label={t('settings.sdr.callRepartition')}
                        type="number"
                        value={getFormValue(ApplicationParameterName.CALL_REPARTITION)}
                        onChange={(e) => handleFieldChange(ApplicationParameterName.CALL_REPARTITION, e.target.value)}
                        placeholder="50"
                    />
                    <Input
                        name="maxMeetingsPerWeek"
                        label={t('settings.sdr.maxMeetingsPerWeek')}
                        type="number"
                        value={getFormValue(ApplicationParameterName.MAX_MEETINGS_PER_WEEK)}
                        onChange={(e) => handleFieldChange(ApplicationParameterName.MAX_MEETINGS_PER_WEEK, e.target.value)}
                        placeholder="10"
                    />
                </div>
            </section>
        </div>
    );
};

SettingsSDR.displayName = 'SettingsSDR';

export default SettingsSDR;
