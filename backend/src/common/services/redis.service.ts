import { Injectable, Logger } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService {
  private client: Redis;
  private logger = new Logger('RedisService');

  constructor() {
    const redisUrl = this.buildRedisUrl();
    this.client = new Redis(redisUrl);
    this.client.on('error', (err) => this.logger.error('Redis error', err));
    this.client.on('connect', () => this.logger.log('✅ Redis connected'));
  }

  private buildRedisUrl(): string {
    if (process.env.REDIS_URL) {
      return process.env.REDIS_URL;
    }

    const protocol = process.env.REDIS_TLS === 'true' ? 'rediss' : 'redis';
    const password = process.env.REDIS_PASSWORD ? `:${process.env.REDIS_PASSWORD}@` : '';
    const host = process.env.REDIS_HOST || 'localhost';
    const port = process.env.REDIS_PORT || 6379;

    return `${protocol}://${password}${host}:${port}`;
  }

  getClient(): Redis {
    return this.client;
  }

  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  async set(key: string, value: string, ttl?: number): Promise<void> {
    if (ttl) {
      await this.client.setex(key, ttl, value);
    } else {
      await this.client.set(key, value);
    }
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  async incr(key: string): Promise<number> {
    return this.client.incr(key);
  }

  async expire(key: string, ttl: number): Promise<void> {
    await this.client.expire(key, ttl);
  }

  async quit(): Promise<void> {
    await this.client.quit();
  }
}
