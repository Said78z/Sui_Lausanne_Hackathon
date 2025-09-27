import { breadcrumbService } from '@/services/breadcrumbService';

import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useParams } from 'react-router-dom';

import { type BreadcrumbItem, useBreadcrumbStore } from '@/stores/breadcrumbStore';

// Mapping des routes vers les labels de traduction
const routeLabels: Record<string, string> = {
    '/folders': 'sidebar.sections.index.items.folders',
    '/address-book': 'sidebar.sections.index.items.addressBook',
    '/opportunities': 'sidebar.sections.index.items.opportunities',
    '/messages': 'messages.centerTitle',
    '/dashboard': 'sidebar.sections.tools.items.dashboard',
    '/users': 'sidebar.sections.tools.items.users',
    '/powerdialer': 'sidebar.sections.tools.items.powerdialer',
    '/cities': 'sidebar.sections.tools.items.cities',
    '/profil': 'sidebar.sections.management.items.settings',
    '/admin': 'sidebar.sections.administration.items.admin',
    '/settings': 'sidebar.sections.administration.items.settings',
    '/notifications-hub': 'notifications.title',
};

// Mapping des routes dynamiques avec service asynchrone
const dynamicRouteLabels: Record<string, (params: any, t: any) => Promise<string> | string> = {
    '/folder/:id': async (params) => await breadcrumbService.getFolderName(params.id),
    '/folder/:id/search-definition': () => 'Définition de recherche',
    '/client/:id': async (params) => await breadcrumbService.getClientName(params.id),
    '/agent/:id': async (params) => await breadcrumbService.getAgentName(params.id),
    '/lead/:id': async (params) => await breadcrumbService.getLeadName(params.id),
    '/cgp/:id': async (params) => await breadcrumbService.getCgpName(params.id),
    '/opportunity/:id': async (params) => await breadcrumbService.getOpportunityName(params.id),
    '/city/:id': async (params) => await breadcrumbService.getCityName(params.id),
    '/messages/:id': async (params) => await breadcrumbService.getConversationName(params.id),
};

export const useBreadcrumb = () => {
    const location = useLocation();
    const params = useParams();
    const { t } = useTranslation();
    const [isLoading, setIsLoading] = useState(false);

    // Mémoriser les valeurs pour éviter les re-renders inutiles
    const pathname = location.pathname;
    const paramsKey = useMemo(() => JSON.stringify(params), [params]);

    useEffect(() => {
        let isCancelled = false;

        const updateBreadcrumbs = async () => {
            if (isCancelled) return;

            setIsLoading(true);

            try {
                const breadcrumbs: BreadcrumbItem[] = [
                    {
                        label: 'Cash Flow Positif',
                        href: '/folders',
                        isClickable: true,
                    },
                ];

                // Fonction pour trouver la route parent dans la sidebar
                const getParentRoute = (currentPath: string): string | null => {
                    if (currentPath.startsWith('/folder/')) return '/folders';
                    if (
                        currentPath.startsWith('/client/') ||
                        currentPath.startsWith('/agent/') ||
                        currentPath.startsWith('/lead/') ||
                        currentPath.startsWith('/cgp/')
                    )
                        return '/address-book';
                    if (currentPath.startsWith('/opportunity/')) return '/opportunities';
                    if (currentPath.startsWith('/city/')) return '/cities';
                    if (currentPath.startsWith('/messages/')) return '/messages';
                    if (currentPath.startsWith('/notifications-hub')) return '/dashboard';
                    return null;
                };

                // Ajouter la route parent si elle existe et est différente de la route actuelle
                // Exception : ne pas ajouter de parent pour /folders car "Cash Flow Positif" pointe déjà vers /folders
                const parentRoute = getParentRoute(pathname);
                if (parentRoute && parentRoute !== pathname && pathname !== '/folders') {
                    const parentLabel = routeLabels[parentRoute];
                    if (parentLabel) {
                        breadcrumbs.push({
                            label: t(parentLabel),
                            href: parentRoute,
                            isClickable: true,
                        });
                    }
                }

                // Ajouter la route actuelle
                // Toujours ajouter la page actuelle, même si c'est /folders
                const staticLabel = routeLabels[pathname];
                if (staticLabel) {
                    // Pour /folders, on l'ajoute même si c'est la même route que "Cash Flow Positif"
                    breadcrumbs.push({
                        label: t(staticLabel),
                        href: pathname,
                        isClickable: false,
                    });
                } else {
                    // Vérifier si c'est une route dynamique
                    let dynamicLabel = null;
                    for (const [pattern, labelFn] of Object.entries(dynamicRouteLabels)) {
                        const regex = new RegExp('^' + pattern.replace(/:[^/]+/g, '([^/]+)') + '$');
                        if (regex.test(pathname)) {
                            try {
                                const result = labelFn(params, t);
                                dynamicLabel = await Promise.resolve(result);
                            } catch (error) {
                                console.error(
                                    "Erreur lors de la récupération du nom de l'entité:",
                                    error
                                );
                                // Fallback vers un nom générique
                                dynamicLabel = `Élément ${params.id || 'inconnu'}`;
                            }
                            break;
                        }
                    }

                    if (dynamicLabel) {
                        breadcrumbs.push({
                            label: dynamicLabel,
                            href: pathname,
                            isClickable: false,
                        });
                    }
                }

                if (!isCancelled) {
                    // Utiliser getState().setBreadcrumbs pour éviter les re-renders
                    useBreadcrumbStore.getState().setBreadcrumbs(breadcrumbs);
                }
            } catch (error) {
                console.error('Erreur lors de la mise à jour des breadcrumbs:', error);
            } finally {
                if (!isCancelled) {
                    setIsLoading(false);
                }
            }
        };

        updateBreadcrumbs();

        // Cleanup function pour annuler les opérations en cours
        return () => {
            isCancelled = true;
        };
    }, [pathname, paramsKey, t]); // Retirer setBreadcrumbs des dépendances

    return { isLoading };
};
