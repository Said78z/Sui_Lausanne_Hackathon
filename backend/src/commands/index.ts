import { CronJob } from 'cron';
import fs from 'fs';
import path from 'path';

import commands from './commands.json';

const startCronJobs = () => {
    commands.forEach((command) => {
        const commandFile = path.join(__dirname, command.file);

        // Vérifie si le fichier existe avant de l'exécuter
        if (!fs.existsSync(commandFile)) {
            console.error(`[Cron] Fichier introuvable: ${commandFile}`);
            return;
        }

        const job = new CronJob(command.cronExpression, async () => {
            try {
                const { main } = require(commandFile);
                if (typeof main === 'function') {
                    await main();
                } else {
                    console.error(`[Cron] La fonction main n'existe pas dans ${commandFile}`);
                }
            } catch (error) {
                console.error(`[Cron] Erreur lors de l'exécution de ${commandFile}:`, error);
            }
        });

        job.start();
    });
};

export default startCronJobs;
