import { useState } from 'react';

import { Button } from '@/components/ui/Button/Button';
import { FileUpload } from '@/components/ui/FileUpload/FileUpload';
import { Input } from '@/components/ui/Input/Input';
import { Modal } from '@/components/ui/Modal/Modal';

interface AddDocumentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (documentData: { name: string; file: File }) => void;
}

export function AddDocumentModal({ isOpen, onClose, onSubmit }: AddDocumentModalProps) {
    const [documentName, setDocumentName] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<{ name?: string; file?: string }>({});

    const validateForm = (): boolean => {
        const newErrors: { name?: string; file?: string } = {};

        if (!documentName.trim()) {
            newErrors.name = 'Le nom du document est requis';
        }

        if (!selectedFile) {
            newErrors.file = 'Veuillez sélectionner un fichier';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        try {
            await onSubmit({
                name: documentName.trim(),
                file: selectedFile!,
            });

            // Reset form
            setDocumentName('');
            setSelectedFile(null);
            setErrors({});
            onClose();
        } catch (error) {
            console.error("Erreur lors de l'ajout du document:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        if (!isSubmitting) {
            setDocumentName('');
            setSelectedFile(null);
            setErrors({});
            onClose();
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Ajouter un document" size="md">
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Nom du document */}
                <div>
                    <Input
                        label="Nom du document"
                        name="documentName"
                        id="documentName"
                        type="text"
                        value={documentName}
                        onChange={(e) => setDocumentName(e.target.value)}
                        placeholder="Entrez le nom du document"
                        className={errors.name ? 'border-red-300' : ''}
                        disabled={isSubmitting}
                    />
                    {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                </div>

                {/* Upload de fichier */}
                <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                        Fichier *
                    </label>
                    <FileUpload onFileSelect={setSelectedFile} accept="*/*" maxSize={10} />
                    {errors.file && <p className="mt-1 text-sm text-red-600">{errors.file}</p>}
                </div>

                {/* Boutons d'action */}
                <div className="flex justify-end space-x-3 border-t border-gray-200 pt-4">
                    <Button
                        type="button"
                        variant="tertiary"
                        onClick={handleClose}
                        disabled={isSubmitting}
                    >
                        Annuler
                    </Button>
                    <Button
                        type="submit"
                        variant="primary"
                        disabled={isSubmitting}
                        isLoading={isSubmitting}
                    >
                        {isSubmitting ? 'Ajout en cours...' : 'Ajouter le document'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
