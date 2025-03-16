interface Logger {
    debug: (...args: unknown[]) => void;
    info: (...args: unknown[]) => void;
    warn: (...args: unknown[]) => void;
    error: (...args: unknown[]) => void;
    critical: (...args: unknown[]) => void;
};

declare global {
    var log: Logger;
}

export {};
