import {generateUuid} from "./helper";

interface ShortenerInit {
    insert: (url: { key: string; value: string}) => void;
    findAll: () => {key: string; value: string}[]
}

interface ShortenerCore {
  register: (shortenUrl: string, url: string) => void;
  getShortenUrls: () => {key: string; value: string}[];
  generateUuid: (url: string) => string;
}

let coreOptions: null | ShortenerCore  = null;
export function init(options: ShortenerInit) {
  coreOptions = {
    register (shortenUrl: string, url: string) {
      if(!options) throw new Error("You should init first");

      options.insert({
        key: shortenUrl,
        value: url
      })
    },
    getShortenUrls(): {key: string; value: string}[] {
      if(!options) throw new Error("You should init first");

      const urls = options.findAll();
      return urls;
    }
  }
}

interface ShortenOptions {
    shortOrigin: string;
}

export function shorten(url: string, options: ShortenOptions) {
    const {url: shortenUrl, shouldRegister} = convertUrl(url, options.shortOrigin);
    if(shouldRegister) {
      coreOptions.register(shortenUrl, url);
    }
    return shortenUrl;
}

function convertUrl(url: string, shortOrigin: string) {
    const registeredUrl = coreOptions.getShortenUrls().find(obj => obj.value === url);
    return registeredUrl ?
        { url: registeredUrl.key, shouldRegister: !registeredUrl } :
        { url: createShortenUrl(url, shortOrigin), shouldRegister: !registeredUrl }
}

function createShortenUrl(url: string, shortOrigin: string) {
    const currentUrl = new URL(url);
    return `${currentUrl.protocol}//${shortOrigin}/${generateUuid(url)}`;
}
