import { useGetAllEmails } from '@/api/emailQueries';
import { useGetAllSms } from '@/api/smsQueries';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components';
import { EmailDto } from '@shared/dto/emailDto';
import { SmsDto } from '@shared/dto/smsDto';
import { Mail, MessageSquare, Phone } from 'lucide-react';

interface AutomaticEmailHistoryProps {
    prospectId: string;
}

// Combined type for display
type CommunicationItem = {
    id: string;
    type: 'EMAIL' | 'SMS';
    subject?: string;
    content: string;
    sentAt: string | null;
    openedAt?: string | null;
    from: string;
    to: string | string[];
    category?: string;
    smsType?: string;
};

export function AutomaticEmailHistory({ prospectId }: AutomaticEmailHistoryProps) {
    console.log('AutomaticEmailHistory - prospectId:', prospectId); // Debug line
    
    const { data: emailsResponse, isLoading: emailsLoading, error: emailsError } = useGetAllEmails({
        prospectId: prospectId
    });
    
    const { data: smsResponse, isLoading: smsLoading, error: smsError } = useGetAllSms({
        prospectId: prospectId
    });

    console.log('AutomaticEmailHistory - emailsResponse:', emailsResponse); // Debug line
    console.log('AutomaticEmailHistory - smsResponse:', smsResponse); // Debug line
    console.log('AutomaticEmailHistory - emailsLoading:', emailsLoading, 'emailsError:', emailsError); // Debug line
    console.log('AutomaticEmailHistory - smsLoading:', smsLoading, 'smsError:', smsError); // Debug line

    // Early return if no prospect ID
    if (!prospectId) {
        return (
            <div className="relative w-full rounded-xl border border-gray-200 bg-white p-10">
                <div className="absolute left-0 top-1/2 h-2/3 w-1 -translate-y-1/2 bg-tertiary"></div>
                <h2 className="mb-6 text-sm text-gray-600">Historique des communications automatiques</h2>
                <div className="text-center text-gray-500">Aucun prospect sélectionné</div>
            </div>
        );
    }

    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'Non renseigné';
        return new Date(dateString).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getIcon = (type: 'EMAIL' | 'SMS', smsType?: string) => {
        if (type === 'EMAIL') {
            return <Mail className="h-4 w-4 text-blue-500" />;
        }
        if (smsType === 'whatsApp') {
            return <MessageSquare className="h-4 w-4 text-green-500" />;
        }
        return <Phone className="h-4 w-4 text-purple-500" />;
    };

    const getStatusBadge = (item: CommunicationItem) => {
        if (item.type === 'EMAIL') {
            if (item.openedAt) {
                return <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">Lu</span>;
            }
            if (item.sentAt) {
                return <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">Envoyé</span>;
            }
        } else {
            if (item.sentAt) {
                return <span className="inline-flex items-center rounded-full bg-purple-100 px-2 py-1 text-xs font-medium text-purple-800">Envoyé</span>;
            }
        }
        return <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-800">En attente</span>;
    };

    // Transform emails to communication items
    const emailItems: CommunicationItem[] = (emailsResponse?.data || []).map((email: EmailDto) => ({
        id: email.id,
        type: 'EMAIL' as const,
        subject: email.content.subject,
        content: email.content.body || '',
        sentAt: email.sentAt,
        openedAt: email.openedAt,
        from: email.from,
        to: email.to,
        category: email.category,
    }));

    // Transform SMS to communication items
    const smsItems: CommunicationItem[] = (smsResponse?.data || []).map((sms: SmsDto) => ({
        id: sms.id,
        type: 'SMS' as const,
        content: sms.content,
        sentAt: sms.sentAt,
        from: sms.from,
        to: sms.to,
        category: sms.category,
        smsType: sms.type,
    }));

    console.log('AutomaticEmailHistory - emailItems count:', emailItems.length);
    console.log('AutomaticEmailHistory - smsItems count:', smsItems.length);

    // Combine and sort by date
    const allCommunications = [...emailItems, ...smsItems].sort((a, b) => {
        if (!a.sentAt) return 1;
        if (!b.sentAt) return -1;
        return new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime();
    });

    console.log('AutomaticEmailHistory - allCommunications count:', allCommunications.length);

    const isLoading = emailsLoading || smsLoading;
    const hasError = emailsError || smsError;

    return (
        <div className="relative w-full rounded-xl border border-gray-200 bg-white p-10">
            <div className="absolute left-0 top-1/2 h-2/3 w-1 -translate-y-1/2 bg-tertiary"></div>
            <h2 className="mb-6 text-sm text-gray-600">Historique des communications automatiques</h2>
            
            {isLoading && (
                <div className="text-center text-gray-500">Chargement des communications...</div>
            )}
            
            {hasError && (
                <div className="text-center text-red-500">
                    <div>Erreur lors du chargement des communications:</div>
                    {emailsError && <div className="text-sm">Emails: {emailsError.message}</div>}
                    {smsError && <div className="text-sm">SMS: {smsError.message}</div>}
                </div>
            )}
            
            {!isLoading && !hasError && allCommunications.length === 0 && (
                <div className="text-center text-gray-500">Aucune communication automatique envoyée</div>
            )}
            
            {allCommunications.length > 0 && (
                <div className="h-96 overflow-auto border rounded-lg">
                    <Table>
                        <TableHeader className="sticky top-0 bg-white z-10 border-b">
                            <TableRow>
                                <TableHead className="bg-gray-50">Type</TableHead>
                                <TableHead className="bg-gray-50">Sujet/Contenu</TableHead>
                                <TableHead className="bg-gray-50">Date d'envoi</TableHead>
                                <TableHead className="bg-gray-50">Statut</TableHead>
                                <TableHead className="bg-gray-50">Catégorie</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {allCommunications.map((item) => (
                                <TableRow key={`${item.type}-${item.id}`} className="hover:bg-gray-50">
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            {getIcon(item.type, item.smsType)}
                                            <span className="text-sm font-medium">
                                                {item.type === 'EMAIL' ? 'Email' : 
                                                 item.smsType === 'whatsApp' ? 'WhatsApp' : 'SMS'}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="max-w-xs">
                                            {item.type === 'EMAIL' && item.subject && (
                                                <div className="font-medium text-sm">{item.subject}</div>
                                            )}
                                            <div className="text-sm text-gray-600 truncate">
                                                {item.content || 'Contenu non renseigné'}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>{formatDate(item.sentAt)}</TableCell>
                                    <TableCell>{getStatusBadge(item)}</TableCell>
                                    <TableCell>
                                        <span className="text-sm capitalize">{item.category || 'Non classé'}</span>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}
        </div>
    );
}
