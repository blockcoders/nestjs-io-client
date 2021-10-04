import { Module, Controller, Get, Injectable } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import * as request from 'supertest'
import {
  EventListener,
  InjectIoClientProvider,
  OnConnect,
  OnDisconnect,
  OnConnectError,
  IoClient,
  IoClientModule,
} from '../src'
import { createGatewayApp } from './utils/createGatewayApp'
import { extraWait } from './utils/extraWait'
import { platforms } from './utils/platforms'
import { randomPort } from './utils/randomPort'

describe('Socket.io Client Decorators', () => {
  let port: number

  beforeEach(() => {
    port = randomPort()
  })

  describe('@InjectIoClientProvider', () => {
    for (const PlatformAdapter of platforms) {
      describe(PlatformAdapter.name, () => {
        it('should inject websocket provider in a service successfully', async () => {
          @Injectable()
          class TestService {
            constructor(
              @InjectIoClientProvider()
              private readonly socket: IoClient,
            ) {}
            async someMethod(): Promise<boolean> {
              return this.socket.connected
            }
          }

          @Controller('/')
          class TestController {
            constructor(private readonly service: TestService) {}
            @Get()
            async get(): Promise<{ connected: boolean }> {
              const connected = await this.service.someMethod()

              return { connected }
            }
          }

          @Module({
            imports: [
              IoClientModule.forRoot({
                uri: `ws://localhost:${port}`,
                options: {
                  autoConnect: true,
                },
              }),
            ],
            controllers: [TestController],
            providers: [TestService],
          })
          class TestModule {}

          const appGateway = await createGatewayApp()
          await appGateway.listen(port)
          const app = await NestFactory.create(TestModule, new PlatformAdapter(), { logger: false })
          const server = app.getHttpServer()

          await app.init()
          await extraWait(PlatformAdapter, app)

          // open websockets delay
          await new Promise((res) => setTimeout(res, 800))

          await request(server)
            .get('/')
            .expect(200)
            .expect((res) => {
              expect(res.body).toBeDefined()
              expect(res.body.connected).toBeTruthy()
            })

          await app.close()
          await appGateway.close()
        })
      })
    }
  })

  describe('@EventListener', () => {
    for (const PlatformAdapter of platforms) {
      describe(PlatformAdapter.name, () => {
        it('should listen a websocket event', async () => {
          @Injectable()
          class TestService {
            private connected = false

            @EventListener('connect')
            connect() {
              this.connected = true
            }

            async isConnected(): Promise<boolean> {
              return this.connected
            }
          }

          @Controller('/')
          class TestController {
            constructor(private readonly testService: TestService) {}

            @Get()
            async get(): Promise<{ connected: boolean }> {
              const connected = await this.testService.isConnected()

              return { connected }
            }
          }

          @Module({
            imports: [
              IoClientModule.forRoot({
                uri: `ws://localhost:${port}`,
                options: {
                  autoConnect: true,
                },
              }),
            ],
            controllers: [TestController],
            providers: [TestService],
          })
          class TestModule {}

          const appGateway = await createGatewayApp()
          await appGateway.listen(port)
          const app = await NestFactory.create(TestModule, new PlatformAdapter(), { logger: false })
          const server = app.getHttpServer()

          await app.init()
          await extraWait(PlatformAdapter, app)

          // open websockets delay
          await new Promise((res) => setTimeout(res, 800))

          await request(server)
            .get('/')
            .expect(200)
            .expect((res) => {
              expect(res.body).toBeDefined()
              expect(res.body.connected).toBeTruthy()
            })

          await app.close()
          await appGateway.close()
        })
      })
    }
  })

  describe('@OnConnect', () => {
    for (const PlatformAdapter of platforms) {
      describe(PlatformAdapter.name, () => {
        it('should listen a open event', async () => {
          @Injectable()
          class TestService {
            private connected = false

            @OnConnect()
            connect() {
              this.connected = true
            }

            async isConnected(): Promise<boolean> {
              return this.connected
            }
          }

          @Controller('/')
          class TestController {
            constructor(private readonly testService: TestService) {}

            @Get()
            async get(): Promise<{ connected: boolean }> {
              const connected = await this.testService.isConnected()

              return { connected }
            }
          }

          @Module({
            imports: [
              IoClientModule.forRoot({
                uri: `ws://localhost:${port}`,
                options: {
                  autoConnect: true,
                },
              }),
            ],
            controllers: [TestController],
            providers: [TestService],
          })
          class TestModule {}

          const appGateway = await createGatewayApp()
          await appGateway.listen(port)
          const app = await NestFactory.create(TestModule, new PlatformAdapter(), { logger: false })
          const server = app.getHttpServer()

          await app.init()
          await extraWait(PlatformAdapter, app)

          // open websockets delay
          await new Promise((res) => setTimeout(res, 800))

          await request(server)
            .get('/')
            .expect(200)
            .expect((res) => {
              expect(res.body).toBeDefined()
              expect(res.body.connected).toBeTruthy()
            })

          await app.close()
          await appGateway.close()
        })
      })
    }
  })

  describe('@OnDisconnect', () => {
    for (const PlatformAdapter of platforms) {
      describe(PlatformAdapter.name, () => {
        it('should listen a close event', async () => {
          @Injectable()
          class TestService {
            private disconnected = false

            @OnDisconnect()
            disconnect() {
              this.disconnected = true
            }

            async isDisconnected(): Promise<boolean> {
              return this.disconnected
            }
          }

          @Controller('/')
          class TestController {
            constructor(private readonly testService: TestService) {}

            @Get()
            async get(): Promise<{ isDisconnected: boolean }> {
              const isDisconnected = await this.testService.isDisconnected()

              return { isDisconnected }
            }
          }

          @Module({
            imports: [
              IoClientModule.forRoot({
                uri: `ws://localhost:${port}`,
              }),
            ],
            controllers: [TestController],
            providers: [TestService],
          })
          class TestModule {}

          const appGateway = await createGatewayApp()
          await appGateway.listen(port)
          const app = await NestFactory.create(TestModule, new PlatformAdapter(), { logger: false })
          const server = app.getHttpServer()

          await app.init()
          await extraWait(PlatformAdapter, app)

          // open websockets delay
          await new Promise((res) => setTimeout(res, 800))

          // close the gateway
          await appGateway.close()

          // close websockets delay
          await new Promise((res) => setTimeout(res, 800))

          await request(server)
            .get('/')
            .expect(200)
            .expect((res) => {
              expect(res.body).toBeDefined()
              expect(res.body.isDisconnected).toBeTruthy()
            })

          await app.close()
        })
      })
    }
  })

  describe('@OnConnectError', () => {
    for (const PlatformAdapter of platforms) {
      describe(PlatformAdapter.name, () => {
        it('should listen a error event', async () => {
          @Injectable()
          class TestService {
            private errorMessage = ''

            @OnConnectError()
            connectError(err: Error) {
              this.errorMessage = err.message
            }

            async getError(): Promise<string> {
              return this.errorMessage
            }
          }

          @Controller('/')
          class TestController {
            constructor(private readonly testService: TestService) {}

            @Get()
            async get(): Promise<{ message: string }> {
              const message = await this.testService.getError()

              return { message }
            }
          }

          @Module({
            imports: [
              IoClientModule.forRoot({
                uri: `ws://invalid-url:666`,
              }),
            ],
            controllers: [TestController],
            providers: [TestService],
          })
          class TestModule {}

          const appGateway = await createGatewayApp()
          await appGateway.listen(port)
          const app = await NestFactory.create(TestModule, new PlatformAdapter(), { logger: false })
          const server = app.getHttpServer()

          await app.init()
          await extraWait(PlatformAdapter, app)

          // open websockets delay
          await new Promise((res) => setTimeout(res, 800))

          await request(server)
            .get('/')
            .expect(200)
            .expect((res) => {
              expect(res.body).toBeDefined()
              expect(res.body.message).not.toBeFalsy()
            })

          await app.close()
          await appGateway.close()
        })
      })
    }
  })
})
