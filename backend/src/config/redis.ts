import { Redis } from 'ioredis';
import { env } from './env.js';

// In-memory fallback when Redis is unavailable
const memoryStore = new Map<string, { value: string; expires: number }>();

let redis: Redis | null = null;
let useMemory = false;

// Try to connect to Redis, fallback to memory if unavailable
try {
    redis = new Redis(env.redisUrl, {
        maxRetriesPerRequest: 1,
        lazyConnect: true,
        connectTimeout: 2000,
        retryStrategy: (times: number) => {
            if (times > 2) {
                console.log('⚠️  Redis unavailable, using in-memory storage');
                useMemory = true;
                return null; // Stop retrying
            }
            return Math.min(times * 100, 1000);
        },
    });

    redis.on('connect', () => {
        console.log('✅ Redis connected');
        useMemory = false;
    });

    redis.on('error', () => {
        if (!useMemory) {
            console.log('⚠️  Redis connection failed, using in-memory storage');
            useMemory = true;
        }
    });

    // Try to connect
    redis.connect().catch(() => {
        useMemory = true;
    });
} catch {
    console.log('⚠️  Redis not configured, using in-memory storage');
    useMemory = true;
}

// Export a proxy object that handles both Redis and memory
const redisClient = {
    async get(key: string): Promise<string | null> {
        if (useMemory) {
            const item = memoryStore.get(key);
            if (!item) return null;
            if (Date.now() > item.expires) {
                memoryStore.delete(key);
                return null;
            }
            return item.value;
        }
        return redis?.get(key) ?? null;
    },

    async set(key: string, value: string, _mode?: string, ttlSeconds?: number): Promise<void> {
        if (useMemory) {
            memoryStore.set(key, {
                value,
                expires: Date.now() + (ttlSeconds || 300) * 1000,
            });
            return;
        }
        if (ttlSeconds) {
            await redis?.set(key, value, 'EX', ttlSeconds);
        } else {
            await redis?.set(key, value);
        }
    },

    async incr(key: string): Promise<number> {
        if (useMemory) {
            const item = memoryStore.get(key);
            const newVal = item ? parseInt(item.value, 10) + 1 : 1;
            memoryStore.set(key, {
                value: String(newVal),
                expires: item?.expires || Date.now() + 3600 * 1000,
            });
            return newVal;
        }
        return (await redis?.incr(key)) ?? 1;
    },

    async expire(key: string, seconds: number): Promise<void> {
        if (useMemory) {
            const item = memoryStore.get(key);
            if (item) {
                item.expires = Date.now() + seconds * 1000;
            }
            return;
        }
        await redis?.expire(key, seconds);
    },

    async del(key: string): Promise<void> {
        if (useMemory) {
            memoryStore.delete(key);
            return;
        }
        await redis?.del(key);
    },

    async keys(pattern: string): Promise<string[]> {
        if (useMemory) {
            const regex = new RegExp(pattern.replace(/\*/g, '.*'));
            return Array.from(memoryStore.keys()).filter(k => regex.test(k));
        }
        return (await redis?.keys(pattern)) ?? [];
    },
};

// Cache helpers
export async function getCache<T>(key: string): Promise<T | null> {
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
}

export async function setCache(key: string, value: unknown, ttlSeconds = 300): Promise<void> {
    await redisClient.set(key, JSON.stringify(value), 'EX', ttlSeconds);
}

export async function deleteCache(key: string): Promise<void> {
    await redisClient.del(key);
}

export async function deleteCachePattern(pattern: string): Promise<void> {
    const keys = await redisClient.keys(pattern);
    for (const key of keys) {
        await redisClient.del(key);
    }
}

export { redis };
export default redisClient;
