import { Button } from '@/components/ui/Button/Button';
import { Modal } from '@/components/ui/Modal/Modal';

import { useTranslation } from 'react-i18next';

interface DeleteConfirmationProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    itemName?: string;
}

export default function DeleteConfirmation({ isOpen, onClose, onConfirm, itemName }: DeleteConfirmationProps) {
    const { t } = useTranslation();

    if (!isOpen) {
        return null;
    }

    return (
        <Modal
            title={t('invitation.deleteDialog.title') + (itemName ? ` ${itemName}` : '')}
            isOpen={isOpen}
            onClose={onClose}
        >
            <p>{t('invitation.deleteDialog.message') + (itemName ? ` ${itemName}` : '')}?</p>
            <div className="mt-4 flex justify-end gap-2">
                <Button variant="outline" onClick={onClose}>
                    {t('invitation.deleteDialog.cancel')}
                </Button>
                <Button
                    variant="danger"
                    onClick={() => {
                        onConfirm();
                        onClose();
                    }}
                >
                    {t('invitation.deleteDialog.confirm')}
                </Button>
            </div>
        </Modal>
    );
}