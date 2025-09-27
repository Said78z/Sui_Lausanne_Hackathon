import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function cleanDatabase() {
    // Fonction utilitaire pour supprimer en toute sécurité
    async function safeDelete(callback: () => Promise<any>, entityName: string) {
        try {
            await callback();
        } catch (error: any) {
            if (error.code === 'P2021') {
                console.log(`Table pour ${entityName} n'existe pas encore, ignorée`);
            } else {
                console.error(`Erreur lors de la suppression de ${entityName}:`, error);
            }
        }
    }

    // Suppression des entités liées aux villes (dans l'ordre inverse des dépendances)
    await safeDelete(() => prisma.cityCrimeStats.deleteMany(), 'cityCrimeStats');
    await safeDelete(() => prisma.cityCultureAndServices.deleteMany(), 'cityCultureAndServices');
    await safeDelete(() => prisma.cityDemographics.deleteMany(), 'cityDemographics');
    await safeDelete(() => prisma.cityHousing.deleteMany(), 'cityHousing');
    await safeDelete(() => prisma.cityRealEstate.deleteMany(), 'cityRealEstate');
    await safeDelete(() => prisma.citySocioEconomics.deleteMany(), 'citySocioEconomics');
    await safeDelete(() => prisma.cityTransport.deleteMany(), 'cityTransport');
    await safeDelete(() => prisma.portalActivity.deleteMany(), 'portalActivity');
    await safeDelete(() => prisma.alert.deleteMany(), 'alert');
    await safeDelete(() => prisma.nearbyCity.deleteMany(), 'nearbyCity');
    await safeDelete(() => prisma.city.deleteMany(), 'city');

    // Suppression des entités géographiques (dans l'ordre inverse des dépendances)
    await safeDelete(() => prisma.urbanArea.deleteMany(), 'urbanArea');
    await safeDelete(() => prisma.department.deleteMany(), 'department');
    await safeDelete(() => prisma.region.deleteMany(), 'region');
    await safeDelete(() => prisma.country.deleteMany(), 'country');

    // Suppression des autres entités
    await safeDelete(() => prisma.email.deleteMany(), 'email');
    await safeDelete(() => prisma.token.deleteMany(), 'token');
    await safeDelete(() => prisma.adress.deleteMany(), 'adress');
    await safeDelete(() => prisma.autopilot.deleteMany(), 'autopilot');
    await safeDelete(() => prisma.user.deleteMany(), 'user');
    await safeDelete(() => prisma.simulation.deleteMany(), 'simulation');

    console.log('Database cleaned successfully');
}
