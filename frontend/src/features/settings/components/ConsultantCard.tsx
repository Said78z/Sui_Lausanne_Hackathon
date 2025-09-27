import { useDrag } from 'react-dnd';
import { useTranslation } from 'react-i18next';

// Types
interface Consultant {
    id: string;
    name: string;
    maxMeetings: number;
    currentMeetings: number;
}

interface ConsultantCardProps {
    consultant: Consultant;
}

// Constants - moved here to be part of the component
const ItemTypes = {
    CONSULTANT: 'CONSULTANT',
} as const;

export default function ConsultantCard({ consultant }: ConsultantCardProps) {
    const { t } = useTranslation();
    const [{ isDragging }, drag] = useDrag(
        () => ({
            type: ItemTypes.CONSULTANT,
            item: { id: consultant.id },
            collect: (monitor) => ({
                isDragging: monitor.isDragging(),
            }),
        }),
        [consultant.id]
    );

    return (
        <div
            ref={drag}
            className={`mb-2 flex cursor-grab items-center justify-between rounded border bg-white px-3 py-2 shadow-sm transition-opacity ${isDragging ? 'opacity-40' : 'opacity-100'}`}
        >
            <span>{consultant.name}</span>
            <span className="ml-2 text-xs text-gray-500">
                {consultant.maxMeetings} {t('settings.sdr.maxMeetings')}
            </span>
            <span className="ml-2 rounded bg-green-600 px-2 py-1 text-xs text-white">
                {consultant.currentMeetings} {t('settings.sdr.currentMeetings')}
                {consultant.currentMeetings > 1 ? 's' : ''}
            </span>
        </div>
    );
}

export { ItemTypes };
export type { Consultant };

