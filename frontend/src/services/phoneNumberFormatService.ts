export const formatFrenchNumber = (value: string): string => {
    // Supprime tous les caractères non numériques
    const numbers = value.replace(/\D/g, '');

    // Si le numéro commence par 33, on le traite comme un numéro international
    if (numbers.startsWith('33')) {
        // On enlève le 33 et on garde le reste
        const remainingNumbers = numbers.slice(2);
        // Si le premier chiffre est 0, on met un espace tous les 2 chiffres
        if (remainingNumbers.startsWith('0')) {
            return remainingNumbers.replace(/(\d{2})(?=\d)/g, '$1 ').trim();
        }
        // Sinon on met un espace après le premier chiffre puis tous les 2 chiffres
        return (
            remainingNumbers.charAt(0) +
            ' ' +
            remainingNumbers
                .slice(1)
                .replace(/(\d{2})(?=\d)/g, '$1 ')
                .trim()
        );
    }

    // Si le numéro commence par 0, on met un espace tous les 2 chiffres
    if (numbers.startsWith('0')) {
        return numbers.replace(/(\d{2})(?=\d)/g, '$1 ').trim();
    }

    // Sinon on met un espace après le premier chiffre puis tous les 2 chiffres
    return (
        numbers.charAt(0) +
        ' ' +
        numbers
            .slice(1)
            .replace(/(\d{2})(?=\d)/g, '$1 ')
            .trim()
    );
};

export const formatCzechNumber = (value: string): string => {
    // Supprime tous les caractères non numériques
    const numbers = value.replace(/\D/g, '');
    // Formate le numéro avec des espaces tous les 3 chiffres
    return numbers.replace(/(\d{3})(?=\d)/g, '$1 ').trim();
};
