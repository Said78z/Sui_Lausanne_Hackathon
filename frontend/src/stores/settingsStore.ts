import { ApplicationParameterDto } from '@shared/dto';
import { create } from 'zustand';

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

            // Get existing parameter or create a new one if it doesn't exist
            const existingParam = state.parametersMap[name];
            if (!existingParam) {
                console.warn(`Parameter ${name} not found in parametersMap, creating new one`);
                // Create a new parameter entry
                const newParam = {
                    id: '', // Will be generated when saved
                    name,
                    value,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };

                return {
                    parametersMap: {
                        ...state.parametersMap,
                        [name]: newParam
                    },
                    modifiedParameters: newModified
                };
            }

            return {
                parametersMap: {
                    ...state.parametersMap,
                    [name]: {
                        ...existingParam,
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
