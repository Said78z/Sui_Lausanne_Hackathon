import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { File } from 'lucide-react';

interface RemarkDetailDefinitionProps {
    onGoalChange?: (value: string) => void;
    initialGoal?: string;
}

export default function RemarkDetailDefinition({
    onGoalChange,
    initialGoal,
}: RemarkDetailDefinitionProps) {
    const { t } = useTranslation();
    const [goal, setGoal] = useState(initialGoal || '');

    // Update state when initialGoal prop changes
    useEffect(() => {
        if (initialGoal !== undefined && initialGoal !== goal) {
            setGoal(initialGoal);
        }
    }, [initialGoal, goal]);

    const handleGoalChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newValue = event.target.value;
        setGoal(newValue);
        onGoalChange?.(newValue);
    };

    return (
        <>
            <section className="mb-10 pt-6">
                <div className="mb-6 flex items-center justify-start gap-4">
                    <span className="flex items-center gap-2 text-lg font-medium">
                        <File size={20} /> {t('searchDefinition.remarkDetail.title')}
                    </span>
                </div>
                <p className="mb-6 text-sm text-gray-400">
                    {t('searchDefinition.remarkDetail.description')}
                </p>
                <textarea
                    className="h-32 w-full resize-none rounded-lg border border-gray-200 p-4 focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder={t('searchDefinition.remarkDetail.placeholder')}
                    value={goal}
                    onChange={handleGoalChange}
                />
            </section>
        </>
    );
}
