import { DECORATED_PREFIX } from './io-client.constants'

export function getIoClientToken(): string {
  return `${DECORATED_PREFIX}:Provider`
}
