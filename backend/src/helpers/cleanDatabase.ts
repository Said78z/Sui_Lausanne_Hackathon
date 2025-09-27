import prisma from '@/config/prisma';

export async function cleanDatabase() {
    console.log('🧹 Cleaning database...');

    try {
        // Supprimer d'abord les relations de lecture de messages
        await prisma.messageRead.deleteMany();

        // Supprimer ensuite les messages et les participants de conversation
        await prisma.message.deleteMany();
        await prisma.chatParticipant.deleteMany();
        await prisma.chat.deleteMany();

        // Supprimer les données qui dépendent des utilisateurs
        await prisma.prospectingQueue.deleteMany();
        await prisma.call.deleteMany();
        await prisma.prospect.deleteMany();
        await prisma.portalActivity.deleteMany();
        await prisma.alert.deleteMany();
        await prisma.simulation.deleteMany();
        await prisma.token.deleteMany();
        await prisma.employee.deleteMany();
        await prisma.client.deleteMany();
        await prisma.invitationRequest.deleteMany();
        await prisma.realEstateAgent.deleteMany();
        await prisma.dossier.deleteMany();
        await prisma.suggestion.deleteMany();
        await prisma.activity.deleteMany();
        await prisma.yousignDocument.deleteMany();
        await prisma.purchaseOffer.deleteMany();
        await prisma.media.deleteMany();
        await prisma.powerdialerSession.deleteMany();
        await prisma.powerdialerSessionRequest.deleteMany();
        await prisma.call.deleteMany();
        await prisma.entityChangelog.deleteMany();
        await prisma.note.deleteMany();
        await prisma.applicationParameter.deleteMany();
        await prisma.checklistItem.deleteMany();
        await prisma.yousignDocument.deleteMany();
        await prisma.suggestion.deleteMany();
        await prisma.purchaseOffer.deleteMany();
        await prisma.invitationRequest.deleteMany();

        // Supprimer les données liées aux opportunités et lots
        await prisma.opportunity.deleteMany();
        await prisma.lot.deleteMany();

        // Supprimer les utilisateurs et agences immobilières avant les adresses
        await prisma.user.deleteMany();
        await prisma.realEstateAgency.deleteMany();
        await prisma.address.deleteMany();

        // Supprimer les données liées aux villes
        await prisma.city.deleteMany();

        // Supprimer les entités géographiques
        await prisma.urbanArea.deleteMany();
        await prisma.department.deleteMany();
        await prisma.region.deleteMany();
        await prisma.country.deleteMany();

        // Supprimer les autres données
        await prisma.autopilot.deleteMany();

        console.log('✅ Database cleaned successfully');
    } catch (error) {
        console.error('❌ Error in cleanup process:', error);
        throw error;
    }
}
