import { ModuleMetadata } from '@nestjs/common';
import { ManagerOptions, SocketOptions } from 'socket.io-client';

export interface IOClientModuleOptions extends Record<string, any> {
  uri: string;
  options?: Partial<ManagerOptions & SocketOptions>;
}

export interface IOClientModuleAsyncOptions
  extends Pick<ModuleMetadata, 'imports' | 'providers'> {
  useFactory: (
    ...args: any[]
  ) => IOClientModuleOptions | Promise<IOClientModuleOptions>;
  inject?: any[];
}

export interface IOClientEventMetadata {
  event: string;
}
