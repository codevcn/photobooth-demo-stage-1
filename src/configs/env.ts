/**
 * Environment configuration
 * All environment variables must be prefixed with VITE_ to be exposed to the client
 */

const isDevelopment = import.meta.env.NODE_ENV === 'development'

export const env = {
  nodeEnv: import.meta.env.NODE_ENV,
  isDevelopment,
  apiBaseUrl: isDevelopment
    ? import.meta.env.VITE_DEV_API_BASE_URL
    : import.meta.env.VITE_API_BASE_URL,
} as const
