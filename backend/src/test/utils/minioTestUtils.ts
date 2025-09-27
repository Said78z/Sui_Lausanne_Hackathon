import { expect } from '@jest/globals';

import { minioService } from '@/services/minioService';

/**
 * Vérifie qu'un fichier existe dans un bucket MinIO et le supprime
 * @param bucket - Le nom du bucket
 * @param fileName - Le nom du fichier
 * @returns void
 */
export async function verifyAndCleanupMinioFile(bucket: string, fileName: string): Promise<void> {
    // Vérification dans MinIO
    await verifyMinioFile(bucket, fileName);

    // Nettoyage du fichier dans MinIO
    await cleanupMinioFile(bucket, fileName);
}

/**
 * Vérifie qu'un fichier existe dans un bucket MinIO
 * @param bucket - Le nom du bucket
 * @param fileName - Le nom du fichier
 * @returns void
 */
export async function verifyMinioFile(bucket: string, fileName: string): Promise<void> {
    const fileInfo = await minioService.getFileInfoFromBucket(bucket, fileName);
    expect(fileInfo).toBeDefined();
    expect(fileInfo.size).toBeGreaterThan(0);
}

/**
 * Supprime un fichier d'un bucket MinIO
 * @param bucket - Le nom du bucket
 * @param fileName - Le nom du fichier
 * @returns void
 */
export async function cleanupMinioFile(bucket: string, fileName: string): Promise<void> {
    try {
        await minioService.deleteFile(bucket, fileName);
        // Vérifier que le fichier n'existe plus
        try {
            await minioService.getFileInfoFromBucket(bucket, fileName);
            throw new Error('Le fichier existe toujours après la suppression');
        } catch (error: any) {
            // Si nous recevons une erreur "Not Found", c'est que la suppression a réussi
            if (error.message.includes('Not Found')) {
                return;
            }
            throw error;
        }
    } catch (error: any) {
        throw new Error(`Erreur lors de la suppression du fichier: ${error.message}`);
    }
}
