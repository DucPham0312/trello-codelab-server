import { env } from '~/config/environment'


//Những tài nguyên được phép truy cập đến tài nguyên của Server
export const WHITELIST_DOMAINS = [
  'http://localhost:8012'
]

export const WEBSITE_DOMAIN = (env.BUILD_MODE === 'production') ? env.WEBSITE_DOMAIN_PRODUCTION : env.WEBSITE_DOMAIN_DEVELOPMENT