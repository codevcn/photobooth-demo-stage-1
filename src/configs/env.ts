/**
 * Environment configuration
 * All environment variables must be prefixed with VITE_ to be exposed to the client
 */

const isDevelopment = import.meta.env.NODE_ENV === 'development'

export const env = {
  nodeEnv: import.meta.env.NODE_ENV,
  isDevelopment,
  apiBaseUrl: 'https://api.encycom.com/api',
} as const
