import { defaultApplicationParameters } from '@/config/defaultApplicationParameters';
import { ApplicationInitializer } from '@/config/initApplication';
import prisma from '@/config/prisma';
import { afterEach, beforeEach, describe, expect, it } from '@jest/globals';
import { ApplicationParameterName } from '@shared/enums';

describe('ApplicationInitializer', () => {
    let initializer: ApplicationInitializer;

    beforeEach(() => {
        initializer = new ApplicationInitializer();
    });

    afterEach(async () => {
        // Nettoyer la base de données après chaque test
        await prisma.applicationParameter.deleteMany();
    });

    describe('initialize', () => {
        it('devrait initialiser tous les paramètres par défaut', async () => {
            // Act
            await initializer.initialize();

            // Assert
            const parameters = await prisma.applicationParameter.findMany();
            expect(parameters).toHaveLength(defaultApplicationParameters.length);

            // Vérifier que tous les paramètres par défaut sont créés
            for (const defaultParam of defaultApplicationParameters) {
                const createdParam = parameters.find(p => p.name === defaultParam.name);
                expect(createdParam).toBeDefined();
                expect(createdParam?.value).toBe(defaultParam.value);
            }
        });

        it('ne devrait pas créer de doublons si appelé plusieurs fois', async () => {
            // Act
            await initializer.initialize();
            await initializer.initialize();

            // Assert
            const parameters = await prisma.applicationParameter.findMany();
            expect(parameters).toHaveLength(defaultApplicationParameters.length);
        });

    });

    describe('ensureParameter', () => {
        it('devrait créer un nouveau paramètre s\'il n\'existe pas', async () => {
            // Arrange
            await prisma.applicationParameter.deleteMany();
            const newParameter = {
                name: ApplicationParameterName.NEVER_CALLED_PROSPECTS_PERCENTAGE,
                value: '30'
            };

            // Act
            await initializer.ensureParameter(newParameter);

            // Assert
            const exists = await prisma.applicationParameter.findUnique({
                where: { name: newParameter.name }
            });
            expect(exists).toBeDefined();

            const value = await prisma.applicationParameter.findUnique({
                where: { name: newParameter.name }
            });
            expect(value).toBeDefined();
            expect(value?.value).toBe(newParameter.value);
        });

        it('ne devrait pas modifier un paramètre existant', async () => {
            // Arrange
            const existingParameter = await prisma.applicationParameter.findUnique({
                where: { name: ApplicationParameterName.NEVER_CALLED_PROSPECTS_PERCENTAGE }
            });
            expect(existingParameter).toBeDefined();

            const newValue = {
                name: ApplicationParameterName.NEVER_CALLED_PROSPECTS_PERCENTAGE,
                value: '50'
            };

            // Act
            await initializer.ensureParameter(newValue);

            // Assert
            const value = await prisma.applicationParameter.findUnique({
                where: { name: existingParameter?.name }
            });
            expect(value?.value).toBe(existingParameter?.value); // Ne devrait pas avoir changé
        });
    });

    describe('updateParameter', () => {
        it('devrait mettre à jour un paramètre existant', async () => {
            // Arrange
            const existingParameter = await prisma.applicationParameter.findUnique({
                where: { name: ApplicationParameterName.NEVER_CALLED_PROSPECTS_PERCENTAGE }
            });
            expect(existingParameter).toBeDefined();

            const updatedValue = {
                name: ApplicationParameterName.NEVER_CALLED_PROSPECTS_PERCENTAGE,
                value: '35'
            };

            // Act
            await initializer.updateParameter(updatedValue);

            // Assert
            const value = await prisma.applicationParameter.findUnique({
                where: { name: existingParameter?.name }
            });
            expect(value?.value).toBe(updatedValue.value);
        });
    });

    describe('resetAllParameters', () => {
        it('devrait réinitialiser tous les paramètres aux valeurs par défaut', async () => {
            // Arrange
            await initializer.initialize();

            // Modifier quelques paramètres
            await prisma.applicationParameter.update({
                where: { name: ApplicationParameterName.NEVER_CALLED_PROSPECTS_PERCENTAGE },
                data: { value: '50' }
            });

            // Act
            await initializer.resetAllParameters();

            // Assert
            const parameters = await prisma.applicationParameter.findMany();
            for (const defaultParam of defaultApplicationParameters) {
                const param = parameters.find(p => p.name === defaultParam.name);
                expect(param?.value).toBe(defaultParam.value);
            }
        });

    });
});