import { useCallsByProspectId } from '@/api/queries/callQueries';
import { TableCell } from '@/components/ui/Table/Table';
import { CallResult } from '@shared/enums';

interface ProspectCallInfoProps {
    prospectId: string;
}

export const ProspectCallInfo: React.FC<ProspectCallInfoProps> = ({ prospectId }) => {
    const { data: calls, isLoading } = useCallsByProspectId(prospectId);

    if (isLoading) {
        return (
            <>
                <TableCell>Chargement...</TableCell>
                <TableCell>Chargement...</TableCell>
                <TableCell>Chargement...</TableCell>
            </>
        );
    }

    const lastCall = calls && calls.length > 0 ? calls[0] : null;

    return (
        <>
            <TableCell>
                {lastCall
                    ? new Date(lastCall.calledAt).toLocaleDateString()
                    : 'Aucun appel'}
            </TableCell>
            <TableCell>
                {lastCall?.calledById || 'N/A'}
            </TableCell>
            <TableCell>
                {lastCall && (lastCall.callResult === CallResult.CALLBACK_TODAY || lastCall.callResult === CallResult.CALLBACK_FUTURE)
                    ? new Date(
                          new Date(lastCall.calledAt).getTime() +
                              24 * 60 * 60 * 1000
                      ).toLocaleDateString()
                    : 'Aucune restriction'}
            </TableCell>
        </>
    );
};
