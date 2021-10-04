# NestJS Socket.io Client

[![npm](https://img.shields.io/npm/v/nestjs-io-client)](https://www.npmjs.com/package/nestjs-io-client)
[![CircleCI](https://circleci.com/gh/blockcoders/nestjs-io-client/tree/main.svg?style=svg)](https://circleci.com/gh/blockcoders/nestjs-io-client/tree/main)
[![Coverage Status](https://coveralls.io/repos/github/blockcoders/nestjs-io-client/badge.svg?branch=main)](https://coveralls.io/github/blockcoders/nestjs-io-client?branch=main)
[![vulnerabilities](https://img.shields.io/snyk/vulnerabilities/npm/nestjs-io-client)](https://snyk.io/test/github/blockcoders/nestjs-io-client)
[![supported platforms](https://img.shields.io/badge/platforms-Express%20%26%20Fastify-green)](https://img.shields.io/badge/platforms-Express%20%26%20Fastify-green)

Socket.io Client for NestJS based on [socket.io-client](https://www.npmjs.com/package/socket.io-client)

## Install

```sh
npm i nestjs-io-client
```

## Register module

### Configuration params

`nestjs-io-client` can be configured with this options:

```ts
/**
 * Socket.io Client options
 * @see {@link https://socket.io/docs/v4/client-api/#iourl}
 */
interface IoClientModuleOptions {
  /**
   * Required parameter a URL to connect.
   * such as http://localhost:3000/my-namespace or ws://localhost:3000/my-namespace.
   */
  uri: string;

  /**
   * Optional parameter a client or http request options.
   */
  options?: Partial<ManagerOptions & SocketOptions>
}
```

### Synchronous configuration

Use `IoClientModule.forRoot` method with [Options interface](#configuration-params):

```ts
import { IoClientModule } from 'nestjs-io-client'

@Module({
  imports: [
    IoClientModule.forRoot({
      uri: 'ws://localhost:3000/my-namespace',
      options: {
        reconnectionDelayMax: 10000,
        auth: { token: '123' },
        query: {
          foo: 'value'
        },
      },
    }),
  ],
  ...
})
class MyModule {}
```

### Asynchronous configuration

With `IoClientModule.forRootAsync` you can, for example, import your `ConfigModule` and inject `ConfigService` to use it in `useFactory` method.

`useFactory` should return object with [Options interface](#configuration-params)

Here's an example:

```ts
import { Module, Injectable } from '@nestjs/common'
import { IoClientModule } from 'nestjs-io-client'

@Injectable()
class ConfigService {
  public readonly uri = 'ws://localhost:3000/my-namespace'
}

@Module({
  providers: [ConfigService],
  exports: [ConfigService]
})
class ConfigModule {}

@Module({
  imports: [
    IoClientModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return {
          uri: config.uri,
        }
      },
    }),
  ],
  ...
})
class MyModule {}
```

Or you can just pass `ConfigService` to `providers`, if you don't have any `ConfigModule`:

```ts
import { Module, Injectable } from '@nestjs/common'
import { IoClientModule } from 'nestjs-io-client'

@Injectable()
class ConfigService {
  public readonly uri = 'ws://localhost:3000/my-namespace'
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
  controllers: [TestController]
})
class TestModule {}
```

## IoClient

`IoClient` implements a [Socket](https://socket.io/docs/v4/client-api/#socket). So if you are familiar with it, you are ready to go.

```ts
import { Injectable } from '@nestjs/common'
import {
  InjectIoClientProvider,
  IoClient,
  OnConnect,
  OnConnectError,
  EventListener,
} from 'nestjs-io-client';

@Injectable()
class TestService {
  constructor(
    @InjectIoClientProvider()
    private readonly io: IoClient,
  ) {}

  @OnConnect()
  connect() {
    console.log('connected!')
    console.log(this.io.id); // "G5p5..."
    console.log(this.io.connected); // true
  }
  
  @OnConnectError()
  connectError(err: Error) {
    console.error(`An error occurs: ${err}`)
  }

  @EventListener('news')
  message(data: any) {
    console.log(data);
  }
}
```

## Socket.io Events

### EventListener

`@EventListener` decorator will handle any event emitted from socket.io server.

```ts
import { Injectable } from '@nestjs/common'
import {
  EventListener
} from 'nestjs-io-client';

@Injectable()
class TestService {
  @EventListener('connect')
  open() {
    console.log('The connection is established.')
  }
  
  @EventListener('ping')
  ping() {
    console.log('A ping is received from the server.')
  }
  
  @EventListener('reconnect')
  unexpectedResponse() {
    console.log('successful reconnection')
  }
  
  @EventListener('news')
  upgrade(data: any) {
    console.log(data);
  }
}
```

### OnConnect

`@OnConnect` is a shortcut for `@EventListener('connect')`. Event emitted when the connection is established.

```ts
import { Injectable } from '@nestjs/common'
import {
  OnConnect
} from 'nestjs-io-client';

@Injectable()
class TestService {
  @OnConnect()
  connect() {
    console.log('The connection is established.')
  }
}
```

### OnDisconnect

`@OnDisconnect` is a shortcut for `@EventListener('disconnect')` Event emitted when the connection is closed. `reason` is a string explaining why the connection has been closed.

```ts
import { Injectable } from '@nestjs/common'
import {
  IoClient,
  OnDisconnect
} from 'nestjs-io-client';

@Injectable()
class TestService {
  @OnDisconnect()
  disconnect(reason: IoClient.DisconnectReason) {
    if (reason === "io server disconnect") {
      // the disconnection was initiated by the server, you need to reconnect manually
      socket.connect();
    }
    // else the socket will automatically try to reconnect
  }
}
```

### OnConnectError

`@OnConnectError` is a shortcut for `@EventListener('connect_error')` Event emitted when when an namespace middleware error occurs.

```ts
import { Injectable } from '@nestjs/common'
import {
  OnConnectError
} from 'nestjs-io-client';

@Injectable()
class TestService {
  @OnConnectError()
  connectError(err: Error) {
    console.error(`An error occurs: ${err}`)
  }
}
```

## Testing a class that uses @InjectIoClientProvider

This package exposes a `getIoClientToken()` function that returns a prepared injection token based on the provided context.
Using this token, you can easily provide a mock implementation of the [Socket](https://socket.io/docs/v4/client-api/#socket) using any of the standard custom provider techniques, including useClass, useValue, and useFactory.

```ts
const module: TestingModule = await Test.createTestingModule({
  providers: [
    MyService,
    {
      provide: getIoClientToken(),
      useValue: mockProvider,
    },
  ],
}).compile();
```

## Change Log

See [Changelog](CHANGELOG.md) for more information.

## Contributing

Contributions welcome! See [Contributing](CONTRIBUTING.md).

## Collaborators

- [**Jose Ramirez**](https://github.com/jarcodallo), [Twitter](https://twitter.com/jarcodallo), [NPM](https://www.npmjs.com/~jarcodallo)

## License

Licensed under the Apache 2.0 - see the [LICENSE](LICENSE) file for details.
