import { Logger } from '@cymbaline/logger';
import { inject } from 'tsyringe';

export const InjectLogger = () => inject(Logger);
