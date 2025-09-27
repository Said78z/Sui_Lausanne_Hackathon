import { api } from '@/api/interceptor';
import { formatDateForBackend } from '@/utils/dateUtils';

import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';

import { zodResolver } from '@hookform/resolvers/zod';
import { AcceptInvitationRequestSchema, acceptInvitationRequestSchema } from '@shared/dto';
import { CivilityEnum } from '@shared/enums';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

import { Button } from '@/components/ui/Button/Button';
import { DatePicker } from '@/components/ui/DatePicker/DatePicker';
import { Input } from '@/components/ui/Input/Input';
import Loader from '@/components/ui/Loader/Loader';
import { SelectInput } from '@/components/ui/SelectInput/SelectInput';

const AcceptInvitation = () => {
    const { token } = useParams<{ token: string }>();
    useTranslation(['auth', 'common']);
    const navigate = useNavigate();

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [invitationData, setInvitationData] = useState<{ email: string } | null>(null);

    const {
        handleSubmit,
        formState: { errors, isSubmitting, isValid },
        control,
        trigger,
        setValue,
    } = useForm<AcceptInvitationRequestSchema>({
        resolver: zodResolver(acceptInvitationRequestSchema),
        defaultValues: {
            firstName: '',
            lastName: '',
            password: '',
            civility: CivilityEnum.MR,
            birthDate: undefined,
            token: token || '',
        },
        mode: 'onChange',
    });

    // Set token value when it becomes available
    useEffect(() => {
        if (token) {
            setValue('token', token);
        }
    }, [token, setValue]);

    // Debug form validation
    useEffect(() => {
        if (Object.keys(errors).length > 0) {
            console.log('Form validation errors:', errors);
        }
    }, [errors]);

    useEffect(() => {
        const verifyToken = async () => {
            try {
                setIsLoading(true);
                setError(null);

                const response = await api.fetchRequest(
                    `/api/invitation-requests/verify/${token}`,
                    'GET',
                    null
                );

                if (response && response.data) {
                    setInvitationData(response.data);
                } else {
                    setError('Invitation non valide ou expirée');
                }
            } catch (err: any) {
                setError(
                    err.message || "Une erreur est survenue lors de la vérification de l'invitation"
                );
            } finally {
                setIsLoading(false);
            }
        };

        if (token) {
            verifyToken();
        } else {
            setError("Token d'invitation manquant");
            setIsLoading(false);
        }
    }, [token]);

    const onSubmit = async (data: AcceptInvitationRequestSchema) => {
        try {
            setError(null);
            console.log('Form data submitted:', data);
            console.log('Token from URL:', token);
            console.log('Token from form:', data.token);

            // No need to manually add the token since it's already in the form data
            const submitData = {
                ...data,
                email: invitationData?.email,
            };

            console.log('Data being sent to API:', submitData);

            try {
                // Try direct fetch call
                const directResponse = await fetch(
                    'http://localhost:3000/api/invitation-requests/accept',
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(submitData),
                    }
                );

                const directResponseData = await directResponse.json();
                console.log('Direct API response:', directResponseData);

                if (!directResponse.ok) {
                    throw new Error(directResponseData.message || 'Error from direct API call');
                }

                // If direct call succeeds, continue with normal flow
                navigate('/login', {
                    state: {
                        message:
                            'Votre compte a été créé avec succès. Vous pouvez maintenant vous connecter.',
                    },
                });
            } catch (directError: any) {
                console.error('Direct fetch error:', directError);
                throw directError;
            }
        } catch (err: any) {
            console.error('Error submitting form:', err);
            console.error('Error details:', err.response?.data || err.message);
            setError(err.message || 'Une erreur est survenue lors de la création de votre compte');
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex h-screen flex-col items-center justify-center p-4">
                <div className="mb-6 text-center text-red-600">{error}</div>
                <Button onClick={() => navigate('/login')}>Retour à la page de connexion</Button>
            </div>
        );
    }

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Form submission attempted');

        // Use the standard handleSubmit function
        handleSubmit((data) => {
            console.log('Form is valid, submitting:', data);
            onSubmit(data);
        })(e);
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
            <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
                <h1 className="mb-6 text-center text-2xl font-bold text-gray-900">
                    Créer votre compte
                </h1>

                {invitationData && (
                    <div className="mb-6 rounded-md bg-blue-50 p-4 text-center text-blue-700">
                        Vous avez été invité avec l'adresse email:{' '}
                        <strong>{invitationData.email}</strong>
                    </div>
                )}

                <form onSubmit={handleFormSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Controller
                                name="civility"
                                control={control}
                                render={({ field }) => (
                                    <SelectInput
                                        label="Civilité"
                                        name={field.name}
                                        value={field.value}
                                        onChange={field.onChange}
                                        error={errors.civility?.message}
                                        options={[
                                            { value: CivilityEnum.MR, label: 'Monsieur' },
                                            { value: CivilityEnum.MRS, label: 'Madame' },
                                        ]}
                                        required
                                    />
                                )}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Controller
                                name="firstName"
                                control={control}
                                render={({ field }) => (
                                    <Input
                                        label="Prénom"
                                        type="text"
                                        name={field.name}
                                        value={field.value}
                                        onChange={field.onChange}
                                        error={errors.firstName?.message}
                                        placeholder="Votre prénom"
                                        required
                                    />
                                )}
                            />
                        </div>
                        <div>
                            <Controller
                                name="lastName"
                                control={control}
                                render={({ field }) => (
                                    <Input
                                        label="Nom"
                                        type="text"
                                        name={field.name}
                                        value={field.value}
                                        onChange={field.onChange}
                                        error={errors.lastName?.message}
                                        placeholder="Votre nom"
                                        required
                                    />
                                )}
                            />
                        </div>
                    </div>

                    <Controller
                        name="birthDate"
                        control={control}
                        render={({ field }) => (
                            <DatePicker
                                label="Date de naissance"
                                value={field.value ? new Date(field.value) : undefined}
                                onChange={(date) => {
                                    if (date) {
                                        // Format date as yyyy-MM-dd for backend but display it in a user-friendly format
                                        const formattedDate = formatDateForBackend(date);
                                        console.log('Formatted date for backend:', formattedDate);

                                        // Display date in French format (dd/MM/yyyy)
                                        const displayDate = format(date, 'dd/MM/yyyy', {
                                            locale: fr,
                                        });
                                        console.log('Display date for user:', displayDate);

                                        field.onChange(formattedDate);
                                    } else {
                                        field.onChange(undefined);
                                    }
                                }}
                                error={errors.birthDate?.message}
                            />
                        )}
                    />

                    <Controller
                        name="phone"
                        control={control}
                        render={({ field }) => (
                            <Input
                                label="Téléphone"
                                type="tel"
                                name={field.name}
                                value={field.value}
                                onChange={field.onChange}
                                error={errors.phone?.message}
                                placeholder="Votre numéro de téléphone"
                            />
                        )}
                    />

                    <Controller
                        name="password"
                        control={control}
                        render={({ field }) => (
                            <Input
                                label="Mot de passe"
                                type="password"
                                name={field.name}
                                value={field.value}
                                onChange={field.onChange}
                                error={errors.password?.message}
                                placeholder="Votre mot de passe"
                                required
                            />
                        )}
                    />

                    <Button
                        type="submit"
                        className="w-full"
                        disabled={isSubmitting}
                        onClick={() => console.log('Button clicked')}
                    >
                        {isSubmitting ? <Loader /> : 'Créer mon compte'}
                    </Button>
                </form>
            </div>
        </div>
    );
};

export default AcceptInvitation;
