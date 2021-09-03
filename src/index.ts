export { IOClientModule } from './io-client.module';
export { InjectIOClientProvider, ListenEvent } from './io-client.decorators';
export {
  IOClientModuleOptions,
  IOClientModuleAsyncOptions,
  IOClientEventMetadata,
} from './io-client.interface';
export { getIOClientToken } from './io-client.utils';
export {
  Manager,
  ManagerOptions,
  Socket,
  SocketOptions,
} from 'socket.io-client';
