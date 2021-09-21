import { Module, DynamicModule } from '@nestjs/common'
import { IoClientCoreModule } from './io-client-core.module'
import { IoClientModuleOptions, IoClientModuleAsyncOptions } from './io-client.interface'

@Module({})
export class IoClientModule {
  static forRoot(options: IoClientModuleOptions): DynamicModule {
    return {
      module: IoClientModule,
      imports: [IoClientCoreModule.forRoot(options)],
    }
  }

  static forRootAsync(options: IoClientModuleAsyncOptions): DynamicModule {
    return {
      module: IoClientModule,
      imports: [IoClientCoreModule.forRootAsync(options)],
    }
  }
}
