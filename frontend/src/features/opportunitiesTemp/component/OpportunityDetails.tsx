import { opportunityService } from '@/api/opportunityService';

import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import type { OpportunityDto } from '@shared/dto';

import { Badge } from '@/components/ui/Badge/Badge';
import { Button } from '@/components/ui/Button/Button';

export default function OpportunityDetails() {
    const { id } = useParams();
    const [opportunity, setOpportunity] = useState<OpportunityDto | null>(null);

    useEffect(() => {
        if (id) {
            opportunityService.getOpportunityById(id).then((res) => {
                setOpportunity(res.data);
            });
        }
    }, [id]);

    if (!opportunity) return <div className="p-10 text-center">Chargement...</div>;

    return (
        <div className="min-h-screen bg-gray-50 px-4 py-8">
            {/* Header */}
            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <Badge variant="warning" size="lg" className="font-bold uppercase">
                    Certification à revoir
                </Badge>
                <div className="flex flex-wrap gap-2">
                    <Button variant="ghost" className="border border-gray-300">
                        <span className="material-icons">edit</span>
                    </Button>
                    <Button variant="tertiary">Voir dossiers</Button>
                    <Button variant="ghost" className="border border-gray-300">
                        Actions
                    </Button>
                    <Button variant="ghost" className="border border-gray-300">
                        Annonce
                    </Button>
                    <Button variant="primary">Proposer</Button>
                </div>
            </div>

            {/* Bloc noir paramètres */}
            <div className="mb-8 flex items-center justify-between rounded-xl bg-black p-6 text-white">
                <span>Modifier les paramètres de l'opportunité</span>
                <span className="material-icons">expand_more</span>
            </div>

            {/* Résumé principal */}
            <div className="mb-8 flex flex-col gap-8 md:flex-row md:items-start">
                <div className="flex-1">
                    <h1 className="mb-2 text-3xl font-bold">{opportunity.title}</h1>
                    <div className="mb-4 text-xl text-gray-600">
                        situé à <b>{opportunity.city}</b>
                    </div>
                    <div className="mb-4 flex flex-wrap gap-2">
                        <Badge variant="primary" size="lg">
                            Autofinancé
                        </Badge>
                        <Badge variant="success" size="lg">
                            {opportunity.status}
                        </Badge>
                    </div>
                    <div className="mb-4 flex flex-wrap gap-8">
                        <div>
                            <div className="text-gray-500">Prix du projet</div>
                            <div className="text-2xl font-bold">
                                {opportunity.price?.toLocaleString('fr-FR')}€
                            </div>
                        </div>
                        <div>
                            <div className="text-gray-500">Rendement</div>
                            <div className="text-2xl font-bold">
                                {opportunity.rentalYield ?? '--'}%
                            </div>
                        </div>
                        <div>
                            <div className="text-gray-500">Revenu locatif</div>
                            <div className="text-2xl font-bold">
                                {opportunity.annualRentalRevenue?.toLocaleString('fr-FR')} €/an
                            </div>
                        </div>
                        <div>
                            <div className="text-gray-500">TRI</div>
                            <div className="text-2xl font-bold">
                                {opportunity.potential ?? '--'} %
                            </div>
                        </div>
                    </div>
                    <div className="mb-4 text-gray-700">{opportunity.description}</div>
                    <Button variant="ghost" className="mt-4 w-full border border-gray-300">
                        <span className="material-icons mr-2">add_a_photo</span>
                        Ajouter des photos
                    </Button>
                </div>
                {/* Carte ou image France */}
                <div className="flex w-full justify-center md:w-1/3">
                    {/* Remplace par ta vraie carte */}
                    <img
                        src="/france-map-placeholder.png"
                        alt="Carte"
                        className="h-64 w-64 object-contain"
                    />
                </div>
            </div>

            {/* Détails de la ville */}
            <section className="mb-8 rounded-xl bg-white p-6 shadow">
                <h2 className="mb-2 border-b-2 border-blue-500 pb-2 text-xl font-bold">
                    Détails de la ville
                </h2>
                <div className="flex flex-wrap gap-8">
                    <div>
                        <div className="text-gray-500">Nom de la ville</div>
                        <div className="font-bold">{opportunity.city}</div>
                    </div>
                    <div>
                        <div className="text-gray-500">Région</div>
                        <div className="font-bold">{opportunity.cityFullName}</div>
                    </div>
                    <div>
                        <div className="text-gray-500">Nombre d'habitants</div>
                        {/*<div className="font-bold">{opportunity.population ?? 'Non défini'}</div>*/}
                    </div>
                </div>
                {/* Ajoute ici les barres de tension locative, etc. */}
            </section>

            {/* Informations agent */}
            <section className="mb-8 rounded-xl bg-white p-6 shadow">
                <h2 className="mb-2 border-b-2 border-blue-500 pb-2 text-xl font-bold">
                    Informations agent
                </h2>
                <div className="flex flex-wrap gap-8">
                    <div>
                        <div className="text-gray-500">Numéro de téléphone</div>
                        <div className="font-bold">
                            {opportunity.agentPhoneModified ?? 'Non défini'}
                        </div>
                    </div>
                    <div>
                        <div className="text-gray-500">Email</div>
                        <div className="font-bold">{opportunity.emailAgent ?? 'Non défini'}</div>
                    </div>
                </div>
                <div className="mt-4 text-gray-700">{opportunity.comments ?? ''}</div>
            </section>

            {/* Détails des lots */}
            <section className="mb-8 rounded-xl bg-white p-6 shadow">
                <h2 className="mb-2 border-b-2 border-blue-500 pb-2 text-xl font-bold">
                    Détails des lots
                </h2>
                {opportunity.lots && opportunity.lots.length > 0 && (
                    <table>
                        <thead>
                            <tr>
                                <th>Type</th>
                                <th>Surface</th>
                                <th>Charges</th>
                                <th>Loyer annuel</th>
                                <th>Loué</th>
                                <th>Étage</th>
                            </tr>
                        </thead>
                        <tbody>
                            {opportunity.lots.map((lot) => (
                                <tr key={lot.id}>
                                    <td>{lot.type}</td>
                                    <td>{lot.surface} m²</td>
                                    <td>{lot.charges} €</td>
                                    <td>{lot.annualRent} €</td>
                                    <td>{lot.isRented ? 'Oui' : 'Non'}</td>
                                    <td>{lot.floor}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </section>

            {/* Graphiques */}
            <section className="mb-8 rounded-xl bg-white p-6 shadow">
                <h2 className="mb-2 border-b-2 border-blue-500 pb-2 text-xl font-bold">
                    Prix moyen des logements
                </h2>
                {/* Graphique ici */}
            </section>
            <section className="mb-8 rounded-xl bg-white p-6 shadow">
                <h2 className="mb-2 border-b-2 border-blue-500 pb-2 text-xl font-bold">
                    Distribution des montants des loyers
                </h2>
                {/* Graphique ici */}
            </section>
        </div>
    );
}
