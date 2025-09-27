import { create } from 'zustand';

export interface BreadcrumbItem {
    label: string;
    href: string;
    isClickable?: boolean;
}

interface BreadcrumbState {
    breadcrumbs: BreadcrumbItem[];
    setBreadcrumbs: (breadcrumbs: BreadcrumbItem[]) => void;
    addBreadcrumb: (breadcrumb: BreadcrumbItem) => void;
    resetToDefault: () => void;
}

const defaultBreadcrumb: BreadcrumbItem = {
    label: 'Cash Flow Positif',
    href: '/folders',
    isClickable: true,
};

export const useBreadcrumbStore = create<BreadcrumbState>((set) => ({
    breadcrumbs: [defaultBreadcrumb],

    setBreadcrumbs: (breadcrumbs) => set({ breadcrumbs }),

    addBreadcrumb: (breadcrumb) =>
        set((state) => ({
            breadcrumbs: [...state.breadcrumbs, breadcrumb],
        })),

    resetToDefault: () => set({ breadcrumbs: [defaultBreadcrumb] }),
}));
