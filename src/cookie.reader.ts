
import { DateTime } from 'luxon'

const BEGIN_OF_TIME_RFC2822 = 'Thu, 01 Jan 1970 00:00:01 GMT'
const END_OF_TIME_RFC2822 = 'Fri, 31 Dec 9999 23:59:59 GMT'

export const getHtmlBasePath = () => {
const bases = document.getElementsByTagName('base')
if (bases.length > 0 && bases[0].href) {
    return new URL(bases[0].href).pathname
}
return undefined
}
    
export type CookieWriter = (cookie: string) => string
export type CookieReader = () => string

/**
 * documentCookieWriter implements the CookieWriter interface and writes the cookie to the document object
 *                      isolating the unpure function this way helps us unit test cookieApi.js better
 * @documentation https://developer.mozilla.org/en-US/docs/Web/API/Document/cookie
 * @parameter string cookie the cookie to set, see the documentation
 * @returns string cookie the value passed to the CookieWriter
 */
const documentCookieWriter: CookieWriter = cookie => {
  document.cookie = cookie
  return cookie
}

/**
 * documentCookieReader implements the CookieReader interface and reads the cookie from the document object
 *                      isolating the unpure function this way helps us unit test cookieApi.js better
 * @documentation https://developer.mozilla.org/en-US/docs/Web/API/Document/cookie
 * @returns string cookie the cookie from the global document object
 */
const documentCookieReader: CookieReader = () => document.cookie

/**
 * setCookie sets a cookie with name cname in the browser, with value cvalue and expiration date expressed as days in the future
 *           injecting the CookieWriter as a dependency allows for unit testing
 * @param cname the name of the cookie
 * @param cvalue the value of the cookie to set
 * @param exdays the expiration time expressed as number of days in the future from now
 * @param writer implementing the CookieWriter interface, defaults to documentCookieWriter
 * @returns the written cookie
 */
const setCookie = (cname: string, cvalue: any, exdays: number, writer: CookieWriter = documentCookieWriter): string => {
  const expirationDate: string = DateTime.local()
    .plus({ days: exdays })
    .toJSDate()
    .toUTCString()

  const expires: string = `expires=${expirationDate}`
  const cookie: string = `${cname}=${cvalue}; ${expires}; path=/`
  return writer(cookie)
}

type SetCookieWithOptionsProps = {
  name: string
  value: string
  expires?: number // TTL in seconds or Infinity
  path?: string
  sameSite?: 'strict' | 'lax'
  secure?: boolean
  sessionCookie?: boolean
}

const defaultSetCookieWithOptionsProps: SetCookieWithOptionsProps = {
  name: '',
  value: '',
  expires: -1,
  path: '/',
  sameSite: 'strict',
  secure: true,
  sessionCookie: false,
}

const setCookieWithOptions = (props: SetCookieWithOptionsProps, writer: CookieWriter = documentCookieWriter) => {
  const { name, value, path, secure, expires, sessionCookie, sameSite } = {
    ...defaultSetCookieWithOptionsProps,
    ...props,
  }

  if (!sessionCookie && (expires || 0) <= 0) {
    throw new Error('setCookieWithOptions: `expires` should >0 for a non-session cookie')
  }

  if (sessionCookie && (expires || 0) > 0) {
    throw new Error('setCookieWithOptions: a session cookie can not have an `expires` value')
  }

  const keyValue = `${name}=${encodeURIComponent(value)}`

  // Note: Despite officially defined in RFC 6265, the use of `max-age` is not compatible with any
  // version of Internet Explorer, Edge and some mobile browsers.
  // From: https://developer.mozilla.org/en-US/docs/Web/API/Document/cookie/Simple_document.cookie_framework
  const expiresValue =
    expires === Infinity
      ? END_OF_TIME_RFC2822
      : DateTime.local()
          .plus({ second: expires })
          .toUTC()
          .toJSDate()
          .toUTCString()

  // If neither expires nor max-age specified it will expire at the end of session.
  const sExpire = sessionCookie ? '' : `; expires=${expiresValue}`
  const sPath = `; path=${path}`
  const sSecure = secure ? `; secure` : ''
  const sSameSite = `; samesite=${sameSite}`

  const cookie = `${keyValue}${sExpire}${sPath}${sSameSite}${sSecure}`

  writer(cookie)
}

/**
 * removeCookie removes cookie cname if it exists, either on path / or on the base path
 * @param cname the name of the cookie
 * @param writer implementing the CookieWriter interface, by default writing to document.cookies
 */
const removeCookie = (cname: string, writer: CookieWriter = documentCookieWriter): void => {
  const basePath = getHtmlBasePath() || '/'
  // expire date in the past removes the cookie
  writer(`${cname}=;expires=${BEGIN_OF_TIME_RFC2822};path=/`)
  // in Firefox, cookie deletion seems to work only without path
  if (getFirstCookie(cname)) {
    writer(`${cname}=;expires=${BEGIN_OF_TIME_RFC2822}`)
  }
  // some cookies may be created for the base path (eg /app) instead of /
  if (getFirstCookie(cname) && basePath !== '/') {
    const publicPath = basePath.endsWith('/') ? basePath.slice(0, -1) : basePath
    writer(`${cname}=;expires=${BEGIN_OF_TIME_RFC2822};path=${publicPath}`)
  }
  // in Edge, cookies seem to be created with a trailing slash in the path (eg /app/)
  if (getFirstCookie(cname) && basePath !== '/') {
    const publicPath = basePath.endsWith('/') ? basePath : `${basePath}/`
    writer(`${cname}=;expires=${BEGIN_OF_TIME_RFC2822};path=${publicPath}`)
  }
}

/**
 * getFirstCookie gets a cookie with name cname in the browser, if it exists, from the CookieReader
 *                injecting the CookieReader allows for testing using dependency injection
 * @param cname the name of the cookie
 * @param reader the cookie reader to use, defaults to documentCookieReader
 * @returns cname the name of the cookie if it exists, if not it returns ''
 */
const getFirstCookie = (cname: string, reader: CookieReader = documentCookieReader): string => {
  const name: string = `${cname}=`
  const cookies: string = reader()

  if (!cookies) return ''

  return (
    decodeURIComponent(cookies) // @reviewer: should we first split, than decode the splits?
      .split(';')
      .filter(cs => cs.includes(name))
      .map(c => c.trimLeft())
      .map(c => c.substring(name.length))[0] || ''
  )
}

/**
 * getCookieNames returns the names of all available cookies in an array
 * @param reader the cookie reader to use, defaults to documentCookieReader
 */
const getCookieNames = (reader: CookieReader = documentCookieReader): string[] => {
  const cookieStr = reader()
  if (!cookieStr) return []

  return cookieStr
    .split(';')
    .map(c => c.split('=')[0])
    .filter(c => !!c)
    .map(c => c.trim())
}

/**
 * checkCookie gets a boolean value if a cookie with name cname exists already
 *             injecting CookieReader allows for testing using dependency injection
 * @param reader the cookie reader to use, defaults to documentCookieReader
 * @param cname the name of the cookie
 * @returns boolean true if cookie cname exists, boolean false if cookie doesn't exist
 */
const checkCookie = (cname: string, reader: CookieReader = documentCookieReader): boolean =>
  !!getFirstCookie(cname, reader)

export default {
  checkCookie,
  getCookieNames,
  getCookie: getFirstCookie,
  setCookie,
  setCookieWithOptions,
  removeCookie,
}
