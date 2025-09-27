import { logger } from '@/utils/logger';

import { FileSchema } from '@shared/dto';
import dotenv from 'dotenv';
import * as Minio from 'minio';

interface ExtendedFile extends FileSchema {
    toBuffer?: () => Promise<Buffer>;
}

// Loading environment variables
dotenv.config();

class MinioService {
    private minioClient: Minio.Client;
    private bucketName: string;
    private logger = logger.child({
        module: '[SUI][MinioService]',
    });

    constructor() {
        // Get the bucket name from the environment variable
        this.bucketName = process.env.MINIO_BUCKET || 'files';

        // Configure the MinIO client with debug options
        this.minioClient = new Minio.Client({
            endPoint: process.env.MINIO_ENDPOINT || 'localhost',
            port: process.env.MINIO_PORT ? parseInt(process.env.MINIO_PORT, 10) : 9000,
            useSSL: process.env.MINIO_USE_SSL === 'true',
            accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
            secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
            region: '',
            pathStyle: true,
        });

        this.logger;
    }

    /**
     * Initialize the MinIO client
     */
    public async initializeMinio(): Promise<void> {
        try {
            const bucketExists = await this.minioClient.bucketExists(this.bucketName);

            if (!bucketExists) {
                await this.minioClient.makeBucket(this.bucketName);
            }
        } catch (err) {
            this.logger.error('Error details:', err);
        }
    }

    /**
     * Check if a bucket exists, otherwise create it
     * @param bucketName - The bucket name
     */
    public async checkBucket(bucketName: string): Promise<void> {
        const bucketExists = await this.minioClient.bucketExists(bucketName);
        if (!bucketExists) {
            await this.minioClient.makeBucket(bucketName);
        }
    }

    /**
     * Upload files
     * @param bucketName - The bucket name
     * @param file - The file to upload
     * @param customFileName - Optional custom file name
     * @returns The file info
     */
    public async uploadFile(
        bucketName: string,
        file: ExtendedFile,
        customFileName?: string
    ): Promise<any> {
        try {
            await this.checkBucket(bucketName);
            const fileName =
                customFileName || `${Date.now()}-${file.fieldname}.${file.mimetype?.split('/')[1]}`;

            // Obtenir le buffer du fichier
            const fileBuffer = await file.toBuffer!();
            const fileSize = file.file?.bytesRead || fileBuffer.length;

            await this.minioClient.putObject(bucketName, fileName, fileBuffer, fileSize, {
                'Content-Type': file.mimetype,
            });

            return {
                name: fileName,
                mimetype: file.mimetype,
                size: fileSize,
            };
        } catch (err) {
            this.logger.error('Error uploading file:', err);
            throw err;
        }
    }

    /**
     * Get a file
     * @param fileName - The file name
     * @returns The file URL
     */
    public async getFile(fileName: string): Promise<string> {
        try {
            let url = await this.minioClient.presignedUrl(
                'GET',
                this.bucketName,
                fileName,
                60 * 60 * 24
            );
            return url;
        } catch (err) {
            this.logger.error('Error getting file:', err);
            throw err;
        }
    }

    /**
     * Get a file info
     * @param fileName - The file name
     * @returns The file info
     */
    public async getFileInfo(fileName: string): Promise<any> {
        try {
            let fileInfo = await this.minioClient.statObject(this.bucketName, fileName);
            return fileInfo;
        } catch (err) {
            this.logger.error('Error getting file info:', err);
            throw err;
        }
    }

    /**
     * Get a file info from a specific bucket
     * @param bucketName - The bucket name
     * @param fileName - The file name
     * @returns The file info
     */
    public async getFileInfoFromBucket(bucketName: string, fileName: string): Promise<any> {
        try {
            await this.checkBucket(bucketName);
            let fileInfo = await this.minioClient.statObject(bucketName, fileName);
            return fileInfo;
        } catch (err) {
            this.logger.error('Error getting file info from bucket:', err);
            throw err;
        }
    }

    /**
     * Get a file URL from a specific bucket
     * @param bucketName - The bucket name
     * @param fileName - The file name
     * @returns The file URL
     */
    public async getFileFromBucket(bucketName: string, fileName: string): Promise<string> {
        try {
            await this.checkBucket(bucketName);
            const url = await this.minioClient.presignedUrl('GET', bucketName, fileName, 60 * 60 * 24);
            return url;
        } catch (err) {
            this.logger.error('Error getting file from bucket:', err);
            throw err;
        }
    }

    /**
     * Delete a file
     * @param bucketName - The bucket name
     * @param fileName - The file name
     */
    public async deleteFile(bucketName: string, fileName: string): Promise<void> {
        try {
            await this.minioClient.removeObject(bucketName, fileName);
        } catch (err) {
            this.logger.error('Error deleting file:', err);
            throw err;
        }
    }

    /**
     * Recherche et supprime les fichiers existants avec le même nom de base (sans extension)
     * @param bucketName - Le nom du bucket
     * @param basePath - Le chemin de base du fichier
     * @param baseFileName - Le nom de base du fichier (sans extension)
     * @returns Promise<void>
     */
    public async deleteExistingFilesWithBaseName(
        bucketName: string,
        basePath: string,
        baseFileName: string
    ): Promise<void> {
        try {
            await this.checkBucket(bucketName);

            const objectsStream = this.minioClient.listObjects(bucketName, basePath, false);

            const filesToDelete: string[] = [];

            for await (const obj of objectsStream) {
                if (obj.name) {
                    const fileName = obj.name.split('/').pop() || '';
                    const fileBaseName = fileName.split('.')[0];

                    if (fileBaseName === baseFileName) {
                        filesToDelete.push(obj.name);
                    }
                }
            }

            // Supprime tous les fichiers trouvés
            for (const fileToDelete of filesToDelete) {
                await this.minioClient.removeObject(bucketName, fileToDelete);
                this.logger.info(`Fichier supprimé: ${fileToDelete}`);
            }
        } catch (err) {
            this.logger.error('Erreur lors de la suppression des fichiers existants:', err);
            throw err;
        }
    }

    /**
     * Récupère l'URL présignée d'un fichier basé sur son nom de base
     * @param bucketName - Le nom du bucket
     * @param baseFileName - Le nom de base du fichier (sans extension)
     * @returns Promise<string> - L'URL présignée du fichier ou une chaîne vide si non trouvé
     */
    public async getClientFileBaseName(bucketName: string, baseFileName: string): Promise<string> {
        try {
            await this.checkBucket(bucketName);

            const objectsStream = this.minioClient.listObjects(bucketName, '', true);

            for await (const obj of objectsStream) {
                if (obj.name) {
                    const fileName = obj.name.split('/').pop() || '';
                    const fileBaseName = fileName.split('.')[0];

                    if (fileBaseName === baseFileName) {
                        return await this.minioClient.presignedUrl(
                            'GET',
                            bucketName,
                            obj.name,
                            60 * 60 * 24
                        );
                    }
                }
            }

            return '';
        } catch (err) {
            this.logger.error(
                'Erreur lors de la récupération du nom de base du fichier client:',
                err
            );
            throw err;
        }
    }
}

export const minioService = new MinioService();
