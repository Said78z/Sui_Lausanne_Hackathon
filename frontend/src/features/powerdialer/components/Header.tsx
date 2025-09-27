import { useTranslation } from 'react-i18next';

import { Eye, MailOpen, Plus } from 'lucide-react';

import { Button } from '@/components/ui/Button/Button';

interface HeaderProps {
    showAllNotes: boolean;
}

export function Header({ showAllNotes }: HeaderProps) {
    const { t } = useTranslation();

    return (
        <div className="sticky top-0 bg-white py-6">
            <div className={`grid ${showAllNotes ? 'grid-cols-4 gap-4' : 'grid-cols-12 gap-4'}`}>
                <div
                    className={`flex items-center gap-4 ${showAllNotes ? 'col-span-4' : 'col-span-6'}`}
                >
                    <h1 className="text-2xl font-bold">{t('powerdialer.title')}</h1>
                </div>
                <div className={`${showAllNotes ? 'col-span-1' : 'col-span-2'}`}>
                    <Button variant="primary" className="group flex items-center gap-2">
                        <MailOpen size={18} />
                        <p className="transition-all duration-300 group-hover:translate-x-1">
                            {t('powerdialer.header.sendEmail')}
                        </p>
                    </Button>
                </div>
                <div className={`${showAllNotes ? 'col-span-1' : 'col-span-2'}`}>
                    <Button variant="primary" className="group flex items-center gap-2">
                        <Plus size={18} />
                        <p className="transition-all duration-300 group-hover:translate-x-1">
                            {t('powerdialer.header.inviteAgent')}
                        </p>
                    </Button>
                </div>
                <div className={`${showAllNotes ? 'col-span-1' : 'col-span-2'}`}>
                    <Button variant="primary" className="group flex items-center gap-2">
                        <Eye size={18} />
                        <p className="transition-all duration-300 group-hover:translate-x-1">
                            {t('powerdialer.header.viewOpportunity')}
                        </p>
                    </Button>
                </div>
            </div>
        </div>
    );
}
