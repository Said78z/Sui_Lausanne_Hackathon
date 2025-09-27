# Architecture des Paramètres d'Application

Ce document décrit l'implémentation d'un système de gestion des paramètres d'application dynamiques en utilisant Zustand pour l'état global et React Query pour la gestion des données.

## Vue d'ensemble

L'objectif est de créer un système qui :
- Récupère dynamiquement les paramètres depuis l'API
- Permet la modification en temps réel des valeurs
- Sauvegarde les changements de manière optimisée
- Réduit le code boilerplate avec des composants génériques

## 1. Queries React Query avec Auto-population du Store

### `/frontend/src/api/queries/applicationParameterQueries.ts`

```typescript
import { applicationParameterService } from '@/api/applicationParameterService';
import { 
    ApplicationParameterDto, 
    CreateApplicationParameterDto, 
    GetAllApplicationParameters, 
    UpdateApplicationParameterDto 
} from '@shared/dto';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { useSettingsStore } from '@/stores/settingsStore';

export const useApplicationParameters = (params: GetAllApplicationParameters = {}) => {
    const { setParameters } = useSettingsStore();
    
    return useQuery({
        queryKey: ['application-parameters', params],
        queryFn: async () => {
            const response = await applicationParameterService.getAllParameters(params);
            // Auto-population du store Zustand dès le chargement
            if (response.data) {
                setParameters(response.data);
            }
            return response.data;
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
    });
};

export const useApplicationParameterById = (id: string) => {
    return useQuery({
        queryKey: ['application-parameter', id],
        queryFn: async () => {
            const response = await applicationParameterService.getParameterById(id);
            return response.data;
        },
        enabled: !!id,
    });
};

export const useCreateApplicationParameter = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: (data: CreateApplicationParameterDto) => 
            applicationParameterService.createParameter(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['application-parameters'] });
            toast.success('Paramètre créé avec succès');
        },
        onError: (error: Error) => {
            toast.error(`Erreur lors de la création: ${error.message}`);
        },
    });
};

export const useUpdateApplicationParameter = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateApplicationParameterDto }) => 
            applicationParameterService.updateParameter(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['application-parameters'] });
            toast.success('Paramètre mis à jour avec succès');
        },
        onError: (error: Error) => {
            toast.error(`Erreur lors de la mise à jour: ${error.message}`);
        },
    });
};

export const useDeleteApplicationParameter = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: (id: string) => applicationParameterService.deleteParameter(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['application-parameters'] });
            toast.success('Paramètre supprimé avec succès');
        },
        onError: (error: Error) => {
            toast.error(`Erreur lors de la suppression: ${error.message}`);
        },
    });
};
```

## 2. Store Zustand

### `/frontend/src/stores/settingsStore.ts`

```typescript
import { create } from 'zustand';
import { ApplicationParameterDto } from '@shared/dto';

interface SettingsState {
    // État
    parameters: ApplicationParameterDto[];
    parametersMap: Record<string, ApplicationParameterDto>;
    modifiedParameters: Set<string>; // Track des paramètres modifiés
    
    // Actions pour la gestion des données
    setParameters: (parameters: ApplicationParameterDto[]) => void;
    updateParameterValue: (name: string, value: string) => void;
    resetParameter: (name: string) => void;
    resetAllModifications: () => void;
    
    // Helpers
    getParameterValue: (name: string) => string;
    getParametersByPattern: (patterns: string[]) => ApplicationParameterDto[];
    hasModifications: () => boolean;
    getModifiedParameters: () => ApplicationParameterDto[];
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
    // État initial
    parameters: [],
    parametersMap: {},
    modifiedParameters: new Set(),

    // Actions
    setParameters: (parameters) => {
        const parametersMap = parameters.reduce((acc, param) => {
            acc[param.name] = param;
            return acc;
        }, {} as Record<string, ApplicationParameterDto>);
        
        set({ 
            parameters, 
            parametersMap,
            modifiedParameters: new Set() // Reset modifications lors du chargement
        });
    },

    updateParameterValue: (name, value) => {
        set((state) => {
            const newModified = new Set(state.modifiedParameters);
            newModified.add(name);
            
            return {
                parametersMap: {
                    ...state.parametersMap,
                    [name]: {
                        ...state.parametersMap[name],
                        value
                    }
                },
                modifiedParameters: newModified
            };
        });
    },

    resetParameter: (name) => {
        set((state) => {
            const originalParam = state.parameters.find(p => p.name === name);
            if (!originalParam) return state;

            const newModified = new Set(state.modifiedParameters);
            newModified.delete(name);

            return {
                parametersMap: {
                    ...state.parametersMap,
                    [name]: { ...originalParam }
                },
                modifiedParameters: newModified
            };
        });
    },

    resetAllModifications: () => {
        const { parameters } = get();
        const parametersMap = parameters.reduce((acc, param) => {
            acc[param.name] = param;
            return acc;
        }, {} as Record<string, ApplicationParameterDto>);
        
        set({ 
            parametersMap,
            modifiedParameters: new Set()
        });
    },

    // Helpers
    getParameterValue: (name) => {
        return get().parametersMap[name]?.value || '';
    },

    getParametersByPattern: (patterns) => {
        return Object.values(get().parametersMap).filter(param => 
            patterns.some(pattern => 
                param.name.toLowerCase().includes(pattern.toLowerCase())
            )
        );
    },

    hasModifications: () => {
        return get().modifiedParameters.size > 0;
    },

    getModifiedParameters: () => {
        const { parametersMap, modifiedParameters } = get();
        return Array.from(modifiedParameters)
            .map(name => parametersMap[name])
            .filter(Boolean);
    }
}));
```

## 3. Composant d'Input Générique

### `/frontend/src/components/settings/ParameterInput.tsx`

```typescript
import React from 'react';
import { Input } from '@/components';
import { Switch } from '@/components/ui/Switch/Switch';
import { SelectInput } from '@/components/ui/SelectInput/SelectInput';
import { ApplicationParameterDto } from '@shared/dto';

interface ParameterInputProps {
    parameter: ApplicationParameterDto;
    value: string;
    onChange: (value: string) => void;
    options?: { value: string; label: string }[];
    disabled?: boolean;
}

export const ParameterInput: React.FC<ParameterInputProps> = ({
    parameter,
    value,
    onChange,
    options,
    disabled = false
}) => {
    // Détermine le type d'input basé sur le nom du paramètre
    const getInputType = () => {
        const name = parameter.name.toLowerCase();
        
        if (name.includes('enabled') || name.includes('active') || name.includes('autopilot')) {
            return 'boolean';
        }
        if (name.includes('time') || name.includes('Time')) {
            return 'time';
        }
        if (name.includes('percentage') || name.includes('yield') || name.includes('Yield') || 
            name.includes('downpayment') || name.includes('income') || name.includes('saving')) {
            return 'number';
        }
        if (options && options.length > 0) {
            return 'select';
        }
        if (name.includes('hours') || name.includes('days') || name.includes('threshold') || 
            name.includes('amount') || name.includes('size') || name.includes('meetings')) {
            return 'number';
        }
        return 'text';
    };

    const inputType = getInputType();
    
    // Détermine l'unité à afficher
    const getUnit = () => {
        const name = parameter.name.toLowerCase();
        if (name.includes('yield') || name.includes('percentage') || name.includes('downpayment')) {
            return '%';
        }
        if (name.includes('days')) {
            return 'jours';
        }
        if (name.includes('hours')) {
            return 'heures';
        }
        if (name.includes('income') || name.includes('saving') || name.includes('amount')) {
            return '€';
        }
        return null;
    };

    const unit = getUnit();
    const hasUnit = !!unit;

    if (inputType === 'boolean') {
        return (
            <Switch
                label={parameter.name}
                checked={value === 'true' || value === '1'}
                onChange={(checked) => onChange(checked ? 'true' : 'false')}
                disabled={disabled}
            />
        );
    }

    if (inputType === 'select') {
        return (
            <SelectInput
                name={parameter.name}
                label={parameter.name}
                options={options || []}
                value={value}
                onChange={onChange}
                disabled={disabled}
            />
        );
    }

    return (
        <div className="relative">
            <Input
                name={parameter.name}
                label={parameter.name}
                type={inputType === 'number' ? 'number' : inputType}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className={hasUnit ? 'pr-16' : ''}
                disabled={disabled}
                min={inputType === 'number' ? 0 : undefined}
                step={inputType === 'number' && parameter.name.includes('yield') ? 0.1 : undefined}
            />
            {hasUnit && (
                <span className="absolute right-3 top-8 text-sm text-gray-500">
                    {unit}
                </span>
            )}
        </div>
    );
};
```

## 4. Composant Settings Principal

### `/frontend/src/features/settings/Settings.tsx`

```typescript
import { Button } from '@/components';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';

import SettingsAutres from './components/SettingsAutres';
import SettingsSDR from './components/SettingsSDR';
import SettingsSourcing from './components/SettingsSourcing';

import { useUpdateApplicationParameter } from '@/api/queries/applicationParameterQueries';
import { useSettingsStore } from '@/stores/settingsStore';

export default function Settings() {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState('autres');
    const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
    const tabsRef = useRef<(HTMLButtonElement | null)[]>([]);

    // Mutations pour sauvegarder
    const updateParameterMutation = useUpdateApplicationParameter();

    // Zustand store - les paramètres sont déjà chargés via les queries
    const { 
        hasModifications, 
        getModifiedParameters,
        resetAllModifications 
    } = useSettingsStore();

    const tabs = [
        { key: 'autres', label: t('settings.tabs.autres') },
        { key: 'sourcing', label: t('settings.tabs.sourcing') },
        { key: 'sdr', label: t('settings.tabs.sdr') },
    ];

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
            
            // Sauvegarde en parallèle de tous les paramètres modifiés
            const updatePromises = modifiedParams.map(param =>
                updateParameterMutation.mutateAsync({
                    id: param.id,
                    data: { value: param.value }
                })
            );

            await Promise.all(updatePromises);
            resetAllModifications();
            toast.success(t('settings.toast.settingsUpdated'));
            
        } catch (error) {
            toast.error(t('settings.toast.settingsUpdateError'));
            console.error('Erreur lors de la sauvegarde:', error);
        }
    };

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
                        isLoading={updateParameterMutation.isPending}
                        disabled={!hasModifications()}
                    >
                        {t('settings.save')}
                    </Button>
                </div>
            </div>
        </div>
    );
}
```

## 5. Composant SettingsSourcing

### `/frontend/src/features/settings/components/SettingsSourcing.tsx`

```typescript
import { Button, Input } from '@/components';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SelectInput } from '@/components/ui/SelectInput/SelectInput';
import { useSettingsStore } from '@/stores/settingsStore';
import { ParameterInput } from '@/components/settings/ParameterInput';

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

export default function SettingsSourcing() {
    const { t } = useTranslation();
    
    // Store Zustand
    const { 
        getParameterValue, 
        getParametersByPattern,
        updateParameterValue 
    } = useSettingsStore();

    // Gestion des slots Power Dialer (logique métier spécifique)
    const [slots, setSlots] = useState<PowerDialerSlot[]>([
        { id: '1', startTime: '09:30', endTime: '10:30', strategy: 'completer_informations' },
        { id: '2', startTime: '10:30', endTime: '12:30', strategy: 'rendement_decroissant' },
        { id: '3', startTime: '12:30', endTime: '14:30', strategy: 'rendement_decroissant' },
        { id: '4', startTime: '14:30', endTime: '16:30', strategy: 'rendement_decroissant' },
        { id: '5', startTime: '16:30', endTime: '17:30', strategy: 'recherche_dediee' },
    ]);

    const addSlot = () => {
        const newSlot: PowerDialerSlot = {
            id: Date.now().toString(),
            startTime: '09:00',
            endTime: '10:00',
            strategy: 'rendement_decroissant',
        };
        setSlots([...slots, newSlot]);
    };

    const removeSlot = (id: string) => {
        setSlots(slots.filter((slot) => slot.id !== id));
    };

    const updateSlot = (id: string, field: keyof PowerDialerSlot, value: string) => {
        setSlots(slots.map((slot) => (slot.id === id ? { ...slot, [field]: value } : slot)));
    };

    return (
        <div className="space-y-8">
            {/* Section Nettoyage des opportunités */}
            <section>
                <h2 className="mb-4 text-lg font-bold">
                    {t('settings.sourcing.opportunityCleaning')}
                </h2>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {getParametersByPattern(['opportunitiesPerDossier', 'minPrequalifiedYield', 'minQualifiedYield', 'opportunityExpiration', 'relaunchDuration', 'callsBeforeUnavailable']).map(parameter => (
                        <ParameterInput
                            key={parameter.id}
                            parameter={parameter}
                            value={getParameterValue(parameter.name)}
                            onChange={(value) => updateParameterValue(parameter.name, value)}
                        />
                    ))}
                </div>
            </section>

            {/* Section Power Dialer Slots */}
            <section>
                <div className="flex justify-between">
                    <h2 className="mb-4 text-lg font-bold">
                        {t('settings.sourcing.powerDialerSlots')}
                    </h2>
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
                    {getParametersByPattern(['globalCallStrategy']).map(parameter => (
                        <ParameterInput
                            key={parameter.id}
                            parameter={parameter}
                            value={getParameterValue(parameter.name)}
                            onChange={(value) => updateParameterValue(parameter.name, value)}
                            options={strategyOptions}
                        />
                    ))}
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

            {/* Section Paramètres de tri par rendement */}
            <section>
                <h2 className="mb-4 text-lg font-bold">
                    {t('settings.sourcing.yieldSortingParameters')}
                </h2>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    {getParametersByPattern(['descendingOrderEnabled', 'minTargetedYield', 'maxTargetedYield']).map(parameter => (
                        <ParameterInput
                            key={parameter.id}
                            parameter={parameter}
                            value={getParameterValue(parameter.name)}
                            onChange={(value) => updateParameterValue(parameter.name, value)}
                        />
                    ))}
                </div>
            </section>

            {/* Section Seuils Power Dialer */}
            <section>
                <h2 className="mb-4 text-lg font-bold">
                    {t('settings.sourcing.powerDialerThresholds')}
                </h2>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    {getParametersByPattern(['minOpportunityThreshold', 'mediumOpportunityThreshold', 'maxOpportunityThreshold']).map(parameter => (
                        <ParameterInput
                            key={parameter.id}
                            parameter={parameter}
                            value={getParameterValue(parameter.name)}
                            onChange={(value) => updateParameterValue(parameter.name, value)}
                        />
                    ))}
                </div>
            </section>
        </div>
    );
}
```

## 6. Initialisation au Démarrage de l'App

### `/frontend/src/App.tsx` (ou composant racine)

```typescript
import { useApplicationParameters } from '@/api/queries/applicationParameterQueries';

function App() {
    // Chargement automatique des paramètres au démarrage de l'app
    // Le store Zustand sera automatiquement populé via le hook useApplicationParameters
    useApplicationParameters();

    return (
        <div className="App">
            {/* Reste de votre application */}
        </div>
    );
}

export default App;
```

### Alternative avec un Provider dédié

Si vous préférez une approche plus explicite, vous pouvez créer un Provider :

```typescript
// /frontend/src/providers/SettingsProvider.tsx
import React, { ReactNode } from 'react';
import { useApplicationParameters } from '@/api/queries/applicationParameterQueries';

interface SettingsProviderProps {
    children: ReactNode;
}

export const SettingsProvider: React.FC<SettingsProviderProps> = ({ children }) => {
    // Chargement automatique des paramètres
    const { isLoading, error } = useApplicationParameters();

    if (isLoading) {
        return <div>Chargement des paramètres...</div>;
    }

    if (error) {
        return <div>Erreur lors du chargement des paramètres</div>;
    }

    return <>{children}</>;
};
```

Puis l'utiliser dans votre App :

```typescript
// /frontend/src/App.tsx
import { SettingsProvider } from '@/providers/SettingsProvider';

function App() {
    return (
        <SettingsProvider>
            <div className="App">
                {/* Votre application */}
            </div>
        </SettingsProvider>
    );
}
```

## 7. Avantages de cette Architecture

### Séparation des Responsabilités
- **React Query**: Gestion du cache, synchronisation avec l'API, mutations
- **Zustand**: État local, modifications temporaires, logique métier
- **Composants**: Affichage et interactions utilisateur

### Performance
- Cache automatique avec React Query
- Modifications locales instantanées avec Zustand
- Sauvegarde optimisée en batch

### Maintenabilité
- Code générique réutilisable
- Logique centralisée dans le store
- Types TypeScript stricts
- Gestion d'erreur cohérente

### Flexibilité
- Support de tous types d'inputs
- Logique métier spécifique conservée
- Configuration par patterns de noms
- Extensions faciles

## 8. Utilisation

### Flux de données optimisé

1. **Chargement au démarrage**: Les paramètres sont chargés une seule fois au démarrage de l'app via React Query et automatiquement injectés dans le store Zustand
2. **Accès immédiat**: Les composants accèdent directement aux paramètres via le store Zustand sans avoir besoin de déclencher un chargement
3. **Modification temps réel**: Les changements sont stockés localement dans Zustand pour une UX fluide
4. **Sauvegarde intelligente**: Seuls les paramètres modifiés sont envoyés à l'API lors de la sauvegarde
5. **Synchronisation automatique**: React Query se charge de la synchronisation avec le backend et met à jour le store Zustand automatiquement

### Exemple d'utilisation dans un composant

```typescript
// Dans n'importe quel composant de votre app
import { useSettingsStore } from '@/stores/settingsStore';

export const MonComposant = () => {
    const { getParameterValue, updateParameterValue } = useSettingsStore();
    
    // Les paramètres sont déjà disponibles, pas besoin de loading state
    const maxOpportunities = getParameterValue('maxOpportunityThreshold');
    
    return (
        <div>
            <p>Seuil max: {maxOpportunities}</p>
            <button onClick={() => updateParameterValue('maxOpportunityThreshold', '100')}>
                Modifier
            </button>
        </div>
    );
};
```

### Performance et UX

- **Chargement unique**: Les paramètres ne sont chargés qu'une seule fois au démarrage
- **Accès instantané**: Aucun loading state nécessaire dans les composants Settings
- **Modifications fluides**: Les changements sont visibles immédiatement sans attendre l'API
- **Sauvegarde optimisée**: Batch des modifications pour réduire les appels API
- **Cache intelligent**: React Query gère automatiquement le cache et la revalidation

Cette architecture permet une gestion efficace et scalable des paramètres d'application avec une excellente expérience utilisateur et des performances optimales. 