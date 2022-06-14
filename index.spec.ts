import * as shortener from './shortener';
import * as helper from './helper';
import * as interpolator from "./interpolator";

import {findAll, findByKey, insert, removeAll} from "./__test__/db/in-memory-db";
import {getTimestamp} from "./helper";

describe('shortener: ',() => {
  beforeEach(() => {
    shortener.init({
      insert,
      findAll
    })
  })

  afterEach(() => {
    // teardown
    removeAll();
  })

  test("URL을 입력하면 축약한 주소를 얻는다.", async () => {
    const mock = jest.spyOn(helper, "generateUuid").mockReturnValue('1q2w3e');

    const url = "https://example.com";
    const shortenUrl = await shortener.shorten(url, {shortOrigin: 'short'});
    expect(shortenUrl).toBe("https://short/1q2w3e");

    mock.mockRestore();
  });

  test("shortOrigin 을 설정해서 shorten url 의 도메인 주소를 변경할 수 있다.", async () => {
    const mock = jest.spyOn(helper, "generateUuid").mockReturnValue('1q2w3e');

    const url = "https://example.com";
    const shortenUrl = await shortener.shorten(url, {shortOrigin: 'hello'});
    expect(shortenUrl).toBe("https://hello/1q2w3e");

    mock.mockRestore();
  });

  test("protocol 을 설정해서 shorten url 의 프로토콜을 변경할 수 있다.", async () => {
    const mock = jest.spyOn(helper, "generateUuid").mockReturnValue('1q2w3e');

    const url = "https://example.com";
    const shortenUrl = await shortener.shorten(url, {shortOrigin: 'hello', protocol: 'app:'});
    expect(shortenUrl).toBe("app://hello/1q2w3e");

    mock.mockRestore();
  });

  test("다른 URL을 입력하면 다른 축약한 주소를 얻는다.", async () => {
    const mock = jest.spyOn(helper, "generateUuid").mockReturnValue('z1x2c3');

    const url = "https://sample.com";
    const shortenUrl = await shortener.shorten(url, {shortOrigin: 'short'});
    expect(shortenUrl).toBe("https://short/z1x2c3");

    // teardown
    mock.mockRestore();
  });

  test("동일한 URL을 입력하면 새로 URL을 생성하지 않고 기존에 생성한 URL을 활용한다.", async () => {
    const mock = jest.spyOn(helper, "generateUuid").mockReturnValue('z1x2c3');

    const url = "https://sample.com";
    await shortener.shorten(url, {shortOrigin: 'short'});
    await shortener.shorten(url, {shortOrigin: 'short'});

    expect(mock).toBeCalledTimes(1);

    // teardown
    mock.mockRestore();
  })
})

describe("invokeUrl", () => {
  let mock: any = null;

  beforeEach(async () => {
    mock = jest.spyOn(helper, "generateUuid").mockReturnValue('1q2w3e');

    shortener.init({
      insert,
      findAll,
      findByKey
    })

    const url = "https://example.com";
    await shortener.shorten(url, {shortOrigin: 'short'});
  })

  afterEach(() => {
    // teardown
    removeAll();
    if(!!mock){
      mock.mockRestore();
    }
  })

  test("key 를 전달하면, 할당했던 URL 을 받는다. ", async () => {
    const key = 'https://short/1q2w3e'
    const realUrl = await shortener.invokeUrl(key);
    expect(realUrl).toBe('https://example.com');
  })

  test("존재하지 않는 key 를 전달하면, 에러가 발생한다. ", async () => {
    const key = 'https://short/asdf'
    await expect(shortener.invokeUrl(key)).rejects.toThrow()
  })
})

describe('prune', () => {
  beforeEach(() => {
    shortener.init({
      insert,
      findAll,
      findByKey,
      pruneTargets: ['foo', 'bar']
    })
  })
  test('필터링 하려는 query string 은 url 에서 제거하고 제거한 query string 을 반환한다.', () => {
    const url = 'https://example.com/main?foo=hello&bar=world&baz=test'
    const pruneUrl = shortener.pruneUrl(url);
    expect(pruneUrl.url).toBe('https://example.com/main?baz=test')
    expect(pruneUrl.filtered).toStrictEqual({"foo": 'hello', "bar": "world"});
  })

  test('query string 이 필터링 하려는 query string 으로만 이루어져 있으면 ? 마크가 없는 URL 을 반환한다.', () => {
    const url = 'https://example.com/main?foo=hello'
    const pruneUrl = shortener.pruneUrl(url);
    expect(pruneUrl.url).toBe('https://example.com/main')
    expect(pruneUrl.filtered).toStrictEqual({"foo": 'hello'});
  })
})

describe("interpolator: ", () => {
  let mock: any = null;
  beforeEach(async () => {
    // given
    mock = jest.spyOn(helper, "getTimestamp").mockReturnValue('1234567890123');

    interpolator.init({
      ts: getTimestamp()
    })
  })

  afterEach(() => {
    // teardown
    interpolator.destroy();
    if(!!mock){
      mock.mockRestore();
    }
  })



  test("URL에 {ts}가 들어가면 timestamp를 interpolation 한다.", () => {
    // when
    const url = "https://sample.com?ts={ts}";
    const interpolatedUrl = interpolator.interpolate(url);

    // given
    expect(interpolatedUrl).toBe('https://sample.com?ts=1234567890123')
  })

  test("URL에 {domain} 과 {page} 가 들어가면 jobs 와 main 을 interpolation 한다.", () => {
    // given
    interpolator.destroy();
    interpolator.init({
      domain: "jobs",
      page: "main"
    })

    // when
    const url = "https://sample.{domain}.com/{page}";
    const interpolatedUrl = interpolator.interpolate(url);

    // given
    expect(interpolatedUrl).toBe('https://sample.jobs.com/main')
  })

  test("query string 을 {?ts} 형태로 사용할 수 있다", () => {
    // when
    const url = "https://sample.com/main{?ts}";
    const interpolatedUrl = interpolator.interpolate(url);

    // then
    expect(interpolatedUrl).toBe('https://sample.com/main?ts=1234567890123')
  })

  test("URL에 origin 과 query string 을 조합해서 interpolation 한다.", () => {
    // given
    interpolator.destroy();
    interpolator.init({
      domain: "jobs",
      page: "main",
      ts: getTimestamp()
    })

    // when
    const url = "https://sample.{domain}.com/{page}{?ts}";
    const interpolatedUrl = interpolator.interpolate(url);

    // given
    expect(interpolatedUrl).toBe('https://sample.jobs.com/main?ts=1234567890123')
  })
})
