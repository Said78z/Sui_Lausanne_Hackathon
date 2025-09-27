import fastifyMultipart from '@fastify/multipart';
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import fs from 'fs/promises';

/**
 * Middleware to upload files
 * @param app - Fastify instance
 */
export async function fileUploadMiddleware(app: FastifyInstance): Promise<void> {
    app.register(fastifyMultipart, {
        limits: {
            fileSize: 10 * 1024 * 1024,
            files: 5,
        },
    });

    app.post('/upload', async (request: FastifyRequest, reply: FastifyReply) => {
        const files = request.files();
        const uploadedFiles = [];

        for await (const file of files) {
            // Determine the destination directory based on the MIME type
            let destinationDir = 'public/others';
            if (file.mimetype.startsWith('image/')) {
                destinationDir = 'public/images';
            } else if (
                file.mimetype.startsWith('application/pdf') ||
                file.mimetype.startsWith('application/msword') ||
                file.mimetype.startsWith('application/vnd.openxmlformats-officedocument')
            ) {
                destinationDir = 'public/documents';
            }

            // Create the full path of the file
            const filePath = `${destinationDir}/${file.filename}`;

            // Write the file to the disk
            await fs.writeFile(filePath, file.file);

            uploadedFiles.push({
                filename: file.filename,
                mimetype: file.mimetype,
                size: file.file.bytesRead,
                path: filePath,
            });
        }

        return { message: 'Files uploaded successfully', files: uploadedFiles };
    });
}
