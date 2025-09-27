import type React from 'react';

import { type HTMLMotionProps, motion } from 'framer-motion';

interface CardProps
    extends Omit<React.HTMLAttributes<HTMLDivElement>, keyof HTMLMotionProps<'div'>>,
        HTMLMotionProps<'div'> {
    children: React.ReactNode;
    maxWidth?: string;
    padding?: string;
    backgroundColor?: string;
    initialAnimation?: HTMLMotionProps<'div'>['initial'];
    animateAnimation?: HTMLMotionProps<'div'>['animate'];
    transitionDuration?: number;
}

export const Card: React.FC<CardProps> = ({
    children,
    maxWidth = 'max-w-md',
    padding = 'p-10',
    backgroundColor = 'bg-white',
    initialAnimation = { opacity: 0, y: -20 },
    animateAnimation = { opacity: 1, y: 0 },
    transitionDuration = 0.5,
    className = '',
    ...props
}) => {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
            <motion.div
                initial={initialAnimation}
                animate={animateAnimation}
                transition={{ duration: transitionDuration }}
                className={`${maxWidth} w-full space-y-8 ${padding} ${backgroundColor} rounded-xl shadow-lg ${className}`}
                {...props}
            >
                {children}
            </motion.div>
        </div>
    );
};
