import { opportunityService } from '@/api/opportunityService';

import React, { useEffect, useState } from 'react';

import type { GetAllOpportunities } from '@shared/dto';
import { OpportunityStatus, OpportunityType } from '@shared/dto';

interface OpportunityFiltersProps {
    onFilterChange: (filters: GetAllOpportunities) => void;
    initialFilters?: GetAllOpportunities;
    userRoles: string[];
}

export const OpportunityFilters: React.FC<OpportunityFiltersProps> = ({
    onFilterChange,
    initialFilters = {},
    userRoles,
}) => {
    const [filters, setFilters] = useState<GetAllOpportunities>(initialFilters);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadData = async () => {
            if (userRoles.includes('ROLE_OPPORTUNITY_FILTER_DEPARTMENT')) {
                try {
                    await opportunityService.getDepartments();
                } catch (err) {
                    setError('Erreur lors du chargement des départements');
                    console.error('Error loading departments:', err);
                }
            }

            try {
                await opportunityService.getAgencies();
            } catch (err) {
                setError('Erreur lors du chargement des agences');
                console.error('Error loading agencies:', err);
            }
        };

        loadData();
    }, [userRoles]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        const newFilters = { ...filters, [name]: value };
        setFilters(newFilters);
        onFilterChange(newFilters);
    };

    return (
        <div className="card mb-4">
            <div className="card-body">
                <h5 className="card-title mb-3">Filtres</h5>
                {error && <div className="alert alert-danger">{error}</div>}
                <div className="row g-3">
                    {/* Type */}
                    <div className="col-md-4">
                        <label htmlFor="type" className="form-label">
                            Type
                        </label>
                        <select
                            id="type"
                            name="type"
                            className="form-select"
                            value={filters.type || ''}
                            onChange={handleChange}
                        >
                            <option value="">Tous les types</option>
                            {Object.values(OpportunityType).map((type) => (
                                <option key={type} value={type}>
                                    {type}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Statut */}
                    <div className="col-md-4">
                        <label htmlFor="status" className="form-label">
                            Statut
                        </label>
                        <select
                            id="status"
                            name="status"
                            className="form-select"
                            value={filters.status || ''}
                            onChange={handleChange}
                        >
                            <option value="">Tous les statuts</option>
                            {Object.values(OpportunityStatus).map((status) => (
                                <option key={status} value={status}>
                                    {status}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Ville */}
                    <div className="col-md-4">
                        <label htmlFor="city" className="form-label">
                            Ville
                        </label>
                        <input
                            type="text"
                            id="city"
                            name="city"
                            className="form-control"
                            value={filters.city || ''}
                            onChange={handleChange}
                            placeholder="Rechercher une ville..."
                        />
                    </div>

                    {/* Prix minimum */}
                    <div className="col-md-3">
                        <label htmlFor="minPrice" className="form-label">
                            Prix minimum
                        </label>
                        <input
                            type="number"
                            id="minPrice"
                            name="minPrice"
                            className="form-control"
                            value={filters.minPrice || ''}
                            onChange={handleChange}
                            placeholder="0"
                        />
                    </div>

                    {/* Prix maximum */}
                    <div className="col-md-3">
                        <label htmlFor="maxPrice" className="form-label">
                            Prix maximum
                        </label>
                        <input
                            type="number"
                            id="maxPrice"
                            name="maxPrice"
                            className="form-control"
                            value={filters.maxPrice || ''}
                            onChange={handleChange}
                            placeholder="1000000"
                        />
                    </div>

                    {/* Surface minimum */}
                    <div className="col-md-3">
                        <label htmlFor="minSurface" className="form-label">
                            Surface minimum
                        </label>
                        <input
                            type="number"
                            id="minSurface"
                            name="minSurface"
                            className="form-control"
                            value={filters.minSurface || ''}
                            onChange={handleChange}
                            placeholder="0"
                        />
                    </div>

                    {/* Surface maximum */}
                    <div className="col-md-3">
                        <label htmlFor="maxSurface" className="form-label">
                            Surface maximum
                        </label>
                        <input
                            type="number"
                            id="maxSurface"
                            name="maxSurface"
                            className="form-control"
                            value={filters.maxSurface || ''}
                            onChange={handleChange}
                            placeholder="1000"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
