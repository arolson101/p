import * as Rx from 'rxjs/Rx'
import * as URL from 'url'
import axios, { AxiosResponse, CancelToken } from 'axios'
const axiosHttpAdapter = require('axios/lib/adapters/http')
const CancelToken = axios.CancelToken

// https://github.com/mzabriskie/axios/pull/493 - supposed to fix this but it's not working
const fixUrl = (url: string): string => {
  let obj = URL.parse(url)
  if (!obj.protocol) {
    return 'http://' + url
  } else {
    return url
  }
}

const isValidUrl = (url: string): boolean => {
  if (!url) {
    return false
  }
  let obj = URL.parse(fixUrl(url))
  if (!obj.protocol) {
    obj = URL.parse('http://' + url)
  }
  if (!obj.host) {
    return false
  } else {
    return true
  }
}

const httpGet = (url: string, cancelToken?: CancelToken): Promise<AxiosResponse> => {
  return axios.get(fixUrl(url), {
    // force axios to use http adapter because xhr throws ERR_INSECURE_RESPONSE and for favicons I don't care
    adapter: axiosHttpAdapter,
    responseType: 'arraybuffer',
    cancelToken
  })
}

const getFaviconFromDocument = async (response: AxiosResponse, cancelToken?: CancelToken): Promise<string> => {
  if (!response.data) {
    throw new Error('no data')
  }
  // https://github.com/mzabriskie/axios/issues/799
  const currentUrl: string = (response as any).request.res.responseUrl
  if (!currentUrl) {
    throw new Error('response.request.res.responseUrl was empty')
  }
  const parser = new DOMParser()
  const doc = parser.parseFromString(response.data.toString('utf8'), 'text/html')
  if (!doc) {
    throw new Error(`error parsing body from ${currentUrl}`)
  }
  for (let child of doc.head.children as any as HTMLElement[]) {
    const rel = (child.getAttribute('rel') || '').toLowerCase()
    if (child.nodeName.toLowerCase() === 'link' && (rel === 'icon' || rel === 'shortcut icon')) {
      const href = child.getAttribute('href')
      if (href) {
        const resolvedLocation = URL.resolve(currentUrl, href)
        const data = await getIconDataURI(resolvedLocation, cancelToken)
        if (data) {
          return data
        }
      }
    }
  }
  // console.log(`No icon in html; falling back to /favicon.ico`)
  const location = URL.resolve(currentUrl, '/favicon.ico')
  return getIconDataURI(location, cancelToken)
}

const getIconDataURI = async (url: string, cancelToken?: CancelToken): Promise<string> => {
  const response = await httpGet(url, cancelToken)
  if (response.status === 200 && response.data && (response.data as Buffer).length) {
    const type = response.headers['content-type'] as string
    if (!type.startsWith('text') && type.indexOf(' ') === -1) {
      // console.log(`${response.url} appears to be a good icon`)
      const data = new Buffer(response.data).toString('base64')
      return `data:${type};base64,${data}`
    }
  }
  return ''
}

export const getFavicon = async (url: string, cancelToken?: CancelToken): Promise<string | undefined> => {
  try {
    if (!isValidUrl(url)) {
      return undefined
    }
    const response = await httpGet(url, cancelToken)
    const favico = await getFaviconFromDocument(response, cancelToken)
    return favico
  } catch (err) {
    if (!axios.isCancel(err)) {
      console.log(`error retrieving favicon from ${url}: ${err.message}`)
    }
    return ''
  }
}

export const getFaviconStream = (url: string): Rx.Observable<string | undefined> => {
  return Rx.Observable.create((observer: Rx.Observer<string | undefined>) => {
    const source = CancelToken.source()
    getFavicon(url, source.token).then(
      (icon) => observer.next(icon),
      (err) => observer.error(err)
    )

    return () => {
      source.cancel()
    }
  })
}
