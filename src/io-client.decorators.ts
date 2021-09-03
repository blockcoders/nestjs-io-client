import { Inject, SetMetadata } from '@nestjs/common';
import { IOCLIENT_EVENT_METADATA } from './io-client.constants';
import { getIOClientToken } from './io-client.utils';

export const InjectIOClientProvider = () => Inject(getIOClientToken());

/**
 * Listen to an event that fulfils chosen pattern.
 */
export const ListenEvent = (event: string) => {
  return SetMetadata(IOCLIENT_EVENT_METADATA, { event });
};
