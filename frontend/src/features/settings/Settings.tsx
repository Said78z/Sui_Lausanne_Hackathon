import { Button } from '@/components';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';

import SettingsAutres from './components/SettingsAutres';
import SettingsSDR from './components/SettingsSDR';
import SettingsSourcing from './components/SettingsSourcing';

import { useCreateApplicationParameter, useUpdateApplicationParameter } from '@/api/queries/applicationParameterQueries';
import { useSettingsStore } from '@/stores/settingsStore';
import { ApplicationParameterName } from '@shared/enums';

export default function Settings() {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState('autres');
    const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
    const tabsRef = useRef<(HTMLButtonElement | null)[]>([]);
    const queryClient = useQueryClient();

    // Mutations pour sauvegarder
    const updateParameterMutation = useUpdateApplicationParameter();
    const createParameterMutation = useCreateApplicationParameter();

    // Zustand store - les paramètres sont déjà chargés via les queries
    const { 
        hasModifications, 
        getModifiedParameters,
        resetAllModifications,
        parameters,
        parametersMap
    } = useSettingsStore();

    // Debug: Log store state to see if data is being loaded
    useEffect(() => {
        console.log('🏪 Settings.tsx - Store parameters:', parameters);
        console.log('🏪 Settings.tsx - Store parametersMap:', parametersMap);
        console.log('🏪 Settings.tsx - Store parameters count:', parameters.length);
        console.log('🏪 Settings.tsx - hasModifications:', hasModifications());
    }, [parameters, parametersMap, hasModifications]);

    const tabs = useMemo(() => [
        { key: 'autres', label: t('settings.tabs.autres') },
        { key: 'sourcing', label: t('settings.tabs.sourcing') },
        { key: 'sdr', label: t('settings.tabs.sdr') },
    ], [t]);

    const updateIndicator = (activeIndex: number) => {
        const activeTabElement = tabsRef.current[activeIndex];
        if (activeTabElement) {
            setIndicatorStyle({
                left: activeTabElement.offsetLeft,
                width: activeTabElement.offsetWidth,
            });
        }
    };

    useEffect(() => {
        const activeIndex = tabs.findIndex((tab) => tab.key === activeTab);
        updateIndicator(activeIndex);
    }, [activeTab, tabs]);

    const handleTabClick = (tabKey: string) => {
        setActiveTab(tabKey);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!hasModifications()) {
            toast.info('Aucune modification à sauvegarder');
            return;
        }

        try {
            const modifiedParams = getModifiedParameters();
            
            // Debug: Log what we're trying to save
            console.log('🔧 Settings.tsx - Modified parameters:', modifiedParams);
            modifiedParams.forEach(param => {
                console.log(`🔧 Saving param: ${param.name} = "${param.value}" (length: ${param.value.length})`);
                if (param.name === ApplicationParameterName.POWER_DIALER_SLOTS) {
                    console.log('🎯 POWER_DIALER_SLOTS value details:', {
                        value: param.value,
                        length: param.value.length,
                        isValidJSON: (() => {
                            try {
                                JSON.parse(param.value);
                                return true;
                            } catch {
                                return false;
                            }
                        })()
                    });
                }
            });
            
            // Sauvegarde en parallèle de tous les paramètres modifiés
            const updatePromises = modifiedParams.map(param => {
                // Le param de getModifiedParameters() contient déjà l'ID car il vient de parametersMap
                if (param.id) {
                    // Mettre à jour un paramètre existant
                    return updateParameterMutation.mutateAsync({
                        id: param.id,
                        data: { value: param.value }
                    });
                } else {
                    // Créer un nouveau paramètre (cas rare où un paramètre n'existe pas encore)
                    return createParameterMutation.mutateAsync({
                        name: param.name,
                        value: param.value
                    });
                }
            });

            await Promise.all(updatePromises);
            
            // Reset modifications first to remove the "unsaved changes" indicator
            resetAllModifications();
            
            // Invalidate and refetch the application parameters cache
            // This will trigger a refetch and update the store via SettingsProvider
            await queryClient.invalidateQueries({
                queryKey: ['applicationParameters']
            });
            
            toast.success(t('settings.toast.settingsUpdated'));
            
        } catch (error) {
            toast.error(t('settings.toast.settingsUpdateError'));
            console.error('Erreur lors de la sauvegarde:', error);
        }
    };

    const isLoading = updateParameterMutation.isPending || createParameterMutation.isPending;

    return (
        <div className="w-full max-w-[calc(100vw-23rem)] px-4 py-4 font-sans text-gray-800">
            <h1 className="mb-6 text-xl font-bold sm:text-2xl">{t('settings.title')}</h1>

            {/* Onglets */}
            <div className="relative mb-6">
                <div className="flex gap-2 border-b border-gray-200">
                    {tabs.map((tab, index) => (
                        <button
                            key={tab.key}
                            ref={(el) => (tabsRef.current[index] = el)}
                            className={`relative z-10 px-4 py-2 font-medium transition-colors duration-200 ${
                                activeTab === tab.key
                                    ? 'text-primary'
                                    : 'text-gray-500 hover:text-primary'
                            }`}
                            onClick={() => handleTabClick(tab.key)}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
                <div
                    className="absolute bottom-0 h-0.5 bg-primary transition-all duration-300 ease-in-out"
                    style={{
                        left: `${indicatorStyle.left}px`,
                        width: `${indicatorStyle.width}px`,
                    }}
                />
            </div>

            {/* Contenu dynamique selon l'onglet */}
            {activeTab === 'autres' && <SettingsAutres />}
            {activeTab === 'sourcing' && <SettingsSourcing />}
            {activeTab === 'sdr' && <SettingsSDR />}

            {/* Bouton de sauvegarde avec indicateur de modifications */}
            <div className="mt-4 flex justify-between items-center">
                {hasModifications() && (
                    <div className="text-sm text-orange-600 flex items-center">
                        <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                        Modifications non sauvegardées
                    </div>
                )}
                <div className="ml-auto">
                    <Button
                        type="button"
                        variant="primary"
                        onClick={handleSubmit}
                        isLoading={isLoading}
                        disabled={!hasModifications()}
                    >
                        {t('settings.save')}
                    </Button>
                </div>
            </div>
        </div>
    );
}
