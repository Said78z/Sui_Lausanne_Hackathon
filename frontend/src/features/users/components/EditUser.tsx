import { Button, Input, SelectInput } from '@/components';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { User, UserRole } from '@shared/dto/userDto';
import { Mail, Phone, User as UserIcon, X } from 'lucide-react';

interface EditUserProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
        civility: string;
        roles: UserRole;
        birthDate: string;
        isVerified: boolean;
    }) => void;
    user: User;
}

export default function EditUser({ isOpen, onClose, onSubmit, user }: EditUserProps) {
    const { t } = useTranslation();
    const initialFormState = {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone ?? '',
        civility: user.civility ?? '',
        roles: user.roles,
        birthDate: user.birthDate ?? '',
        isVerified: user.isVerified ?? false,
    };

    const [formData, setFormData] = useState(initialFormState);

    useEffect(() => {
        setFormData(initialFormState);
    }, [user]);

    if (!isOpen) return null;

    const civilityOptions = [
        { label: 'M.', value: 'M.' },
        { label: 'Mme', value: 'Mme' },
        { label: 'Mlle', value: 'Mlle' },
    ];

    const roleOptions = Object.values(UserRole).map((role) => ({
        label: role,
        value: role,
    }));

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
        handleClose();
    };

    const handleClose = () => {
        setFormData(initialFormState);
        onClose();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e as unknown as React.FormEvent);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="w-full max-w-lg rounded-lg bg-white p-6">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-xl font-semibold">{t('users.edit')}</h2>
                    <div className="cursor-pointer hover:text-gray-800" onClick={handleClose}>
                        <X size={20} />
                    </div>
                </div>
                <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} className="space-y-4">
                    <div>
                        <SelectInput
                            name="civility"
                            label={t('users.form.civility')}
                            options={civilityOptions}
                            value={formData.civility}
                            onChange={(value) => setFormData({ ...formData, civility: value })}
                            required
                        />
                    </div>
                    <div>
                        <Input
                            name="firstName"
                            label={t('users.form.firstName')}
                            placeholder="John"
                            leftIcon={<UserIcon size={16} className="text-gray-500" />}
                            value={formData.firstName}
                            onChange={(e) =>
                                setFormData({ ...formData, firstName: e.target.value })
                            }
                            required
                        />
                    </div>
                    <div>
                        <Input
                            name="lastName"
                            label={t('users.form.lastName')}
                            placeholder="Doe"
                            leftIcon={<UserIcon size={16} className="text-gray-500" />}
                            value={formData.lastName}
                            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                            required
                        />
                    </div>
                    <div>
                        <Input
                            name="email"
                            label={t('users.form.email')}
                            placeholder="john.doe@cashflowpositif.fr"
                            type="email"
                            leftIcon={<Mail size={16} className="text-gray-500" />}
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                        />
                    </div>
                    <div>
                        <Input
                            name="phone"
                            label={t('users.form.phone')}
                            placeholder="06 06 06 06 06"
                            leftIcon={<Phone size={16} className="text-gray-500" />}
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            required
                        />
                    </div>
                    <div>
                        <Input
                            name="birthDate"
                            label={t('users.form.birthDate')}
                            type="date"
                            value={formData.birthDate}
                            onChange={(e) =>
                                setFormData({ ...formData, birthDate: e.target.value })
                            }
                            required
                        />
                    </div>
                    <div>
                        <SelectInput
                            name="roles"
                            label={t('users.form.role')}
                            options={roleOptions}
                            value={formData.roles}
                            onChange={(value) =>
                                setFormData({ ...formData, roles: value as UserRole })
                            }
                            required
                        />
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button variant="tertiary" onClick={handleClose}>
                            {t('users.form.cancel')}
                        </Button>
                        <Button type="submit" variant="primary">
                            {t('users.form.save')}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
