/**
 * Ce fichier de test démontre différentes approches pour mocker des dépendances dans Jest
 */
import { beforeEach, describe, expect, it, jest } from '@jest/globals';

import * as constants from './constants';
import { ValueService } from './valueService';

// Mock du module constants - remplace toutes les exportations du module
// Cette approche est utile quand on veut remplacer toutes les valeurs d'un module
jest.mock('./constants', () => ({
    DEFAULT_VALUE: 'Valeur mockée',
}));

describe('ValueService', () => {
    let service: ValueService;

    // Réinitialise le service avant chaque test
    // Cela garantit que chaque test commence avec un état propre
    beforeEach(() => {
        service = new ValueService();
    });

    it('devrait retourner la valeur par défaut', () => {
        const result = service.getValue();
        expect(result).toBe('Valeur mockée'); //Retourne la valeur mockée

        const result2 = service.getInutile();
        expect(result2).toBeUndefined(); //Retourne la valeur undefined parce le jest.mock() a mock tout les import de ./constants
    });

    it('devrait utiliser la fonction mockée', () => {
        // Cette approche permet de mocker une seule méthode sans affecter le reste de la classe
        // Utile quand on veut tester différents comportements d'une même méthode
        jest.spyOn(service, 'getValue').mockReturnValue('Valeur de la fonction mockée');

        const result = service.getValue();
        expect(result).toBe('Valeur de la fonction mockée');
    });

    it('devrait utiliser la valeur importée', () => {
        // De la même façon que le test précédent, on peut mocker une valeur importée
        jest.spyOn(service, 'getValue').mockReturnValue(constants.VALUE_IMPORTE);

        const result = service.getValue();
        expect(result).toBe(constants.VALUE_IMPORTE);
    });
});
