import { useCitiesByIds, usePortalActivities } from '@/api/queries';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components';
import { ActivityType } from '@shared/dto';
import { Building2, Eye, Heart, TrendingUp } from 'lucide-react';
import { useMemo } from 'react';

// Import local JSON data for investment prices
import investmentPrices from '@/data/investmentPrices.json';

interface MarketplaceActionsProps {
    prospectId: string;
    userId?: string; // Optional userId from prospect data
}

const getActivityIcon = (type: ActivityType) => {
    switch (type) {
        case 'VIEW_OPPORT':
            return <TrendingUp size={16} className="text-primary" />;
        case 'VIEW_CITY':
            return <Eye size={16} className="text-primary" />;
        case 'LIKE':
            return <Heart size={16} className="text-primary" />;
        default:
            return <Building2 size={16} className="text-primary" />;
    }
};

const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(price);
};

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function MarketplaceActions({ prospectId, userId }: MarketplaceActionsProps) {
    // TODO: Use prospectId for future filtering or additional data fetching
    // Currently using userId to fetch portal activities
    
    // Fetch portal activities for the user
    const { data: allActivities = [], isLoading } = usePortalActivities({
        userId: userId || undefined,
    });

    // Filter and group activities
    const { citySearches, actions, cityIds } = useMemo(() => {
        const citySearches = allActivities.filter(activity => activity.type === 'VIEW_CITY');
        const actions = allActivities.filter(activity => ['VIEW_OPPORT', 'LIKE'].includes(activity.type));
        
        // Extract unique city IDs from all activities
        const cityIds = [...new Set(allActivities.map(activity => activity.cityId))];
        
        return { citySearches, actions, cityIds };
    }, [allActivities]);

    // Fetch cities data
    const { data: citiesData = {}, isLoading: citiesLoading } = useCitiesByIds(cityIds);

    if (isLoading || citiesLoading) {
        return (
            <div className="relative w-full rounded-xl border border-gray-200 bg-white p-10">
                <div className="absolute left-0 top-1/2 h-2/3 w-1 -translate-y-1/2 bg-tertiary"></div>
                <h2 className="mb-6 text-sm text-gray-600">Actions marketplace</h2>
                <div className="text-center text-gray-500">Chargement...</div>
            </div>
        );
    }
    return (
        <div className="relative w-full rounded-xl border border-gray-200 bg-white p-10">
            <div className="absolute left-0 top-1/2 h-2/3 w-1 -translate-y-1/2 bg-tertiary"></div>
            <h2 className="mb-6 text-sm text-gray-600">Actions marketplace</h2>
            <div className="space-y-6">
                <div>
                    <h3 className="mb-2 text-lg font-semibold">Villes recherchées</h3>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Type</TableHead>
                                <TableHead>Ville</TableHead>
                                <TableHead>Date</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {citySearches.length > 0 ? (
                                citySearches.map((activity) => (
                                    <TableRow key={activity.id}>
                                        <TableCell>{getActivityIcon(activity.type)}</TableCell>
                                        <TableCell>{citiesData[activity.cityId]?.name || 'Ville inconnue'}</TableCell>
                                        <TableCell>{formatDate(activity.createdAt)}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center text-gray-500">
                                        Aucune recherche de ville
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
                
                <div>
                    <h3 className="mb-2 text-lg font-semibold">Actions</h3>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Type</TableHead>
                                <TableHead>Prix globale</TableHead>
                                <TableHead>Apport min</TableHead>
                                <TableHead>Ville</TableHead>
                                <TableHead>Date de l'action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {actions.length > 0 ? (
                                actions.map((activity) => {
                                    const priceData = activity.jsonId ? 
                                        investmentPrices[activity.jsonId as keyof typeof investmentPrices] : 
                                        null;
                                    
                                    return (
                                        <TableRow key={activity.id}>
                                            <TableCell>
                                                <div className="flex items-center">
                                                    {getActivityIcon(activity.type)}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {priceData ? formatPrice(priceData.prixGlobale) : 'N/A'}
                                            </TableCell>
                                            <TableCell>
                                                {priceData ? formatPrice(priceData.apportMin) : 'N/A'}
                                            </TableCell>
                                            <TableCell>
                                                {citiesData[activity.cityId]?.name || 'Ville inconnue'}
                                            </TableCell>
                                            <TableCell>{formatDate(activity.createdAt)}</TableCell>
                                        </TableRow>
                                    );
                                })
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center text-gray-500">
                                        Aucune action d'investissement
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
}
