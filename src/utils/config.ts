import { z } from 'zod';

// Configuration schema with validation
const configSchema = z.object({
  BLAND_API_KEY: z.string().min(1, 'Bland AI API key is required'),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  MCP_SERVER_PORT: z.string().transform(Number).default('3000'),
  ENABLE_METRICS: z.string().transform(val => val === 'true').default('false'),
  RATE_LIMIT_REQUESTS: z.string().transform(Number).default('100'),
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).default('60000'), // 1 minute
});

export type Config = z.infer<typeof configSchema>;

class ConfigManager {
  private static instance: ConfigManager;
  private config: Config;

  private constructor() {
    // Load environment variables
    const env = {
      BLAND_API_KEY: process.env.BLAND_API_KEY || '',
      LOG_LEVEL: process.env.LOG_LEVEL || 'info',
      NODE_ENV: process.env.NODE_ENV || 'development',
      MCP_SERVER_PORT: process.env.MCP_SERVER_PORT || '3000',
      ENABLE_METRICS: process.env.ENABLE_METRICS || 'false',
      RATE_LIMIT_REQUESTS: process.env.RATE_LIMIT_REQUESTS || '100',
      RATE_LIMIT_WINDOW_MS: process.env.RATE_LIMIT_WINDOW_MS || '60000',
    };

    // Validate configuration
    const result = configSchema.safeParse(env);
    if (!result.success) {
      const errors = result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join('\n');
      throw new Error(`Configuration validation failed:\n${errors}`);
    }

    this.config = result.data;
  }

  public static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  public get(): Config {
    return this.config;
  }

  public isProduction(): boolean {
    return this.config.NODE_ENV === 'production';
  }

  public isDevelopment(): boolean {
    return this.config.NODE_ENV === 'development';
  }
}

export const config = ConfigManager.getInstance().get();
export default ConfigManager.getInstance(); 