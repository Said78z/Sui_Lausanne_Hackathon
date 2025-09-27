import { Button } from '@/components';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Bot, FolderOpen, LayoutDashboard, PhoneCall } from 'lucide-react';

import { DocumentsModal } from './DocumentsModal';

interface ProgressBarProps {
    progress: number;
    onGalleryClick: () => void;
}

export function ProgressBar({ progress, onGalleryClick }: ProgressBarProps) {
    const { t } = useTranslation();
    const [showDocuments, setShowDocuments] = useState(false);

    const getProgressColor = (progress: number) => {
        if (progress < 25) return 'linear-gradient(90deg, #4CAF50 0%, #4CAF50 100%)';
        if (progress < 50) return 'linear-gradient(90deg, #4CAF50 0%, #FFC107 100%)';
        if (progress < 75) return 'linear-gradient(90deg, #FFC107 0%, #FF9800 100%)';
        return 'linear-gradient(90deg, #FF9800 0%, #FF5722 100%)';
    };

    return (
        <>
            <div className="relative mt-10 flex h-48 w-full rounded-lg border p-6">
                <div className="absolute left-0 top-4 h-1/4 w-1 bg-tertiary"></div>
                <div className="w-full">
                    <div className="mb-4 flex items-center justify-between">
                        <h3 className="px-6 text-xl font-semibold">
                            {t('powerdialer.progress.title')}
                        </h3>
                        <span className="text-lg font-medium">{progress}%</span>
                    </div>
                    <div className="relative h-8 overflow-hidden rounded-md bg-gray-200">
                        <div
                            className="absolute left-0 top-0 h-full rounded-lg transition-all duration-500 ease-in-out"
                            style={{
                                width: `${progress}%`,
                                background: getProgressColor(progress),
                                boxShadow: '0 0 10px rgba(255, 87, 34, 0.5)',
                            }}
                        />
                    </div>
                    <div className="mt-4 grid grid-cols-4 gap-8 text-center">
                        <div className="col-span-1">
                            <Button
                                variant="primary"
                                className="group flex items-center gap-2"
                                onClick={() => setShowDocuments(true)}
                            >
                                <FolderOpen size={18} />
                                <p className="transition-all duration-300 group-hover:translate-x-1">
                                    {t('powerdialer.progress.documents')}
                                </p>
                            </Button>
                        </div>
                        <div className="col-span-1">
                            <Button
                                variant="primary"
                                className="group flex items-center gap-2"
                                onClick={onGalleryClick}
                            >
                                <LayoutDashboard size={18} />
                                <p className="transition-all duration-300 group-hover:translate-x-1">
                                    {t('powerdialer.progress.gallery')}
                                </p>
                            </Button>
                        </div>
                        <div className="col-span-1">
                            <Button variant="primary" className="group flex items-center gap-2">
                                <Bot size={18} />
                                <p className="transition-all duration-300 group-hover:translate-x-1">
                                    {t('powerdialer.progress.ai')}
                                </p>
                            </Button>
                        </div>
                        <div className="col-span-1">
                            <Button variant="tertiary" className="group flex items-center gap-2">
                                <PhoneCall size={18} />
                                <p className="transition-all duration-300 group-hover:translate-x-1">
                                    {t('powerdialer.progress.call')}
                                </p>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {showDocuments && <DocumentsModal onClose={() => setShowDocuments(false)} />}
        </>
    );
}
