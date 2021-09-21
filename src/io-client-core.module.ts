import { DynamicModule, Global, Inject, Module, OnApplicationBootstrap, OnApplicationShutdown } from '@nestjs/common'
import { DiscoveryModule, DiscoveryService, MetadataScanner, ModuleRef, Reflector } from '@nestjs/core'
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper'
import { Socket } from 'socket.io-client'
import { IOCLIENT_EVENT_METADATA, IOCLIENT_PROVIDER_NAME } from './io-client.constants'
import { IoClientModuleOptions, IoClientModuleAsyncOptions, IoClientEventMetadata } from './io-client.interface'
import {
  createAsyncOptionsProvider,
  createIOAsyncProvider,
  createIOProvider,
  createProviderName,
} from './io-client.provider'

@Global()
@Module({})
export class IoClientCoreModule implements OnApplicationBootstrap, OnApplicationShutdown {
  constructor(
    @Inject(IOCLIENT_PROVIDER_NAME) private readonly providerName: string,
    private readonly moduleRef: ModuleRef,
    private readonly discoveryService: DiscoveryService,
    private readonly metadataScanner: MetadataScanner,
    private readonly reflector: Reflector,
  ) {}
  static forRoot(options: IoClientModuleOptions): DynamicModule {
    const socketProvider = createIOProvider(options)

    return {
      module: IoClientCoreModule,
      imports: [DiscoveryModule],
      providers: [socketProvider, createProviderName()],
      exports: [socketProvider],
    }
  }

  static forRootAsync(options: IoClientModuleAsyncOptions): DynamicModule {
    const socketProvider = createIOAsyncProvider()
    const asyncOptionsProvader = createAsyncOptionsProvider(options)

    return {
      module: IoClientCoreModule,
      imports: [DiscoveryModule, ...(options.imports || [])],
      providers: [asyncOptionsProvader, socketProvider, createProviderName(), ...(options.providers || [])],
      exports: [socketProvider],
    }
  }

  onApplicationBootstrap() {
    const providers = this.discoveryService.getProviders()
    const controllers = this.discoveryService.getControllers()

    this.listenToClientEvents(providers) // Add listeners to all the providers
    this.listenToClientEvents(controllers) // Add listeners to all the controllers
  }

  private listenToClientEvents(wrappers: InstanceWrapper<any>[]): void {
    const socket = this.moduleRef.get<Socket>(this.providerName)

    wrappers.forEach((wrapper) => {
      const { instance } = wrapper ?? {}

      if (wrapper.isDependencyTreeStatic() && instance) {
        const prototype = Object.getPrototypeOf(instance)

        this.metadataScanner.scanFromPrototype(instance, prototype, (methodKey: string) => {
          const callback = instance[methodKey]
          const metadata = this.reflector.get<IoClientEventMetadata>(IOCLIENT_EVENT_METADATA, callback)

          if (metadata) {
            socket.on(metadata.event, (...args: unknown[]) => {
              callback.call(instance, ...args)
            })
          }
        })
      }
    })
  }

  onApplicationShutdown() {
    const socket = this.moduleRef.get<Socket>(this.providerName)

    if (socket) {
      socket.close()
    }
  }
}
