import { useRef, useState } from 'react';

import { File, Upload, X } from 'lucide-react';

interface FileUploadProps {
    onFileSelect: (file: File | null) => void;
    accept?: string;
    maxSize?: number; // en MB
    className?: string;
}

export function FileUpload({
    onFileSelect,
    accept = '*/*',
    maxSize = 10,
    className = '',
}: FileUploadProps) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isDragOver, setIsDragOver] = useState(false);
    const [error, setError] = useState<string>('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const validateFile = (file: File): boolean => {
        setError('');

        // Vérifier la taille
        if (file.size > maxSize * 1024 * 1024) {
            setError(`Le fichier est trop volumineux. Taille maximum: ${maxSize}MB`);
            return false;
        }

        return true;
    };

    const handleFileSelect = (file: File) => {
        if (validateFile(file)) {
            setSelectedFile(file);
            onFileSelect(file);
        }
    };

    const handleFileRemove = () => {
        setSelectedFile(null);
        onFileSelect(null);
        setError('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);

        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) {
            handleFileSelect(files[0]);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            handleFileSelect(files[0]);
        }
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className={`w-full ${className}`}>
            {!selectedFile ? (
                <div
                    className={`relative cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition-colors duration-200 ${
                        isDragOver
                            ? 'border-blue-400 bg-blue-50'
                            : 'border-gray-300 hover:border-gray-400'
                    } ${error ? 'border-red-300 bg-red-50' : ''} `}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept={accept}
                        onChange={handleInputChange}
                        className="hidden"
                    />

                    <Upload className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                    <p className="mb-2 text-sm text-gray-600">
                        <span className="font-medium text-blue-600">Cliquez pour sélectionner</span>{' '}
                        ou glissez-déposez un fichier
                    </p>
                    <p className="text-xs text-gray-500">Taille maximum: {maxSize}MB</p>
                </div>
            ) : (
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <File className="h-8 w-8 text-blue-500" />
                            <div>
                                <p className="text-sm font-medium text-gray-900">
                                    {selectedFile.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {formatFileSize(selectedFile.size)}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={handleFileRemove}
                            className="p-1 text-gray-400 transition-colors hover:text-red-500"
                        >
                            <X size={16} />
                        </button>
                    </div>
                </div>
            )}

            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        </div>
    );
}
