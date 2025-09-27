import { DEFAULT_VALUE, VALUE_INUTILE } from './constants';

export class ValueService {
    public getValue(): string {
        return DEFAULT_VALUE;
    }

    public getInutile(): string {
        return VALUE_INUTILE;
    }
}
