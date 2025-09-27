import { Button, SelectInput } from '@/components';

import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import { InviteFormValues, InviteRequest, inviteSchema } from '@shared/dto';
import { UserRole } from '@shared/dto/userDto';
import { X } from 'lucide-react';

interface InviteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (request: InviteRequest) => Promise<void> | void;
    defaultRole?: string;
}

const roleOptions = [
    { label: 'Lead', value: UserRole.Lead },
    { label: 'CGP', value: UserRole.CGP },
    { label: 'Agent', value: UserRole.Agent },
    { label: 'Client', value: UserRole.Client },
    { label: 'Consultant', value: UserRole.Consultant },
    { label: 'SDR', value: UserRole.SDR },
];

const InviteModal: React.FC<InviteModalProps> = ({ isOpen, onClose, onSubmit, defaultRole }) => {
    const [pendingEmails, setPendingEmails] = useState<string[]>([]);
    const pendingEmailsContainerRef = useRef<HTMLDivElement>(null);
    const [isAnimating, setIsAnimating] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [selectedRole, setSelectedRole] = useState(defaultRole || 'user');

    const {
        register,
        handleSubmit: handleFormSubmit,
        formState: { errors },
        reset,
        watch,
    } = useForm<InviteFormValues>({
        resolver: zodResolver(inviteSchema),
        defaultValues: {
            email: '',
        },
    });

    const emailInput = watch('email');

    // Effet pour gérer l'animation et la visibilité
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
            }, 300); // Durée de l'animation
        }
    }, [isOpen]);

    // Fonction pour gérer les touches spéciales (espace, entrée, point-virgule, virgule)
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === ' ' || e.key === 'Enter' || e.key === ';' || e.key === ',') {
            e.preventDefault();
            addEmailChip();
        }
    };

    // Fonction pour ajouter un email comme chip
    const addEmailChip = () => {
        if (emailInput && emailInput.trim() !== '') {
            // Vérifier si l'entrée contient plusieurs emails séparés par ; ou ,
            const emailsToAdd = emailInput
                .split(/[;,]/)
                .map((email: string) => email.trim())
                .filter((email: string) => email !== '');

            if (emailsToAdd.length > 1) {
                // Traiter chaque email séparément
                const validEmails = emailsToAdd.filter((email: string) => {
                    const result = inviteSchema.safeParse({ email });
                    return result.success;
                });

                setPendingEmails([...pendingEmails, ...validEmails]);
                reset({ email: '' });
            } else {
                // Validation avec Zod pour un seul email
                const result = inviteSchema.safeParse({ email: emailInput.trim() });

                if (result.success) {
                    setPendingEmails([...pendingEmails, emailInput.trim()]);
                    reset({ email: '' });
                }
            }

            // Faire défiler vers la droite après l'ajout d'un email
            setTimeout(() => {
                if (pendingEmailsContainerRef.current) {
                    pendingEmailsContainerRef.current.scrollLeft =
                        pendingEmailsContainerRef.current.scrollWidth;
                }
            }, 100);
        }
    };

    // Fonction pour supprimer un email
    const removeEmail = (index: number) => {
        const newEmails = [...pendingEmails];
        newEmails.splice(index, 1);
        setPendingEmails(newEmails);
    };

    const handleFormSubmission = (data: InviteFormValues) => {
        let allEmails = [...pendingEmails];

        if (data.email && data.email.trim() !== '') {
            const result = inviteSchema.safeParse({ email: data.email.trim() });
            if (result.success && !allEmails.includes(data.email.trim())) {
                allEmails.push(data.email.trim());
            }
        }

        if (allEmails.length > 0) {
            const request: InviteRequest = {
                emails: allEmails,
                role: selectedRole,
            };
            onSubmit(request);
            setPendingEmails([]);
            reset({ email: '' });
        }

        onClose();
    };

    const handleSubmitWithPendingEmails = () => {
        if (pendingEmails.length > 0) {
            const request: InviteRequest = {
                emails: pendingEmails,
                role: selectedRole,
            };
            onSubmit(request);
            setPendingEmails([]);
            reset({ email: '' });
            onClose();
        } else {
            handleFormSubmit(handleFormSubmission)();
        }
    };

    // Fonction pour gérer les clics sur l'overlay
    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
        // Vérifier que le clic est bien sur l'overlay et non sur le contenu de la modale
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

                <h2 className="mb-4 text-xl font-bold">Inviter des contacts</h2>
                <p className="mb-4 text-sm text-gray-600">
                    Entrez les adresses email de vos contacts (appuyez sur Espace ou Entrée pour
                    ajouter)
                </p>

                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleSubmitWithPendingEmails();
                    }}
                >
                    <div className="mb-4">
                        <input
                            type="email"
                            {...register('email')}
                            onKeyDown={handleKeyDown}
                            className={`w-full border p-3 ${errors.email ? 'border-red-500' : 'border-gray-300'} focus:ring-primaryLight rounded-md`}
                            placeholder="exemple@email.com"
                        />

                        {errors.email && (
                            <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
                        )}

                        <div className="mt-4">
                            <SelectInput
                                label="Rôle"
                                name="role"
                                options={roleOptions}
                                value={selectedRole}
                                onChange={(value) => setSelectedRole(value)}
                                required
                            />
                        </div>

                        <div
                            ref={pendingEmailsContainerRef}
                            className="mt-2 flex max-w-full flex-wrap gap-2 overflow-x-auto py-2"
                            style={{ scrollBehavior: 'smooth' }}
                        >
                            {pendingEmails.map((email, index) => (
                                <div
                                    key={index}
                                    className="text-primaryLight flex items-center rounded-md bg-gray-100 px-3 py-1 text-sm"
                                >
                                    {email}
                                    <X
                                        size={16}
                                        className="ml-2 cursor-pointer"
                                        onClick={() => removeEmail(index)}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <Button
                            variant="tertiary"
                            onClick={onClose}
                            className="flex-1 rounded-md border border-gray-300 px-4 py-2 hover:bg-gray-50"
                        >
                            Annuler
                        </Button>
                        <Button
                            variant="primary"
                            disabled={
                                pendingEmails.length === 0 &&
                                (!emailInput || emailInput.trim() === '')
                            }
                        >
                            Envoyer les invitations
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default InviteModal;
