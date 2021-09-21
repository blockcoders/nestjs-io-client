import { Inject, SetMetadata } from '@nestjs/common'
import { IOCLIENT_EVENT_METADATA } from './io-client.constants'
import { getIoClientToken } from './io-client.utils'

export const InjectIoClientProvider = () => Inject(getIoClientToken())

/**
 * Listen to an event that fulfils chosen pattern.
 */
export const EventListener = (event: string) => {
  return SetMetadata(IOCLIENT_EVENT_METADATA, { event })
}

export const OnConnect = () => {
  return SetMetadata(IOCLIENT_EVENT_METADATA, { event: 'connect' })
}

export const OnDisconnect = () => {
  return SetMetadata(IOCLIENT_EVENT_METADATA, { event: 'disconnect' })
}

export const OnConnectError = () => {
  return SetMetadata(IOCLIENT_EVENT_METADATA, { event: 'connect_error' })
}
