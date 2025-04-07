import { injectable } from 'inversify';

export const CacheServiceSymbol = Symbol.for('CacheService');

@injectable()
export default class CacheService {
    private cache: Map<string, unknown>;

    constructor() {
        this.cache = new Map();
    }

    clear() {
        this.cache.clear();
    }

    delete(key: string) {
        this.cache.delete(key);
    }

    get<T>(key: string) {
        return this.cache.get(key) as T;
    }

    has(key: string) {
        return this.cache.has(key);
    }

    set(key: string, value: unknown) {
        this.cache.set(key, value);
    }
}
