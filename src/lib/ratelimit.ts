import { Ratelimit } from '@upstash/ratelimit'
import { redis } from './redis'

const redisUrl = process.env.UPSTASH_REDIS_REST_URL
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN

const isRedisConfigured =
  redisUrl && redisToken && redisUrl.startsWith('https') && !redisUrl.includes('...')

// Create a safe mock limiter for development
const createMockLimiter = () => ({
  limit: async (key: string) => ({
    success: true,
    limit: 1000,
    remaining: 1000,
    reset: new Date(Date.now() + 3600000),
    pending: Promise.resolve(),
  }),
  resetKey: async (key: string) => undefined,
  resetAll: async () => undefined,
})

export const aiRatelimit = isRedisConfigured
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, '1 h'),
      analytics: true,
    })
  : createMockLimiter()

export const searchRatelimit = isRedisConfigured
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(30, '1 m'),
      analytics: true,
    })
  : createMockLimiter()
