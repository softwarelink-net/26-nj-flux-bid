import { type Env, TENDER, json } from '../lib'

export function handleHealth(env: Env) {
  return json({
    success: true,
    worker: 'allworld',
    slug: env.PROJECT_SLUG || '26-nj-flux-bid',
    d1: 'Allworld',
  })
}

export function handleTender() {
  const end = new Date(TENDER.deadline.replace(' ', 'T') + '+08:00').getTime()
  const diff = Math.max(0, end - Date.now())
  return json({
    success: true,
    data: {
      ...TENDER,
      countdown: {
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
        expired: diff <= 0,
      },
    },
  })
}
