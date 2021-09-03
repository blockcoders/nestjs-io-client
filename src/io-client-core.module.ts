import {
  DynamicModule,
  Global,
  Inject,
  Module,
  OnApplicationBootstrap,
  OnApplicationShutdown,
} from '@nestjs/common';
import {
  DiscoveryModule,
  DiscoveryService,
  MetadataScanner,
  ModuleRef,
  Reflector,
} from '@nestjs/core';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import { Socket } from 'socket.io-client';
import {
  IOCLIENT_EVENT_METADATA,
  IOCLIENT_PROVIDER_NAME,
} from './io-client.constants';
import {
  IOClientModuleOptions,
  IOClientModuleAsyncOptions,
  IOClientEventMetadata,
} from './io-client.interface';
import {
  createAsyncOptionsProvider,
  createIOAsyncProvider,
  createIOProvider,
  createProviderName,
} from './io-client.provider';

@Global()
@Module({})
export class IOClientCoreModule
  implements OnApplicationBootstrap, OnApplicationShutdown
{
  constructor(
    @Inject(IOCLIENT_PROVIDER_NAME) private readonly providerName: string,
    private readonly moduleRef: ModuleRef,
    private readonly discoveryService: DiscoveryService,
    private readonly metadataScanner: MetadataScanner,
    private readonly reflector: Reflector,
  ) {}
  static forRoot(options: IOClientModuleOptions): DynamicModule {
    const socketProvider = createIOProvider(options);

    return {
      module: IOClientCoreModule,
      imports: [DiscoveryModule],
      providers: [socketProvider, createProviderName()],
      exports: [socketProvider],
    };
  }

  static forRootAsync(options: IOClientModuleAsyncOptions): DynamicModule {
    const socketProvider = createIOAsyncProvider();
    const asyncOptionsProvader = createAsyncOptionsProvider(options);

    return {
      module: IOClientCoreModule,
      imports: [DiscoveryModule, ...(options.imports || [])],
      providers: [
        asyncOptionsProvader,
        socketProvider,
        createProviderName(),
        ...(options.providers || []),
      ],
      exports: [socketProvider],
    };
  }

  onApplicationBootstrap() {
    const providers = this.discoveryService.getProviders();
    const controllers = this.discoveryService.getControllers();

    this.addListeners(providers); // Add listeners to all the providers
    this.addListeners(controllers); // Add listeners to all the controllers
  }

  private addListeners(wrappers: InstanceWrapper<any>[]): void {
    const socket = this.moduleRef.get<Socket>(this.providerName);

    wrappers.forEach((wrapper) => {
      const { instance } = wrapper ?? {};

      if (wrapper.isDependencyTreeStatic() && instance) {
        const prototype = Object.getPrototypeOf(instance);

        this.metadataScanner.scanFromPrototype(
          instance,
          prototype,
          (methodKey: string) => {
            const metadata = this.reflector.get<IOClientEventMetadata>(
              IOCLIENT_EVENT_METADATA,
              instance[methodKey],
            );

            if (metadata) {
              socket.on(metadata.event, (...args: unknown[]) =>
                instance[methodKey].call(instance, ...args),
              );
            }
          },
        );
      }
    });
  }

  onApplicationShutdown() {
    const socket = this.moduleRef.get<Socket>(this.providerName);

    if (socket) {
      socket.disconnect();
    }
  }
}
