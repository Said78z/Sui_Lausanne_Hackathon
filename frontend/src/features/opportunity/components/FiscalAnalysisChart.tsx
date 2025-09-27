import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export function FiscalAnalysisChart() {
    // Données pour Cash Flow Positif vs Effort d'Épargne
    const cashFlowData = [
        { name: 'SCI - IS', value: -21000 },
        { name: 'Régime Réel', value: -21500 },
        { name: 'Régime Réel NR Hors EEE', value: -22000 },
        { name: 'Régime Réel NR EEE', value: -22500 },
        { name: 'Micro-Foncier', value: -23000 },
        { name: 'LMNP - Micro-BIC', value: -23500 },
        { name: 'LMNP - Réel', value: -24000 },
    ];

    // Données pour Création de valeur nette en année 10
    const valueYear10Data = [
        { name: 'SCI - IS', value: -5000 },
        { name: 'Régime Réel', value: -15000 },
        { name: 'Régime Réel NR Hors EEE', value: -40000 },
        { name: 'Régime Réel NR EEE', value: -25000 },
        { name: 'Micro-Foncier', value: -60000 },
        { name: 'LMNP - Micro-BIC', value: -65000 },
        { name: 'LMNP - Réel', value: -62000 },
    ];

    // Données pour Création de valeur nette en année 20
    const valueYear20Data = [
        { name: 'SCI - IS', value: 15000 },
        { name: 'Régime Réel', value: 20000 },
        { name: 'Régime Réel NR Hors EEE', value: 25000 },
        { name: 'Régime Réel NR EEE', value: 50000 },
        { name: 'Micro-Foncier', value: 52000 },
        { name: 'LMNP - Micro-BIC', value: 3000 },
        { name: 'LMNP - Réel', value: 2000 },
    ];

    // Données pour Taux marginal d'imposition
    const taxRateData = [
        { name: 'SCI - IS', value: 30 },
        { name: 'Régime Réel', value: 30 },
        { name: 'Régime Réel NR Hors EEE', value: 30 },
        { name: 'Régime Réel NR EEE', value: 30 },
        { name: 'Micro-Foncier', value: 30 },
        { name: 'LMNP - Micro-BIC', value: 30 },
        { name: 'LMNP - Réel', value: 30 },
    ];

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            const value = payload[0].value;
            return (
                <div className="rounded-lg border border-gray-200 bg-white p-3 text-black shadow-lg">
                    <p className="text-sm font-semibold">{label}</p>
                    <p className="text-sm">
                        {typeof value === 'number' && label.includes('Taux')
                            ? `${value}%`
                            : `${value.toLocaleString('fr-FR')} €`}
                    </p>
                </div>
            );
        }
        return null;
    };

    const ChartContainer = ({
        title,
        data,
        yAxisFormatter,
    }: {
        title: string;
        data: any[];
        yAxisFormatter?: (value: any) => string;
    }) => (
        <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">{title}</h4>
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 10, fill: '#9CA3AF' }}
                            angle={-45}
                            textAnchor="end"
                            height={80}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fill: '#9CA3AF' }}
                            tickFormatter={
                                yAxisFormatter || ((value) => `${value.toLocaleString('fr-FR')}`)
                            }
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="value" fill="#60A5FA" radius={[2, 2, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );

    return (
        <div className="space-y-8">
            {/* Titre et description */}
            <div className="space-y-4">
                <h3 className="text-xl font-semibold text-white">Analyse Fiscale</h3>
                <p className="text-sm text-gray-300">
                    Les graphiques ci-dessous comparent les performances financières de
                    l'opportunité en fonction du régime fiscal d'acquisition
                </p>
            </div>

            {/* Grille des 4 graphiques */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                {/* Cash Flow Positif vs Effort d'Épargne */}
                <ChartContainer
                    title="Cash Flow Positif vs Effort d'Épargne"
                    data={cashFlowData}
                    yAxisFormatter={(value) => `${value.toLocaleString('fr-FR')}€`}
                />

                {/* Création de valeur nette en année 10 */}
                <ChartContainer
                    title="Création de valeur nette en année 10"
                    data={valueYear10Data}
                    yAxisFormatter={(value) => `${value.toLocaleString('fr-FR')}€`}
                />

                {/* Création de valeur nette en année 20 */}
                <ChartContainer
                    title="Création de valeur nette en année 20"
                    data={valueYear20Data}
                    yAxisFormatter={(value) => `${value.toLocaleString('fr-FR')}€`}
                />

                {/* Taux marginal d'imposition */}
                <ChartContainer
                    title="Taux marginal d'imposition"
                    data={taxRateData}
                    yAxisFormatter={(value) => `${value}%`}
                />
            </div>

            {/* Notes explicatives */}
            <div className="space-y-2 border-t border-gray-700 pt-6 text-xs text-gray-400">
                <p>
                    * Simulation générée avec l'hypothèse d'un report initial du remboursement de
                    l'emprunt de 1 an et d'un taux d'occupation de 100% pour une acquisition via une
                    SCI à l'IS dont les frais de notaire sont financés par un apport personnel et le
                    bien par un emprunt sur 20 ans à un taux de 2.9%. Le capital créé est calculé
                    comme la somme de la trésorerie actuelle et de la valeur du bien dont
                    l'augmentation est estimée à 2.5% par an. Cette simulation ne constitue en aucun
                    cas un engagement ou une garantie de la part de Cash Flow Positif mais une
                    évaluation du fonctionnement du bien en prenant en compte les surfaces et les
                    loyers.
                </p>
                <p>
                    ** Le Capital net correspond à une simulation du capital net créé en cas de
                    vente du bien immobilier et ceci calculé chaque année. Cette simulation repose
                    sur les mêmes hypothèses de calcul décrites ci-dessus et prend en compte le
                    montant de l'impôt sur les sociétés lié à la revente du bien.
                </p>
                <p>
                    *** Le Cash Flow est estimé en année 10. Les premières années il serait en effet
                    plus élevé car les charges diminuent le montant des impôts à payer.
                </p>
                <p>
                    **** Les surfaces sont estimées. Seules des attestations de surface peuvent
                    valider la surface réelle de chaque lot.
                </p>
            </div>
        </div>
    );
}
