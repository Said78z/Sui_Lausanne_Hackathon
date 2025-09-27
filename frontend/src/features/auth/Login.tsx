import { useLogin } from '@/api/queries/authQueries';
import { Button, Checkbox, Input, Label } from '@/components';

import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';

import { zodResolver } from '@hookform/resolvers/zod';
import { LoginSchema, loginSchema } from '@shared/dto';
import { motion } from 'framer-motion';

export default function Login() {
    const navigate = useNavigate();
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        watch,
        setValue,
        getValues,
    } = useForm<LoginSchema>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: '',
            password: '',
            rememberMe: false,
        },
    });

    const { mutate: loginUser, isPending } = useLogin();
    const rememberMe = watch('rememberMe');

    const onSubmit = async (data: LoginSchema) => {
        try {
            loginUser(data, {
                onSuccess: () => {
                    console.log('Login successful');
                    navigate('/profile');
                },
            });
        } catch (error) {}
    };

    const handleRememberMeChange = (checked: boolean) => {
        setValue('rememberMe', checked);
    };

    return (
        <div className="flex min-h-screen">
            {/* Colonne gauche: Branding (65%) */}
            <div className="hidden w-full bg-[#10142C] lg:block lg:w-[65%]"></div>

            {/* Colonne droite: Formulaire (35%) */}
            <div className="flex w-full flex-col items-center justify-center bg-white p-8 lg:w-[35%]">
                <div className="w-full max-w-md space-y-8">
                    <div>
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: 'spring', stiffness: 260, damping: 20 }}
                            className="mx-auto flex h-16 w-16 items-center justify-center rounded-full"
                        >
                            <img src="/images/logo/CFI_décli_2_blue.svg" alt="logo" />
                        </motion.div>
                        <h1 className="mt-6 text-center text-2xl font-bold text-gray-900">
                            Connexion à votre espace
                        </h1>
                        <p className="mt-8 text-center text-lg font-medium">
                            Bienvenue sur Cash Flow Positif 👋
                        </p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="space-y-4 rounded-md">
                            <Input
                                label="Email"
                                type="email"
                                {...register('email')}
                                error={errors.email?.message}
                                placeholder="votre@email.com"
                            />
                            <Input
                                label="Mot de passe"
                                type="password"
                                {...register('password')}
                                error={errors.password?.message}
                                placeholder="••••••••"
                            />
                            <Link
                                to="/forgot-password"
                                className="flex w-full justify-end text-right text-xs font-medium text-primary hover:underline"
                            >
                                Mot de passe oublié ?
                            </Link>
                        </div>

                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="rememberMe"
                                checked={rememberMe ?? false}
                                onChange={handleRememberMeChange}
                            />
                            <Label
                                htmlFor="rememberMe"
                                className="text-sm font-normal text-gray-600"
                            >
                                Rester connecté
                            </Label>
                        </div>

                        <Button type="submit" disabled={isPending} className="w-full py-3">
                            {isPending ? 'Connexion en cours...' : 'Se connecter à mon compte'}
                        </Button>

                        <div className="relative flex items-center py-2">
                            <div className="flex-grow border-t border-gray-300"></div>
                            <span className="mx-4 flex-shrink text-sm text-gray-500">ou</span>
                            <div className="flex-grow border-t border-gray-300"></div>
                        </div>
                        <div className="text-center text-sm">
                            Vous n&apos;avez pas de compte ?{' '}
                            <Link to="/register" className="text-primary hover:underline">
                                Créer un compte
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
