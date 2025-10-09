import type { Payload } from 'payload'
import { getPayload } from 'payload'
import { afterAll, beforeAll } from 'vitest'
import configPromise from './payload.config.js'

let _payload: Payload

beforeAll(async () => {
  _payload = await getPayload({ config: await configPromise })
})

afterAll(async () => {
  if (typeof _payload?.db?.destroy === 'function') {
    await _payload.db.destroy()
  }
})

export const getPayloadInstance = (): Payload => _payload
