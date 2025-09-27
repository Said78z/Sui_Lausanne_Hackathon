import { useUsers } from '@/api/queries/userQueries';
import { Button, Input, MultiSelectInput, SelectInput } from '@/components';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { RestrictedUserDto, UserRole } from '@shared/dto/userDto';
import { X } from 'lucide-react';

interface AddFolderProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: {
        name: string;
        clientId: string[];
        consultantId: string;
        partnerId: string;
        country: string;
    }) => void;
}

export default function AddFolder({ isOpen, onClose, onSubmit }: AddFolderProps) {
    const { t } = useTranslation();
    const initialFormState = {
        name: '',
        clientId: [] as string[],
        consultantId: '',
        partnerId: '',
        country: '',
    };

    const [formData, setFormData] = useState(initialFormState);

    // Fetch users from API
    const { data: allUsers, isLoading: isLoadingUsers } = useUsers({
        limit: '100', // Get more users to ensure we have enough of each role
    });

    if (!isOpen) return null;

    // Filter users by role from real API data - allUsers is RestrictedUserDto[] directly
    const users = allUsers || [];

    const clients = users
        .filter((user: RestrictedUserDto) => user.roles?.includes(UserRole.Client))
        .map((client: RestrictedUserDto) => ({
            label: `${client.firstName} ${client.lastName}`,
            value: client.id, // Keep as string UUID
        }));

    const consultants = users
        .filter((user: RestrictedUserDto) => user.roles?.includes(UserRole.Consultant))
        .map((consultant: RestrictedUserDto) => ({
            label: `${consultant.firstName} ${consultant.lastName}`,
            value: consultant.id, // Keep as string UUID
        }));

    const partners = users
        .filter((user: RestrictedUserDto) => user.roles?.includes(UserRole.Agent)) // Assuming partners are agents
        .map((partner: RestrictedUserDto) => ({
            label: `${partner.firstName} ${partner.lastName}`,
            value: partner.id, // Keep as string UUID
        }));

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
            name: formData.name,
            clientId: formData.clientId, // Already strings
            consultantId: formData.consultantId, // Already string
            partnerId: formData.partnerId, // Already string
            country: formData.country,
        });
        handleClose();
    };

    const handleClose = () => {
        setFormData(initialFormState);
        onClose();
    };

    const handleClientChange = (value: (string | number)[]) => {
        // Convert all values to strings and remove duplicates
        const uniqueIds = Array.from(new Set(value.map((v) => v.toString())));
        setFormData({
            ...formData,
            clientId: uniqueIds,
        });
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e as unknown as React.FormEvent);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="w-full max-w-md rounded-lg bg-white p-6">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-xl font-semibold">
                        {t('folders.components.addFolder.title')}
                    </h2>
                    <Button variant="ghost" onClick={handleClose}>
                        <X size={20} />
                    </Button>
                </div>

                {isLoadingUsers ? (
                    <div className="flex h-32 items-center justify-center">
                        <div className="text-sm text-gray-500">Loading users...</div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} className="space-y-4">
                        <div>
                            <Input
                                name="name"
                                label={t('folders.components.addFolder.name')}
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <MultiSelectInput
                                label={t('folders.components.addFolder.clients')}
                                options={clients}
                                value={formData.clientId}
                                onChange={handleClientChange}
                                placeholder={t('folders.components.addFolder.selectClients')}
                                required
                            />
                            {clients.length === 0 && (
                                <p className="mt-1 text-xs text-gray-500">
                                    No clients found. Users with Client role are required.
                                </p>
                            )}
                        </div>
                        <div>
                            <SelectInput
                                name="consultantId"
                                label={t('folders.components.addFolder.consultant')}
                                options={consultants}
                                value={formData.consultantId}
                                onChange={(value) => {
                                    setFormData({ ...formData, consultantId: value });
                                }}
                                required
                            />
                            {consultants.length === 0 && (
                                <p className="mt-1 text-xs text-gray-500">
                                    No consultants found. Users with Consultant role are required.
                                </p>
                            )}
                        </div>
                        <div>
                            <SelectInput
                                name="partnerId"
                                label={t('folders.components.addFolder.partner')}
                                options={partners}
                                value={formData.partnerId}
                                onChange={(value) => {
                                    setFormData({ ...formData, partnerId: value });
                                }}
                                required
                            />
                            {partners.length === 0 && (
                                <p className="mt-1 text-xs text-gray-500">
                                    No partners found. Users with Agent role are required.
                                </p>
                            )}
                        </div>
                        <div>
                            <Input
                                name="country"
                                label={t('folders.components.addFolder.country')}
                                value={formData.country}
                                onChange={(e) =>
                                    setFormData({ ...formData, country: e.target.value })
                                }
                                required
                            />
                        </div>

                        <div className="flex gap-2 pt-4">
                            <Button type="button" variant="secondary" onClick={handleClose}>
                                {t('common.cancel')}
                            </Button>
                            <Button
                                type="submit"
                                variant="primary"
                                className="flex-1"
                                disabled={
                                    !formData.name ||
                                    !formData.consultantId ||
                                    !formData.partnerId ||
                                    formData.clientId.length === 0 ||
                                    clients.length === 0 ||
                                    consultants.length === 0 ||
                                    partners.length === 0
                                }
                            >
                                {t('folders.components.addFolder.submit')}
                            </Button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
