import { useNavigate } from 'react-router-dom';

import { ChevronRight } from 'lucide-react';

import { useBreadcrumbStore } from '@/stores/breadcrumbStore';

export default function Breadcrumb() {
    const { breadcrumbs } = useBreadcrumbStore();
    const navigate = useNavigate();

    const handleBreadcrumbClick = (href: string, isClickable: boolean = true) => {
        if (isClickable) {
            navigate(href);
        }
    };

    return (
        <div className="flex items-center space-x-2">
            {breadcrumbs.map((breadcrumb, index) => (
                <div key={index} className="flex items-center space-x-2">
                    <span
                        className={`font-medium ${
                            breadcrumb.isClickable !== false
                                ? 'cursor-pointer text-blue-600 hover:text-blue-800'
                                : 'text-gray-700'
                        }`}
                        onClick={() =>
                            handleBreadcrumbClick(breadcrumb.href, breadcrumb.isClickable)
                        }
                    >
                        {breadcrumb.label}
                    </span>
                    {index < breadcrumbs.length - 1 && (
                        <ChevronRight size={16} className="text-gray-400" />
                    )}
                </div>
            ))}
        </div>
    );
}
