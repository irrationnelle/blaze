import {generateUuid} from "./helper";

interface ShortenerInit {
    insert: (url: { key: string; value: string}) => void;
    findAll: () => Promise<{key: string; value: string}[]>;
    findByKey: (key: string) => Promise<string>;
    pruneTargets: string[];
}

interface ShortenerCore {
  register: (shortenUrl: string, url: string) => void;
  getShortenUrls: () => Promise<{key: string; value: string}[]>;
  getRealUrl: (key: string) => Promise<string>;
  filterQueryString: (url: string) => {url: string; filtered: Record<string, string>};
}

let coreOptions: null | ShortenerCore  = null;
export function initShortener(options: ShortenerInit) {
  coreOptions = {
    register (shortenUrl: string, url: string) {
      if(!options) throw new Error("You should init first");

      options.insert({
        key: shortenUrl,
        value: url
      })
    },
    async getShortenUrls(): Promise<{key: string; value: string}[]> {
      if(!options) throw new Error("You should init first");

      return options.findAll();
    },
    async getRealUrl(key: string): Promise<string> {
      if(!options) throw new Error("You should init first");

      return options.findByKey(key);
    },
    filterQueryString(url: string): {url: string, filtered: Record<string, string>} {
      if(!options) throw new Error("You should init first");

      const QUESTION_MARK = '?';

      const filterTargets = options.pruneTargets;

      const queries = {};
      const result = url.replace(/[?&]+([^=&]+)=([^&]*)/gi, (match,key,value) => {
        const shouldAddQuestionMark = match.includes(QUESTION_MARK);

        if(filterTargets.includes(key)) {
          queries[key] = value;
          return shouldAddQuestionMark ? '?' : '';
        }
        return shouldAddQuestionMark ?  `?${key}=${value}`: `${key}=${value}`;
      });

      return {
        url: result.slice(-1) === '?' ? result.substring(0, result.length - 1) : result,
        filtered: queries
      }
    }
  }
}

interface ShortenOptions {
    shortOrigin?: string;
    protocol?: string;
}

export async function shorten(url: string, options: ShortenOptions) {
    const {url: shortenUrl, shouldRegister} = await convertUrl(url, options);
    if(shouldRegister) {
      coreOptions.register(shortenUrl, url);
    }
    return shortenUrl;
}

async function convertUrl(url: string, options: ShortenOptions) {
    const registeredUrls = await coreOptions.getShortenUrls();
    const registeredUrl = registeredUrls.find(obj => obj.value === url);
    return registeredUrl ?
        { url: registeredUrl.key, shouldRegister: !registeredUrl } :
        { url: createShortenUrl(url, options), shouldRegister: !registeredUrl }
}

function createShortenUrl(url: string, options: ShortenOptions) {
    const currentUrl = new URL(url);
    return `${options.protocol ?? currentUrl.protocol}//${options.shortOrigin}/${generateUuid(url)}`;
}

export async function invokeUrl(key: string) {
  return coreOptions.getRealUrl(key);
}

export function pruneUrl(url: string) {
  return coreOptions.filterQueryString(url)
}