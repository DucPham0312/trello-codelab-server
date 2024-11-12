import { env } from '~/config/environment'


//Những tài nguyên được phép truy cập đến tài nguyên của Server
export const WHITELIST_DOMAINS = [
  'http://localhost:8020',
  'https://piehost.com/socketio-tester'
]

export const WEBSITE_DOMAIN = (env.BUILD_MODE === 'production') ? env.WEBSITE_DOMAIN_PRODUCTION : env.WEBSITE_DOMAIN_DEVELOPMENT

export const COURSE_LEVEL = {
  LEVEL1: 'Basic',
  LEVEL2: 'Intermediate',
  LEVEL3: 'Advanced'
}

export const DEFAULT_PAGE = 1
export const DEFAULT_ITEMS_PER_PAGE = 5

export const INVITATION_TYPES = {
  COURSE_INVITATION: 'COURSE_INVITATION'
}

export const COURSE_INVITATION_STATUS = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED'
}

export const MEMBER_ACTIONS = {
  ADD: 'ADD',
  REMOVE: 'REMOVE'
}