export const AUTH_LOGIN_PATH = '/login'
export const AUTH_API_PREFIX = '/api/auth'
export const INGEST_API_PATH = '/api/ingest'

const PUBLIC_PREFIXES = [
    AUTH_LOGIN_PATH,
    AUTH_API_PREFIX,
    INGEST_API_PATH,
]

export function isPublicPath(path: string) {
    return PUBLIC_PREFIXES.some(prefix => path.startsWith(prefix))
}

export function isLoginPath(pathname: string) {
    return pathname.startsWith(AUTH_LOGIN_PATH)
}