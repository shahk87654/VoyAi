import { Redis } from '@upstash/redis'

const redisUrl = process.env.UPSTASH_REDIS_REST_URL
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN

// Create a mock Redis instance for development if credentials are not available
const mockRedis = {
  get: async () => null,
  set: async () => null,
  setex: async () => null,
  del: async () => null,
} as unknown as Redis

let redisClient: Redis

try {
  if (
    redisUrl &&
    redisToken &&
    redisUrl.startsWith('https') &&
    !redisUrl.includes('...')
  ) {
    redisClient = new Redis({
      url: redisUrl,
      token: redisToken,
    })
  } else {
    redisClient = mockRedis
  }
} catch (error) {
  console.error('Redis initialization failed:', error)
  redisClient = mockRedis
}

export const redis = redisClient
