import { Input, SelectInput } from '@/components';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { InvitationRequestType } from '@shared/enums/invitationRequest';
import { X } from 'lucide-react';

interface InviteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (invites: { email: string; type: string }[]) => Promise<void> | void;
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const InviteModal: React.FC<InviteModalProps> = ({ isOpen, onClose, onSubmit }) => {
    const { t } = useTranslation();
    const [emailInput, setEmailInput] = useState('');
    const [type, setType] = useState<InvitationRequestType>(InvitationRequestType.USER);
    const [error, setError] = useState<string | null>(null);
    const [isAnimating, setIsAnimating] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
            setTimeout(() => {
                setIsAnimating(true);
            }, 10);
        } else {
            setIsAnimating(false);
            setTimeout(() => {
                setIsVisible(false);
            }, 300);
        }
    }, [isOpen]);

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
            setTimeout(() => {
                setIsAnimating(true);
            }, 10);
        } else {
            setIsAnimating(false);
            setTimeout(() => {
                setIsVisible(false);
            }, 300);
        }
    }, [isOpen]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleFormSubmission();
        }
    };

    const handleFormSubmission = () => {
        if (emailInput && emailInput.trim() !== '') {
            if (emailRegex.test(emailInput.trim())) {
                onSubmit([{ email: emailInput.trim(), type: type }]);
                setEmailInput('');
                setError(null);
                onClose();
            } else {
                setError('Email invalide');
            }
        } else {
            setError('Veuillez entrer un email');
        }
    };

    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    if (!isVisible) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
            onClick={handleOverlayClick}
        >
            <div
                className={`w-[500px] rounded-xl bg-white p-6 transition-all duration-300 ease-out ${isAnimating ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'}`}
            >
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 cursor-pointer text-gray-500 hover:text-gray-700"
                >
                    <X size={20} />
                </button>

                <h2 className="mb-4 text-xl font-bold">
                    {t('invitation.sendNewInvitation.title')}
                </h2>

                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleFormSubmission();
                    }}
                >
                    <div className="mb-4">
                        <div className="grid grid-cols-3 items-center gap-2">
                            <div className="col-span-2">
                                <Input
                                    label="Email"
                                    name="email"
                                    type="email"
                                    value={emailInput}
                                    onChange={(e) => setEmailInput(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="exemple@email.com"
                                    className="h-[40px]"
                                />
                            </div>
                            <div className="col-span-1">
                                <SelectInput
                                    label="Type"
                                    name="type"
                                    value={type}
                                    onChange={(e) => setType(e as InvitationRequestType)}
                                    options={[
                                        {
                                            label: t('invitation.sendNewInvitation.typeUser'),
                                            value: InvitationRequestType.USER,
                                        },
                                        {
                                            label: t('invitation.sendNewInvitation.typeCGP'),
                                            value: InvitationRequestType.CGP,
                                        },
                                        {
                                            label: t('invitation.sendNewInvitation.typeAgent'),
                                            value: InvitationRequestType.AGENT,
                                        },
                                        {
                                            label: t('invitation.sendNewInvitation.typeEmployee'),
                                            value: InvitationRequestType.EMPLOYEE,
                                        },
                                        {
                                            label: t('invitation.sendNewInvitation.typeAdmin'),
                                            value: InvitationRequestType.ADMIN,
                                        },
                                        {
                                            label: t('invitation.sendNewInvitation.typeClient'),
                                            value: InvitationRequestType.CLIENT,
                                        },
                                        {
                                            label: t('invitation.sendNewInvitation.typeProspect'),
                                            value: InvitationRequestType.PROSPECT,
                                        },
                                    ]}
                                    className="h-[40px]"
                                />
                            </div>
                        </div>
                        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
                    </div>
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 rounded-md border border-gray-300 px-4 py-2 hover:bg-gray-50"
                        >
                            {t('invitation.sendNewInvitation.cancel')}
                        </button>
                        <button
                            type="submit"
                            className="flex-1 cursor-pointer rounded-md bg-primary px-4 py-2 text-white hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                            disabled={!emailInput || emailInput.trim() === ''}
                        >
                            {t('invitation.sendNewInvitation.send')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default InviteModal;
