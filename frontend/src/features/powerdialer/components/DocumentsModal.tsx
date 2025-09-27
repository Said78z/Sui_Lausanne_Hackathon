import { Button } from '@/components';

import { useEffect, useState } from 'react';

import { Download, FileText, Upload, X } from 'lucide-react';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/Table/Table';

interface Document {
    id: string;
    name: string;
    type: string;
    uploadDate: string;
    url: string;
}

interface DocumentsModalProps {
    onClose: () => void;
}

export function DocumentsModal({ onClose }: DocumentsModalProps) {
    const [documents, setDocuments] = useState<Document[]>([
        {
            id: '1',
            name: 'Contrat de bail',
            type: 'PDF',
            uploadDate: '2024-03-15',
            url: 'https://example.com/contrat.pdf',
        },
        {
            id: '2',
            name: 'Quittance de loyer',
            type: 'PDF',
            uploadDate: '2024-03-10',
            url: 'https://example.com/quittance.pdf',
        },
        {
            id: '3',
            name: 'État des lieux',
            type: 'PDF',
            uploadDate: '2024-03-05',
            url: 'https://example.com/etat-lieux.pdf',
        },
    ]);

    useEffect(() => {
        // Sauvegarder la position de défilement actuelle
        const scrollY = window.scrollY;
        // Bloquer le défilement
        document.body.style.position = 'fixed';
        document.body.style.top = `-${scrollY}px`;
        document.body.style.width = '100%';

        return () => {
            // Restaurer le défilement
            document.body.style.position = '';
            document.body.style.top = '';
            document.body.style.width = '';
            window.scrollTo(0, scrollY);
        };
    }, []);

    const handleDownload = (doc: Document) => {
        console.log(doc);
    };

    const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const newDocument: Document = {
                id: Date.now().toString(),
                name: file.name,
                type: file.type.split('/')[1].toUpperCase(),
                uploadDate: new Date().toISOString().split('T')[0],
                url: URL.createObjectURL(file),
            };
            setDocuments([...documents, newDocument]);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-6xl rounded-lg bg-white p-6 shadow-xl">
                <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-2xl font-semibold">Documents du dossier</h2>
                    <div className="flex items-center gap-4">
                        <label className="flex cursor-pointer items-center gap-2 rounded-md bg-primary px-4 py-2 text-white hover:bg-primary/90">
                            <Upload size={18} />
                            <span>Uploader</span>
                            <input
                                type="file"
                                className="hidden"
                                onChange={handleUpload}
                                accept=".pdf,.doc,.docx,.xls,.xlsx"
                            />
                        </label>
                        <button
                            onClick={onClose}
                            className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-gray-50"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                <div className="max-h-[60vh] overflow-y-auto">
                    <Table variant="striped">
                        <TableHeader sticky>
                            <TableRow>
                                <TableHead>Nom</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Date d'upload</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {documents.map((doc) => (
                                <TableRow key={doc.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <FileText size={20} className="text-gray-400" />
                                            <span>{doc.name}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className="rounded-full bg-gray-100 px-3 py-1 text-sm">
                                            {doc.type}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        {new Date(doc.uploadDate).toLocaleDateString('fr-FR')}
                                    </TableCell>
                                    <TableCell align="right">
                                        <Button
                                            variant="ghost"
                                            className="flex items-center gap-2"
                                            onClick={() => handleDownload(doc)}
                                        >
                                            <Download size={18} />
                                            <span>Télécharger</span>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
}
