import { useState } from 'react';

import { Download, Eye, Plus } from 'lucide-react';

import { Button } from '@/components/ui/Button/Button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/Table/Table';

import { AddDocumentModal } from './AddDocumentModal';

interface Document {
    name: string;
    type: string;
    date: string;
}

interface DocumentsSectionProps {
    documents: Document[];
    title?: string;
    onAddDocument?: (documentData: { name: string; file: File }) => void;
}

export function DocumentsSection({
    documents,
    title = 'Documents',
    onAddDocument,
}: DocumentsSectionProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleAddDocument = async (documentData: { name: string; file: File }) => {
        try {
            if (onAddDocument) {
                await onAddDocument(documentData);
            }
            // Ici vous pouvez ajouter une notification de succès
            console.log('Document ajouté avec succès:', documentData);
        } catch (error) {
            console.error("Erreur lors de l'ajout du document:", error);
            // Ici vous pouvez ajouter une notification d'erreur
            throw error; // Re-throw pour que le modal puisse gérer l'erreur
        }
    };

    return (
        <>
            <div className="relative w-full rounded-xl border border-gray-200 bg-white p-10">
                <div className="absolute left-0 top-1/2 h-2/3 w-1 -translate-y-1/2 bg-tertiary"></div>
                <div className="flex justify-between">
                    <h2 className="mb-6 text-sm text-gray-600">{title}</h2>
                    <Button
                        variant="primary"
                        className="flex items-center gap-2 text-xs"
                        onClick={() => setIsModalOpen(true)}
                    >
                        <Plus size={16} />
                        Ajouter
                    </Button>
                </div>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nom</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {documents.map((doc, index) => (
                            <TableRow key={index}>
                                <TableCell>{doc.name}</TableCell>
                                <TableCell>{doc.type}</TableCell>
                                <TableCell>{doc.date}</TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="primary"
                                            onClick={() => window.open('#', '_blank')}
                                        >
                                            <Eye size={16} />
                                        </Button>
                                        <Button
                                            variant="primary"
                                            onClick={() => window.open('#', '_blank', 'download')}
                                        >
                                            <Download size={16} />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <AddDocumentModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleAddDocument}
            />
        </>
    );
}
