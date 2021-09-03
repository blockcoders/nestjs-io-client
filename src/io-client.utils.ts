import { DECORATED_PREFIX } from './io-client.constants';

export function getIOClientToken(): string {
  return `${DECORATED_PREFIX}:Provider`;
}
