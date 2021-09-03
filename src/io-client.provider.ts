import { io, Socket } from 'socket.io-client';
import { getIOClientToken } from './io-client.utils';
import {
  IOClientModuleOptions,
  IOClientModuleAsyncOptions,
} from './io-client.interface';
import { Provider } from '@nestjs/common';
import { defer, lastValueFrom } from 'rxjs';
import {
  IOCLIENT_MODULE_OPTIONS,
  IOCLIENT_PROVIDER_NAME,
} from './io-client.constants';

async function createIOClient(
  _options: IOClientModuleOptions,
): Promise<Socket> {
  const { uri, options } = _options;
  const client = io(uri, options ?? {});

  if (options?.autoConnect === false) {
    return client;
  }

  client.connect();

  return new Promise((res, rej) => {
    client.on('connect', () => {
      res(client);
    });

    client.on('connect_error', () => {
      rej(new Error('The connection cannot be established.'));
    });
  });
}

export function createIOProvider(options: IOClientModuleOptions): Provider {
  return {
    provide: getIOClientToken(),
    useFactory: async (): Promise<Socket> => {
      return await lastValueFrom(defer(() => createIOClient(options)));
    },
  };
}

export function createIOAsyncProvider(): Provider {
  return {
    provide: getIOClientToken(),
    useFactory: async (options: IOClientModuleOptions): Promise<Socket> => {
      return lastValueFrom(defer(() => createIOClient(options)));
    },
    inject: [IOCLIENT_MODULE_OPTIONS],
  };
}

export function createAsyncOptionsProvider(
  options: IOClientModuleAsyncOptions,
): Provider {
  return {
    provide: IOCLIENT_MODULE_OPTIONS,
    useFactory: options.useFactory,
    inject: options.inject || [],
  };
}

export function createProviderName(): Provider {
  return {
    provide: IOCLIENT_PROVIDER_NAME,
    useValue: getIOClientToken(),
  };
}
