import { Decimal } from '@prisma/client/runtime/library';


/**
 * Type helper pour convertir les Decimal en number dans un objet
 */
export type TransformDecimalToNumber<T> = {
    [K in keyof T]: T[K] extends Decimal ? number :
    T[K] extends Decimal | null ? number | null :
    T[K] extends Decimal | undefined ? number | undefined :
    T[K] extends Date ? Date :
    T[K] extends (infer U)[] ? TransformDecimalToNumber<U>[] :
    T[K] extends object ? TransformDecimalToNumber<T[K]> : T[K];
};
/**
 * Vérifie si un objet est un Decimal de Prisma
 */
function isPrismaDecimal(obj: unknown): obj is Decimal {
    if (obj === null || typeof obj !== 'object') {
        return false;
    }

    const decimalObj = obj as any;

    // Vérifie la structure typique d'un Decimal de Prisma
    return (
        's' in decimalObj &&
        'e' in decimalObj &&
        'd' in decimalObj &&
        Array.isArray(decimalObj.d) &&
        typeof decimalObj.s === 'number' &&
        typeof decimalObj.e === 'number'
    );
}

//TODO : Revoir la transformation des decimals parce qu'elle n'affiche pas les nombre apres la virgules 
export function transformDecimalToNumber<T>(data: T): TransformDecimalToNumber<T> {
    if (Array.isArray(data)) {
        return data.map(transformDecimalToNumber) as TransformDecimalToNumber<T>;
    }

    if (data instanceof Decimal) {
        return data.toFixed(2) as TransformDecimalToNumber<T>;
    }

    if (isPrismaDecimal(data)) {
        // Convertir l'objet interne de Prisma en nombre
        const decimalObj = data as any;
        // Les chiffres dans d[] sont déjà les chiffres décimaux, il faut juste les concaténer
        const digits = decimalObj.d.join('');
        const value = parseInt(digits, 10);
        // Appliquer l'exposant pour positionner la virgule décimale
        const result = value * Math.pow(10, decimalObj.e - digits.length + 1);
        return (decimalObj.s === -1 ? -result : result) as TransformDecimalToNumber<T>;
    }

    // Préserver les chaînes de caractères (dates déjà transformées)
    if (typeof data === 'string') {
        return data as TransformDecimalToNumber<T>;
    }

    if (data !== null && typeof data === 'object') {
        const newObj: Record<string, unknown> = {};

        for (const [key, value] of Object.entries(data)) {
            newObj[key] = transformDecimalToNumber(value);
        }

        return newObj as TransformDecimalToNumber<T>;
    }

    return data as TransformDecimalToNumber<T>;
}


/**
 * Vérifie si un objet est une Date de Prisma
 */
function isPrismaDate(obj: unknown): obj is Date {
    if (obj instanceof Date) {
        return true;
    }

    if (obj === null || typeof obj !== 'object') {
        return false;
    }

    const dateObj = obj as any;

    // Vérifier si c'est un objet Date de Prisma avec $type
    if ('$type' in dateObj && dateObj.$type === 'DateTime') {
        return true;
    }

    // Vérifier si c'est un objet Date de Prisma avec une propriété interne
    if ('$date' in dateObj && typeof dateObj.$date === 'string') {
        return true;
    }

    // Vérifier si c'est un objet vide (cas où la date est null mais retournée comme objet)
    if (Object.keys(dateObj).length === 0) {
        return false;
    }

    return false;
}

export function transformDateToString<T>(data: T): TransformDateToString<T> {
    if (Array.isArray(data)) {
        return data.map(transformDateToString) as TransformDateToString<T>;
    }

    if (data instanceof Date) {
        return data.toISOString() as TransformDateToString<T>;
    }

    // Gérer les objets vides qui représentent des dates null dans Prisma
    if (data !== null && typeof data === 'object' && Object.keys(data as object).length === 0) {
        return (null as unknown) as TransformDateToString<T>;
    }

    if (isPrismaDate(data)) {
        const dateObj = data as any;

        // Si c'est un objet avec $date, utiliser cette valeur
        if ('$date' in dateObj && typeof dateObj.$date === 'string') {
            return dateObj.$date as TransformDateToString<T>;
        }

        // Si c'est un objet avec $type DateTime, essayer de le convertir
        if ('$type' in dateObj && dateObj.$type === 'DateTime') {
            // Essayer de créer une Date à partir de l'objet
            try {
                const date = new Date(dateObj);
                return date.toISOString() as TransformDateToString<T>;
            } catch {
                return data as TransformDateToString<T>;
            }
        }

        return data as TransformDateToString<T>;
    }

    if (data !== null && typeof data === 'object') {
        const newObj: Record<string, unknown> = {};

        for (const [key, value] of Object.entries(data)) {
            newObj[key] = transformDateToString(value);
        }

        return newObj as TransformDateToString<T>;
    }

    return data as TransformDateToString<T>;
}



/**
 * Type helper pour convertir les Date en string dans un objet
 */
export type TransformDateToString<T> = {
    [K in keyof T]: T[K] extends Date ? string :
    T[K] extends Date | null ? string | null :
    T[K] extends Date | undefined ? string | undefined :
    T[K] extends (infer U)[] ? TransformDateToString<U>[] :
    T[K] extends object ? TransformDateToString<T[K]> : T[K];
};
