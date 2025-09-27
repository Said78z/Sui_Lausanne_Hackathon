import { useTranslation } from 'react-i18next';

import { ChevronDown } from 'lucide-react';

interface DescriptionCardProps {
    description: string;
    notes: Array<{
        author: string;
        date: string;
        time: string;
        to: string;
        content: string;
    }>;
    onShowAllNotes: () => void;
    showAllNotes: boolean;
}

export function DescriptionCard({
    description,
    notes,
    onShowAllNotes,
    showAllNotes,
}: DescriptionCardProps) {
    const { t } = useTranslation();

    return (
        <div className="rounded-lg bg-white pt-6">
            <p className="mb-4 text-sm text-gray-600">{description}</p>
            <div className="mt-6">
                <div className="flex items-center justify-between">
                    <h3 className="mb-4 text-lg font-semibold">
                        {t('powerdialer.description.notes')}
                    </h3>
                    <div
                        className="flex cursor-pointer items-center justify-center gap-2 text-sm text-gray-500"
                        onClick={onShowAllNotes}
                    >
                        <ChevronDown
                            className={`h-4 w-4 transition-transform ${showAllNotes ? 'rotate-[270deg]' : 'rotate-90'}`}
                        />
                        {t('powerdialer.description.showAllNotes')}
                    </div>
                </div>
                <div className="space-y-4">
                    {notes.map((note, index) => (
                        <div
                            key={index}
                            className="rounded-lg border border-gray-100 bg-gray-50 p-4"
                        >
                            <div className="mb-2 flex items-center justify-between">
                                <span className="font-medium text-gray-900">
                                    {note.author} -{' '}
                                    {note.to.charAt(0).toUpperCase() + note.to.slice(1)}
                                </span>
                                <div className="text-xs text-gray-500">
                                    {note.date} à {note.time}
                                </div>
                            </div>
                            <p className="text-sm text-gray-600">{note.content}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
