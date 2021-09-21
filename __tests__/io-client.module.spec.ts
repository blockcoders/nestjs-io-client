import { Module, Injectable, Get, Controller } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import * as request from 'supertest'
import { OnConnect, IoClientModule } from '../src'
import { createGatewayApp } from './utils/createGatewayApp'
import { extraWait } from './utils/extraWait'
import { platforms } from './utils/platforms'
import { randomPort } from './utils/randomPort'

describe('Socket.io Client Module Initialization', () => {
  let port: number

  beforeEach(() => {
    port = randomPort()
  })

  for (const PlatformAdapter of platforms) {
    describe(PlatformAdapter.name, () => {
      describe('forRoot', () => {
        it('should compile', async () => {
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
              }),
            ],
            controllers: [TestController],
            providers: [TestService],
          })
          class TestModule {}

          const appGateway = await createGatewayApp()
          await appGateway.listen(port)
          const app = await NestFactory.create(TestModule, new PlatformAdapter(), {
            logger: false,
            abortOnError: false,
          })
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

        it('should work with socket.io options', async () => {
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
                  forceNew: true,
                  reconnectionDelayMax: 10000,
                },
              }),
            ],
            controllers: [TestController],
            providers: [TestService],
          })
          class TestModule {}

          const appGateway = await createGatewayApp()
          await appGateway.listen(port)
          const app = await NestFactory.create(TestModule, new PlatformAdapter(), {
            logger: false,
            abortOnError: false,
          })
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

      describe('forRootAsync', () => {
        it('should compile', async () => {
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

          @Injectable()
          class ConfigService {
            public readonly uri = `ws://localhost:${port}`
          }

          @Module({
            imports: [
              IoClientModule.forRootAsync({
                providers: [ConfigService],
                inject: [ConfigService],
                useFactory: (config: ConfigService) => {
                  return {
                    uri: config.uri,
                  }
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

        it('should work properly when useFactory returns Promise', async () => {
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

          @Injectable()
          class ConfigService {
            public readonly uri = `ws://localhost:${port}`
          }

          @Module({
            imports: [
              IoClientModule.forRootAsync({
                providers: [ConfigService],
                inject: [ConfigService],
                useFactory: async (config: ConfigService) => {
                  await new Promise((r) => setTimeout(r, 20))

                  return {
                    uri: config.uri,
                  }
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

        it('should work with socket.io options', async () => {
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

          @Injectable()
          class ConfigService {
            public readonly uri = `ws://localhost:${port}`
          }

          @Module({
            imports: [
              IoClientModule.forRootAsync({
                providers: [ConfigService],
                inject: [ConfigService],
                useFactory: async (config: ConfigService) => {
                  await new Promise((r) => setTimeout(r, 20))

                  return {
                    uri: config.uri,
                    options: {
                      forceNew: true,
                      reconnectionDelayMax: 10000,
                    },
                  }
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
    })
  }
})
