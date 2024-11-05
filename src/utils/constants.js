import { env } from '~/config/environment'


//Những tài nguyên được phép truy cập đến tài nguyên của Server
export const WHITELIST_DOMAINS = [
  'http://localhost:5173'
]

export const WEBSITE_DOMAIN = (env.BUILD_MODE === 'production') ? env.WEBSITE_DOMAIN_PRODUCTION : env.WEBSITE_DOMAIN_DEVELOPMENT

export const COURSE_LEVEL = {
  LEVEL1: 'Basic',
  LEVEL2: 'Intermediate',
  LEVEL3: 'Advanced'
}

export const DEFAULT_PAGE = 1
export const DEFAULT_ITEMS_PER_PAGE = 5
