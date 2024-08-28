import { Logger } from '@lumineer/logger';
import { inject } from 'tsyringe';

export const InjectLogger = () => inject(Logger);
