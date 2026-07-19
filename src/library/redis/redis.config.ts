import { CacheModuleAsyncOptions } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-store';
import envUtils from 'src/utils/env.utils';

export const redisConfig: CacheModuleAsyncOptions = {
  isGlobal: true,
  useFactory: async () => {
    const store = await redisStore({
      host: envUtils.getEnv('REDIS_HOST'),
      port: parseInt(envUtils.getEnv('REDIS_PORT')),
    });

    return {
      store: () => store,
    };
  },
};
