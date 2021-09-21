import { INestApplication } from '@nestjs/common'
import { IoAdapter } from '@nestjs/platform-socket.io'
import { Test } from '@nestjs/testing'
import { ApplicationGateway } from './app.gateway'

export async function createGatewayApp(): Promise<INestApplication> {
  const testingModule = await Test.createTestingModule({
    providers: [ApplicationGateway],
  }).compile()
  const app = await testingModule.createNestApplication()

  app.useWebSocketAdapter(new IoAdapter(app))

  return app
}
