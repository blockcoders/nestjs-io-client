import { Provider } from '@nestjs/common'
import { defer, lastValueFrom } from 'rxjs'
import { io, Socket } from 'socket.io-client'
import { IOCLIENT_MODULE_OPTIONS, IOCLIENT_PROVIDER_NAME } from './io-client.constants'
import { IoClientModuleOptions, IoClientModuleAsyncOptions } from './io-client.interface'
import { getIoClientToken } from './io-client.utils'

async function createIOClient(_options: IoClientModuleOptions): Promise<Socket> {
  const { uri, options } = _options
  const client = io(uri, options ?? {})

  if (!options?.autoConnect) {
    return client
  }

  client.connect()

  return client
}

export function createIOProvider(options: IoClientModuleOptions): Provider {
  return {
    provide: getIoClientToken(),
    useFactory: async (): Promise<Socket> => {
      return await lastValueFrom(defer(() => createIOClient(options)))
    },
  }
}

export function createIOAsyncProvider(): Provider {
  return {
    provide: getIoClientToken(),
    useFactory: async (options: IoClientModuleOptions): Promise<Socket> => {
      return lastValueFrom(defer(() => createIOClient(options)))
    },
    inject: [IOCLIENT_MODULE_OPTIONS],
  }
}

export function createAsyncOptionsProvider(options: IoClientModuleAsyncOptions): Provider {
  return {
    provide: IOCLIENT_MODULE_OPTIONS,
    useFactory: options.useFactory,
    inject: options.inject || [],
  }
}

export function createProviderName(): Provider {
  return {
    provide: IOCLIENT_PROVIDER_NAME,
    useValue: getIoClientToken(),
  }
}
