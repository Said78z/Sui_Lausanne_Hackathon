import FormattedDateService from '@/services/formattedDateService';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';

import { zodResolver } from '@hookform/resolvers/zod';
import { UpdatePasswordDto, updatePasswordSchema } from '@shared/dto/authDto';
import { Camera, CheckCircle, MailOpen, Phone, User2 } from 'lucide-react';

import { Button, Input } from '@/components/';

import { useAuthStore } from '@/stores/authStore';

export default function Profile() {
    const { user, setUser } = useAuthStore();
    const { t } = useTranslation();
    const [isLoading, setIsLoading] = useState(false);
    const [isEmailVerified, setIsEmailVerified] = useState(true);
    const [showPasswordForm, setShowPasswordForm] = useState(false);

    // Configuration de React Hook Form avec Zod
    const {
        register,
        handleSubmit: handlePasswordFormSubmit,
        formState: { errors: passwordErrors },
        reset: resetPasswordForm,
    } = useForm<UpdatePasswordDto>({
        resolver: zodResolver(updatePasswordSchema),
        defaultValues: {
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
        },
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        try {
            setIsLoading(true);
            // Logique pour sauvegarder les modifications
            // await updateUserProfile(user);
            toast.success(t('profile.toast.profileUpdated'));
        } catch (error) {
            toast.error(t('profile.toast.profileUpdateError'));
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const onPasswordSubmit = async (data: UpdatePasswordDto) => {
        if (!user) return;

        try {
            setIsLoading(true);
            // Vérifier le mot de passe actuel
            // const isCurrentPasswordValid = await verifyCurrentPassword(data.currentPassword);
            // if (!isCurrentPasswordValid) {
            //     toast.error(t('profile.toast.currentPasswordError'));
            //     return;
            // }

            // Logique pour changer le mot de passe
            // await updatePassword(data.newPassword);
            toast.success(t('profile.toast.passwordUpdated'));

            // Réinitialiser le formulaire et le cacher après soumission
            resetPasswordForm();
            setShowPasswordForm(false);
        } catch (error) {
            toast.error(t('profile.toast.passwordUpdateError'));
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const togglePasswordForm = () => {
        if (showPasswordForm) {
            resetPasswordForm();
        }
        setShowPasswordForm(!showPasswordForm);
    };

    if (!user) {
        return <div>{t('profile.loading')}</div>;
    }

    return (
        <div className="w-full max-w-[calc(100vw-23rem)] px-4 py-4 font-sans text-gray-800">
            <h1 className="mb-6 text-xl font-bold sm:text-2xl">{t('profile.title')}</h1>

            <div className="relative flex flex-col gap-6 lg:flex-row">
                {/* Section principale - Informations personnelles */}
                <div className="w-full overflow-y-auto lg:w-2/3">
                    <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6">
                        <div className="mb-4 flex flex-col items-start justify-center">
                            <h2 className="text-lg font-bold">{t('profile.personalInfo.title')}</h2>
                            <p className="text-sm text-gray-500">
                                {t('profile.personalInfo.description')}
                            </p>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                    <Input
                                        name="firstName"
                                        label={t('profile.personalInfo.firstName')}
                                        type="text"
                                        value={user.firstName}
                                        leftIcon={
                                            <User2
                                                size={18}
                                                className="mr-2 flex-shrink-0 text-gray-400"
                                            />
                                        }
                                        onChange={(e) =>
                                            setUser({ ...user, firstName: e.target.value })
                                        }
                                        required
                                    />
                                </div>
                                <div>
                                    <Input
                                        name="lastName"
                                        label={t('profile.personalInfo.lastName')}
                                        type="text"
                                        value={user.lastName}
                                        leftIcon={
                                            <User2
                                                size={18}
                                                className="mr-2 flex-shrink-0 text-gray-400"
                                            />
                                        }
                                        onChange={(e) =>
                                            setUser({ ...user, lastName: e.target.value })
                                        }
                                        required
                                    />
                                </div>
                            </div>

                            <div className="mb-4">
                                <div className="mb-1 flex gap-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        {t('profile.personalInfo.email')}
                                    </label>
                                    {isEmailVerified && (
                                        <div className="ml-2 flex items-center rounded-md bg-green-100 px-2 py-1 text-xs text-green-800">
                                            <CheckCircle size={14} className="mr-1" />
                                            {t('profile.personalInfo.emailVerified')}
                                        </div>
                                    )}
                                </div>
                                <div className="grid grid-cols-1">
                                    <Input
                                        name="email"
                                        label=""
                                        type="email"
                                        value={user.email}
                                        leftIcon={
                                            <MailOpen
                                                size={18}
                                                className="mr-2 flex-shrink-0 text-gray-400"
                                            />
                                        }
                                        onChange={(e) =>
                                            setUser({ ...user, email: e.target.value })
                                        }
                                        required
                                    />
                                </div>
                                <p className="mt-1 text-xs text-gray-500">
                                    {t('profile.personalInfo.emailDescription')}
                                </p>
                            </div>

                            <div className="mb-4">
                                <Input
                                    name="phone"
                                    label={t('profile.personalInfo.phone')}
                                    type="tel"
                                    value={user.phone || ''}
                                    leftIcon={
                                        <Phone
                                            size={18}
                                            className="mr-2 flex-shrink-0 text-gray-400"
                                        />
                                    }
                                    onChange={(e) => setUser({ ...user, phone: e.target.value })}
                                />
                                <p className="mt-1 text-xs text-gray-500">
                                    {t('profile.personalInfo.phoneDescription')}
                                </p>
                            </div>

                            <Button type="submit" variant="primary" isLoading={isLoading}>
                                {t('profile.personalInfo.saveChanges')}
                            </Button>
                        </form>
                    </div>

                    <div className="rounded-xl border border-gray-200 bg-white p-6">
                        <h2 className="mb-4 text-lg font-bold">{t('profile.security.title')}</h2>

                        <div className="mb-6">
                            <Button
                                variant="primary"
                                className="w-full border-gray-300 md:w-auto"
                                onClick={togglePasswordForm}
                            >
                                {t('profile.security.changePassword')}
                            </Button>

                            <form
                                onSubmit={handlePasswordFormSubmit(onPasswordSubmit)}
                                className={`mt-4 space-y-4 overflow-hidden transition-all duration-300 ${showPasswordForm ? 'max-h-[100vh]' : 'max-h-0'}`}
                            >
                                <div>
                                    <Input
                                        {...register('currentPassword')}
                                        name="currentPassword"
                                        label={t('profile.security.currentPassword')}
                                        type="password"
                                        error={passwordErrors.currentPassword?.message}
                                        required
                                    />
                                </div>
                                <div>
                                    <Input
                                        {...register('newPassword')}
                                        name="newPassword"
                                        label={t('profile.security.newPassword')}
                                        type="password"
                                        error={passwordErrors.newPassword?.message}
                                        required
                                    />
                                </div>
                                <div>
                                    <Input
                                        {...register('confirmPassword')}
                                        name="confirmPassword"
                                        label={t('profile.security.confirmPassword')}
                                        type="password"
                                        error={passwordErrors.confirmPassword?.message}
                                        required
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="border-gray-300"
                                        onClick={() => {
                                            setShowPasswordForm(false);
                                            resetPasswordForm();
                                        }}
                                    >
                                        {t('profile.security.cancel')}
                                    </Button>
                                    <Button type="submit" variant="primary" isLoading={isLoading}>
                                        {t('profile.security.save')}
                                    </Button>
                                </div>
                            </form>
                        </div>

                        <div>
                            <h3 className="text-md mb-2 font-semibold">
                                {t('profile.security.twoFactor.title')}
                            </h3>
                            <p className="mb-3 text-sm text-gray-600">
                                {t('profile.security.twoFactor.description')}
                            </p>
                            <Button variant="primary" className="w-full border-gray-300 md:w-auto">
                                {t('profile.security.twoFactor.configure')}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Section latérale - Profil et statistiques */}
                <div className="w-full self-start lg:sticky lg:top-4 lg:w-1/3">
                    <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6">
                        <h2 className="mb-4 text-lg font-bold">{t('profile.profile.title')}</h2>

                        <div className="mb-4 flex flex-col items-center">
                            <div className="relative mb-2 flex h-24 w-24 items-center justify-center rounded-full bg-gray-200 text-gray-500">
                                <span className="text-2xl font-bold">
                                    {user.firstName[0]}
                                    {user.lastName[0]}
                                </span>
                                <div className="absolute bottom-0 right-0 rounded-full bg-tertiary p-1 text-white">
                                    <Camera size={16} />
                                </div>
                            </div>

                            <h3 className="text-lg font-semibold">
                                {user.firstName} {user.lastName}
                            </h3>
                            <p className="text-sm text-gray-500">{user.email}</p>
                            <p className="text-xs text-gray-400">
                                {t('profile.profile.memberSince')}{' '}
                                {FormattedDateService.formatDate(user.createdAt)}
                            </p>

                            {user?.isVerified && (
                                <div className="mt-2 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
                                    {t('profile.profile.verified')}
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col gap-2">
                            <Button variant="primary">{t('profile.profile.changePhoto')}</Button>
                        </div>
                    </div>

                    <div className="rounded-xl border border-gray-200 bg-white p-6">
                        <h2 className="mb-4 text-lg font-bold">{t('profile.statistics.title')}</h2>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-gray-600">
                                    {t('profile.statistics.signedContracts')}
                                </span>
                                <span className="font-semibold">3</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-gray-600">
                                    {t('profile.statistics.totalClients')}
                                </span>
                                <span className="font-semibold">15</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-gray-600">
                                    {t('profile.statistics.clientProcessRate')}
                                </span>
                                <span className="font-semibold">21%</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
