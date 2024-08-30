export type ClassConstructor<T = {}> = { new (...args: any[]): T };

export type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;
