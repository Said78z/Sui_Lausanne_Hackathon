import { useDrop } from 'react-dnd';

import ConsultantCard, { Consultant, ItemTypes } from './ConsultantCard';

interface GroupColumnProps {
    groupId: string;
    consultants: Consultant[];
    onDropConsultant: (consultantId: string, toGroup: string) => void;
    title: string;
}

export default function GroupColumn({
    groupId,
    consultants,
    onDropConsultant,
    title,
}: GroupColumnProps) {
    const [, drop] = useDrop({
        accept: ItemTypes.CONSULTANT,
        drop: (item: { id: string }) => {
            onDropConsultant(item.id, groupId);
        },
    });

    return (
        <div
            ref={drop}
            className="scrollbar-simple scrollbar-simple max-h-96 min-h-[120px] overflow-y-auto rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4"
        >
            <h3 className="mb-2 text-sm font-semibold">{title}</h3>
            {consultants.map((consultant) => (
                <ConsultantCard key={consultant.id} consultant={consultant} />
            ))}
        </div>
    );
}
