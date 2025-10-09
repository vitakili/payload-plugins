import type { Payload } from 'payload'
import { getPayload } from 'payload'
import { afterAll, beforeAll } from 'vitest'
import configPromise from './payload.config.js'

let payload: Payload

beforeAll(async () => {
  payload = await getPayload({ config: await configPromise })
})

afterAll(async () => {
  if (typeof payload.db.destroy === 'function') {
    await payload.db.destroy()
  }
})

export { payload }
