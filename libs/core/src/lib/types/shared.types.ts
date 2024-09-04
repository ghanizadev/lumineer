/**
 * @category Type Aliases
 * */
export type ClassConstructor<T = {}> = { new (...args: any[]): T };

/**
 * @category Type Aliases
 * */
export type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;
