import { ModuleMetadata } from '@nestjs/common'
import { ManagerOptions, SocketOptions } from 'socket.io-client'

export interface IoClientModuleOptions extends Record<string, any> {
  uri: string
  options?: Partial<ManagerOptions & SocketOptions>
}

export interface IoClientModuleAsyncOptions extends Pick<ModuleMetadata, 'imports' | 'providers'> {
  useFactory: (...args: any[]) => IoClientModuleOptions | Promise<IoClientModuleOptions>
  inject?: any[]
}

export interface IoClientEventMetadata {
  event: string
}
