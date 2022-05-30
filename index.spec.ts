import * as shortener from './shortener';
import * as helper from './helper';
import { interpolator } from "./interpolator";

import { findAll, insert, removeAll } from "./__test__/db/in-memory-db";

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

  test("URL을 입력하면 축약한 주소를 얻는다.", () => {
    const mock = jest.spyOn(helper, "generateUuid").mockReturnValue('1q2w3e');

    const url = "https://example.com";
    const shortenUrl = shortener.shorten(url, {shortOrigin: 'short'});
    expect(shortenUrl).toMatch("https://short/1q2w3e");
  });

  test("shortOrigin 을 설정해서 shorten url 의 도메인 주소를 변경할 수 있다.", () => {
    const mock = jest.spyOn(helper, "generateUuid").mockReturnValue('1q2w3e');

    const url = "https://example.com";
    const shortenUrl = shortener.shorten(url, {shortOrigin: 'hello'});
    expect(shortenUrl).toMatch("https://hello/1q2w3e");
  });

  test("다른 URL을 입력하면 다른 축약한 주소를 얻는다.", () => {
    const mock = jest.spyOn(helper, "generateUuid").mockReturnValue('z1x2c3');

    const url = "https://sample.com";
    const shortenUrl = shortener.shorten(url, {shortOrigin: 'short'});
    expect(shortenUrl).toMatch("https://short/z1x2c3");

    // teardown
    mock.mockRestore();
  });

  test("동일한 URL을 입력하면 새로 URL을 생성하지 않고 기존에 생성한 URL을 활용한다.", () => {
    const mock = jest.spyOn(helper, "generateUuid").mockReturnValue('z1x2c3');

    const url = "https://sample.com";
    shortener.shorten(url, {shortOrigin: 'short'});
    shortener.shorten(url, {shortOrigin: 'short'});

    expect(mock).toBeCalledTimes(1);

    // teardown
    mock.mockRestore();
  })
})

describe("interpolator: ", () => {
  test("URL에 {ts}가 들어가면 timestamp를 interpolation 한다.", () => {
    const mock = jest.spyOn(helper, "getTimestamp").mockReturnValue('1234567890123');

    const url = "https://sample.com?ts={ts}";
    const interpolatedUrl = interpolator(url);

    expect(interpolatedUrl).toMatch('https://sample.com?ts=1234567890123')

    // teardown
    mock.mockRestore();
  })
})
