import { Ratelimit } from '@upstash/ratelimit'
import { redis } from './redis'

const redisUrl = process.env.UPSTASH_REDIS_REST_URL
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN

const isRedisAvailable =
  redisUrl && redisToken && redisUrl.startsWith('https')

// Create a mock limiter for development
const mockLimiter = {
  limit: async () => ({ success: true, limit: 100, remaining: 100 }),
}

export const aiRatelimit = isRedisAvailable
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, '1 h'),
      analytics: true,
    })
  : (mockLimiter as any)

export const searchRatelimit = isRedisAvailable
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(30, '1 m'),
      analytics: true,
    })
  : (mockLimiter as any)
