import * as http from 'http'
import * as https from 'https'
import * as url from 'url'

interface Response {
  urlStr: string
  statusCode: number
  headers: any
  body: Buffer
}

const isValidUrl = (urlStr: string): boolean => {
  let obj = url.parse(urlStr)
  if (!obj.protocol) {
    obj = url.parse('http://' + urlStr)
  }
  if (!obj.host) {
    return false
  } else {
    return true
  }
}

// TODO: switch to https://github.com/mzabriskie/axios
const httpGet = (urlStr: string): Promise<Response> => {
  return new Promise((resolve, reject) => {
    const obj = url.parse(urlStr)
    if (!obj.protocol) {
      urlStr = 'http://' + urlStr
    }
    const get = (obj.protocol === 'https:' ? https.get : http.get)
    get(urlStr, (response) => {
      const { statusCode } = response
      if (statusCode < 400) {
        const data: any[] = []
        response.on('error', reject)
        response.on('data', chunk => data.push(chunk))
        response.on('end', () => {
          const body = Buffer.concat(data)
          resolve({urlStr, statusCode, headers: response.headers, body})
        })
      } else {
        reject(new Error(`Request failed: status ${statusCode} for ${urlStr}`))
      }
    })
  })
}

const isRedirect = (code: number) => {
  return (300 <= code && code < 400)
}

const getPage = async (urlStr: string): Promise<Response> => {
  const seenLocations = new Set<string>()
  seenLocations.add(urlStr)
  let response: Response
  while (true) {
    response = await httpGet(urlStr)
    if (isRedirect(response.statusCode)) {
      const location = url.resolve(urlStr, response.headers.location)
      if (!location) {
        throw new Error(`Bad response: redirect ${response.statusCode} with no 'location' header at ${urlStr}`)
      }
      if (seenLocations.has(location)) {
        throw new Error(`Bad response: circular redirect to already-visited location ${location}`)
      }
      urlStr = location
    } else {
      break
    }
  }

  return response
}

const getFaviconFromDocument = async (response: Response): Promise<string> => {
  if (!response.body) {
    throw new Error('no body')
  }
  const parser = new DOMParser()
  const doc = parser.parseFromString(response.body.toString('utf8'), 'text/html')
  if (!doc) {
    throw new Error(`error parsing body from ${response.urlStr}`)
  }
  for (let child of doc.head.children as any as HTMLElement[]) {
    const rel = (child.getAttribute('rel') || '').toLowerCase()
    if (child.nodeName.toLowerCase() === 'link' && (rel === 'icon' || rel === 'shortcut icon')) {
      const href = child.getAttribute('href')
      if (href) {
        const location = url.resolve(response.urlStr, href)
        const data = await getIconDataURI(location)
        if (data) {
          return data
        }
      }
    }
  }
  // console.log(`No icon in html; falling back to /favicon.ico`)
  const location = url.resolve(response.urlStr, '/favicon.ico')
  return await getIconDataURI(location)
}

const getIconDataURI = async (urlStr: string): Promise<string> => {
  const response = await getPage(urlStr)
  if (response.statusCode === 200 && response.body) {
    const type = response.headers['content-type'] as string
    if (!type.startsWith('text') && type.indexOf(' ') === -1) {
      // console.log(`${response.urlStr} appears to be a good icon`)
      const data = new Buffer(response.body).toString('base64')
      return `data:${type};base64,${data}`
    }
  }
  return ''
}

export const getFavicon = async (urlStr: string): Promise<string | undefined> => {
  try {
    if (!isValidUrl(urlStr)) {
      return undefined
    }
    const response = await getPage(urlStr)
    const favico = await getFaviconFromDocument(response)
    return favico
  } catch (err) {
    console.log(`error retrieving favicon from ${urlStr}: ${err.message}`)
    return ''
  }
}
