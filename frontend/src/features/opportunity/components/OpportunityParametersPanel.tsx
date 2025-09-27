import { useEffect, useRef, useState } from 'react';

import { ChevronDown, ChevronUp, Save, Settings } from 'lucide-react';

import { Button } from '@/components/ui/Button/Button';
import { Input } from '@/components/ui/Input/Input';
import { SelectInput } from '@/components/ui/SelectInput/SelectInput';
import { Switch } from '@/components/ui/Switch/Switch';

interface OpportunityParameters {
    annualAppreciation: number;
    loanDuration: number;
    interestRate: number;
    initialDeposit: number;
    contribution: number;
    works: number;
    fiscalRegime: string;
    fiscalParts: number;
    rentalIncomeHC: number;
    salary: number;
    accountant: boolean;
    gliInsurance: boolean;
    occupancyGuarantee: boolean;
}

interface OpportunityParametersPanelProps {
    parameters: OpportunityParameters;
    onParametersChange: (parameters: OpportunityParameters) => void;
}

export function OpportunityParametersPanel({
    parameters,
    onParametersChange,
}: OpportunityParametersPanelProps) {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isManuallyControlled, setIsManuallyControlled] = useState(false);
    const [headerHeight, setHeaderHeight] = useState(0);
    const [headerPosition, setHeaderPosition] = useState<'static' | 'fixed' | 'absolute'>('static');
    const [containerWidth, setContainerWidth] = useState(0);
    const [containerLeft, setContainerLeft] = useState(0);

    const headerRef = useRef<HTMLDivElement>(null);
    const placeholderRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const fiscalRegimeOptions = [
        { label: 'Micro-foncier', value: 'MICRO' },
        { label: 'Réel', value: 'REEL' },
        { label: 'IS', value: 'IS' },
        { label: 'LMNP', value: 'LMNP' },
    ];

    useEffect(() => {
        if (headerRef.current) {
            setHeaderHeight(headerRef.current.offsetHeight);
        }
    }, []);

    useEffect(() => {
        if (headerRef.current) {
            setHeaderHeight(headerRef.current.offsetHeight);
        }
    }, [isCollapsed]);

    useEffect(() => {
        const handleScroll = () => {
            if (headerRef.current && containerRef.current) {
                const containerRect = containerRef.current.getBoundingClientRect();
                const scrollPosition = window.scrollY;

                // Calculer la largeur et position du conteneur
                setContainerWidth(containerRect.width);
                setContainerLeft(containerRect.left);

                // Chercher le FinancialSimulationChart dans la page
                const financialSection = document.getElementById('financial-simulation-section');
                let stopPosition = Infinity;

                if (financialSection) {
                    const sectionRect = financialSection.getBoundingClientRect();
                    stopPosition = sectionRect.top + window.scrollY - 120; // S'arrêter 120px avant la section
                }

                // Quand on scroll et que le container sort de la vue
                if (containerRect.bottom < 100) {
                    // Vérifier si on a atteint la position d'arrêt
                    if (scrollPosition + 24 >= stopPosition) {
                        // Le header doit s'arrêter en position absolute
                        setHeaderPosition('absolute');
                        // Ne pas forcer le collapse si l'utilisateur contrôle manuellement
                        if (!isManuallyControlled && !isCollapsed) {
                            setIsCollapsed(true);
                        }
                    } else {
                        // Le header continue à suivre en mode fixed
                        setHeaderPosition('fixed');
                        // Ne pas forcer le collapse si l'utilisateur contrôle manuellement
                        if (!isManuallyControlled && !isCollapsed) {
                            setIsCollapsed(true);
                        }
                    }
                } else {
                    setHeaderPosition('static');
                    // Quand on revient en position statique, remettre le contrôle automatique
                    if (isManuallyControlled) {
                        setIsManuallyControlled(false);
                    }
                    // Ne pas forcer l'expansion si l'utilisateur contrôle manuellement
                    if (!isManuallyControlled && isCollapsed && containerRect.top > -100) {
                        setIsCollapsed(false);
                    }
                }
            }
        };

        window.addEventListener('scroll', handleScroll);
        window.addEventListener('resize', handleScroll);
        handleScroll();

        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('resize', handleScroll);
        };
    }, [isCollapsed, isManuallyControlled]);

    const handleParameterChange = (key: keyof OpportunityParameters, value: any) => {
        onParametersChange({
            ...parameters,
            [key]: value,
        });
    };

    return (
        <div className="relative mb-6" ref={containerRef}>
            <div
                ref={placeholderRef}
                style={{ height: headerPosition === 'fixed' ? `${headerHeight}px` : '0px' }}
            />

            <div
                ref={headerRef}
                className={`rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-300 ease-out ${
                    headerPosition === 'fixed'
                        ? 'fixed top-6 z-50 px-6 py-4 shadow-lg'
                        : headerPosition === 'absolute'
                          ? 'absolute z-40 px-6 py-4 shadow-lg'
                          : 'p-6'
                }`}
                style={
                    headerPosition === 'fixed'
                        ? {
                              width: `${containerWidth}px`,
                              left: `${containerLeft}px`,
                          }
                        : headerPosition === 'absolute'
                          ? {
                                width: `${containerWidth}px`,
                                left: `0px`,
                                bottom: `-${headerHeight + 20}px`, // Se positionner en bas du conteneur
                            }
                          : {}
                }
            >
                {/* En-tête */}
                <div
                    className={`flex items-center justify-between transition-all duration-300 ${
                        isCollapsed ? 'mb-0' : 'mb-6'
                    }`}
                >
                    <div className="flex items-center gap-4">
                        <Settings className="h-5 w-5 text-gray-600" />
                        <h2 className="text-lg font-semibold text-gray-900">
                            Modifier les paramètres de l'opportunité
                        </h2>
                        <button
                            onClick={() => {
                                setIsCollapsed(!isCollapsed);
                                setIsManuallyControlled(true);
                            }}
                            className="rounded-lg p-2 transition-colors hover:bg-gray-100"
                            aria-label={isCollapsed ? 'Étendre le panneau' : 'Réduire le panneau'}
                        >
                            {isCollapsed ? (
                                <ChevronDown className="h-4 w-4 text-gray-500" />
                            ) : (
                                <ChevronUp className="h-4 w-4 text-gray-500" />
                            )}
                        </button>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button
                            variant="primary"
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium"
                            onClick={() => {
                                console.log('Sauvegarde des paramètres:', parameters);
                            }}
                        >
                            <Save className="h-4 w-4" />
                            Sauvegarder
                        </Button>
                        <Button
                            variant="primary"
                            className="px-4 py-2 text-sm font-medium"
                            onClick={() => {
                                console.log('Application des paramètres:', parameters);
                            }}
                        >
                            ✓ Appliquer
                        </Button>
                    </div>
                </div>

                {/* Paramètres */}
                <div
                    className={`transition-all duration-500 ease-in-out ${
                        isCollapsed
                            ? 'pointer-events-none max-h-0 opacity-0'
                            : 'max-h-none opacity-100'
                    }`}
                    style={{
                        overflow: isCollapsed ? 'hidden' : 'visible',
                    }}
                >
                    <div className="grid grid-cols-5 gap-4">
                        {/* Première ligne */}
                        <div>
                            <Input
                                label="Plus-value annuelle"
                                name="annualAppreciation"
                                type="number"
                                value={parameters.annualAppreciation.toString()}
                                onChange={(e) =>
                                    handleParameterChange(
                                        'annualAppreciation',
                                        Number(e.target.value)
                                    )
                                }
                                rightIcon={
                                    <span className="border-l border-gray-300 pl-2 text-sm text-gray-500">
                                        %
                                    </span>
                                }
                            />
                        </div>

                        <div>
                            <Input
                                label="Durée emprunt"
                                name="loanDuration"
                                type="number"
                                value={parameters.loanDuration.toString()}
                                onChange={(e) =>
                                    handleParameterChange('loanDuration', Number(e.target.value))
                                }
                                rightIcon={
                                    <span className="border-l border-gray-300 pl-2 text-sm text-gray-500">
                                        {' '}
                                        ans
                                    </span>
                                }
                            />
                        </div>

                        <div>
                            <Input
                                label="Intérêt (hors assurance)"
                                name="interestRate"
                                type="number"
                                value={parameters.interestRate.toString()}
                                onChange={(e) =>
                                    handleParameterChange('interestRate', Number(e.target.value))
                                }
                                rightIcon={
                                    <span className="border-l border-gray-300 pl-2 text-sm text-gray-500">
                                        %
                                    </span>
                                }
                            />
                        </div>

                        <div>
                            <Input
                                label="Décalage initial"
                                name="initialDeposit"
                                type="number"
                                value={parameters.initialDeposit.toString()}
                                onChange={(e) =>
                                    handleParameterChange('initialDeposit', Number(e.target.value))
                                }
                                rightIcon={
                                    <span className="border-l border-gray-300 pl-2 text-sm text-gray-500">
                                        an
                                    </span>
                                }
                            />
                        </div>

                        <div>
                            <Input
                                label="Apport"
                                name="contribution"
                                type="number"
                                value={parameters.contribution.toString()}
                                onChange={(e) =>
                                    handleParameterChange('contribution', Number(e.target.value))
                                }
                                rightIcon={
                                    <span className="border-l border-gray-300 pl-2 text-sm text-gray-500">
                                        €
                                    </span>
                                }
                            />
                        </div>

                        {/* Deuxième ligne */}
                        <div>
                            <Input
                                label="Travaux"
                                name="works"
                                type="number"
                                value={parameters.works.toString()}
                                onChange={(e) =>
                                    handleParameterChange('works', Number(e.target.value))
                                }
                                rightIcon={
                                    <span className="border-l border-gray-300 pl-2 text-sm text-gray-500">
                                        €
                                    </span>
                                }
                            />
                        </div>

                        <div style={{ zIndex: 10 }}>
                            <SelectInput
                                label="Régime fiscal"
                                name="fiscalRegime"
                                value={parameters.fiscalRegime}
                                onChange={(value) => handleParameterChange('fiscalRegime', value)}
                                options={fiscalRegimeOptions}
                            />
                        </div>

                        <div>
                            <Input
                                label="Parts Fiscales"
                                name="fiscalParts"
                                type="number"
                                value={parameters.fiscalParts.toString()}
                                onChange={(e) =>
                                    handleParameterChange('fiscalParts', Number(e.target.value))
                                }
                            />
                        </div>

                        <div>
                            <Input
                                label="Revenu locatif HC"
                                name="rentalIncomeHC"
                                type="number"
                                value={parameters.rentalIncomeHC.toString()}
                                onChange={(e) =>
                                    handleParameterChange('rentalIncomeHC', Number(e.target.value))
                                }
                                rightIcon={
                                    <span className="border-l border-gray-300 pl-2 text-sm text-gray-500">
                                        €
                                    </span>
                                }
                            />
                        </div>

                        <div>
                            <Input
                                label="Salaire"
                                name="salary"
                                type="number"
                                value={parameters.salary.toString()}
                                onChange={(e) =>
                                    handleParameterChange('salary', Number(e.target.value))
                                }
                                rightIcon={
                                    <span className="border-l border-gray-300 pl-2 text-sm text-gray-500">
                                        €
                                    </span>
                                }
                            />
                        </div>
                    </div>

                    {/* Switches */}
                    <div className="mt-6 flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <Switch
                                checked={parameters.accountant}
                                onChange={(checked) => handleParameterChange('accountant', checked)}
                                label="Comptable"
                            />

                            <Switch
                                checked={parameters.gliInsurance}
                                onChange={(checked) =>
                                    handleParameterChange('gliInsurance', checked)
                                }
                                label="Assurance GLI"
                            />

                            <Switch
                                checked={parameters.occupancyGuarantee}
                                onChange={(checked) =>
                                    handleParameterChange('occupancyGuarantee', checked)
                                }
                                label="Garantie Occupation"
                            />
                        </div>

                        <button className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50">
                            Créer un scénario complexe
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export type { OpportunityParameters };
