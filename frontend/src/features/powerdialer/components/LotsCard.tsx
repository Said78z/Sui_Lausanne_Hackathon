import { Button } from '@/components';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { LotPowerdialer } from '@shared/dto';
import { ChevronLeft, ChevronRight, Plus, Trash } from 'lucide-react';

interface LotsCardProps {
    lots: LotPowerdialer[];
    selectedLotId: string | null;
    onSelectLot: (lotId: string) => void;
    onAddLot: () => void;
    onDeleteLot: (lotId: string) => void;
    showAllNotes: boolean;
}

export function LotsCard({
    lots,
    selectedLotId,
    onSelectLot,
    onAddLot,
    onDeleteLot,
    showAllNotes,
}: LotsCardProps) {
    const [currentPage, setCurrentPage] = useState(0);
    const lotsPerPage = 8;
    const totalPages = Math.ceil(lots.length / lotsPerPage);
    const startIndex = currentPage * lotsPerPage;
    const endIndex = startIndex + lotsPerPage;
    const currentLots = lots.slice(startIndex, endIndex);
    const { t } = useTranslation();

    const handlePreviousPage = () => {
        if (currentPage > 0) {
            setCurrentPage(currentPage - 1);
        }
    };

    const handleNextPage = () => {
        if (currentPage < totalPages - 1) {
            setCurrentPage(currentPage + 1);
        }
    };

    return (
        <div className="flex h-full flex-col bg-white">
            <div className="mb-6 flex items-center justify-between px-6">
                <h2 className="text-xl font-semibold">{t('powerdialer.lots.title')}</h2>
                <Button variant="primary" className="flex items-center gap-2" onClick={onAddLot}>
                    <Plus className="h-4 w-4" />
                    {showAllNotes ? '' : t('powerdialer.lots.add')}
                </Button>
            </div>

            <div className="flex flex-col gap-4">
                {currentLots.map((lot) => (
                    <div
                        key={lot.id}
                        className={`relative flex cursor-pointer items-center justify-between rounded-lg border px-6 py-4 transition-colors ${
                            selectedLotId === lot.id
                                ? 'border-gray-200 bg-gray-50'
                                : 'border-gray-200 hover:border-tertiary'
                        }`}
                        onClick={() => onSelectLot(lot.id)}
                    >
                        <div className="absolute left-0 top-1/2 h-1/2 w-1 -translate-y-1/2 bg-tertiary"></div>
                        <div className="w-full">
                            <div className="flex w-full items-center justify-between">
                                <div className="font-bold">{lot.name}</div>
                                <div
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDeleteLot(lot.id);
                                    }}
                                    className="rounded-lg p-2 text-gray-400 transition-colors hover:text-red-600"
                                >
                                    <Trash className="h-4 w-4 text-red-500" />
                                </div>
                            </div>
                            <div className="text-xs text-gray-600">
                                {lot.surface} m² - {t('powerdialer.lots.floor')} {lot.etage}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {totalPages > 1 && (
                <div className="mt-4 flex items-center justify-center gap-4 px-6">
                    <Button
                        variant="ghost"
                        onClick={handlePreviousPage}
                        disabled={currentPage === 0}
                        className="flex items-center gap-2"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm text-gray-500">
                        {currentPage + 1} / {totalPages}
                    </span>
                    <Button
                        variant="ghost"
                        onClick={handleNextPage}
                        disabled={currentPage === totalPages - 1}
                        className="flex items-center gap-2"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            )}
        </div>
    );
}
