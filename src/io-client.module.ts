import { Module, DynamicModule } from '@nestjs/common';
import { IOClientCoreModule } from './io-client-core.module';
import {
  IOClientModuleOptions,
  IOClientModuleAsyncOptions,
} from './io-client.interface';

@Module({})
export class IOClientModule {
  static forRoot(options: IOClientModuleOptions): DynamicModule {
    return {
      module: IOClientModule,
      imports: [IOClientCoreModule.forRoot(options)],
    };
  }

  static forRootAsync(options: IOClientModuleAsyncOptions): DynamicModule {
    return {
      module: IOClientModule,
      imports: [IOClientCoreModule.forRootAsync(options)],
    };
  }
}
