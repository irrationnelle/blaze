import * as interpolator from "./interpolator";
import {getTimestamp} from "./helper";
import targetMap from 'blaze-test-plugin'

describe("interpolator: ", () => {
  let mock: any = null;
  beforeEach(async () => {
    // given
    mock = jest.spyOn(Date, "now").mockReturnValue('1234567890123');

    interpolator.initInterpolator(() => Promise.resolve({
      ts: getTimestamp()
    }))
  })

  afterEach(() => {
    // teardown
    interpolator.destroy();
    if(!!mock){
      mock.mockRestore();
    }
  })


  test("URL에 {ts}가 들어가면 timestamp를 interpolation 한다.", async () => {
    // when
    const url = "https://sample.com?ts={ts}";
    const interpolatedUrl = await interpolator.interpolate(url);

    // given
    expect(interpolatedUrl).toBe('https://sample.com?ts=1234567890123')
  })

  test("URL에 {domain} 과 {page} 가 들어가면 jobs 와 main 을 interpolation 한다.", async () => {
    // given
    interpolator.destroy();
    interpolator.initInterpolator(() => Promise.resolve({
      domain: "jobs",
      page: "main"
    }))

    // when
    const url = "https://sample.{domain}.com/{page}";
    const interpolatedUrl = await interpolator.interpolate(url);

    // given
    expect(interpolatedUrl).toBe('https://sample.jobs.com/main')
  })

  test("query string 을 {?ts} 형태로 사용할 수 있다", async () => {
    // when
    const url = "https://sample.com/main{?ts}";
    const interpolatedUrl = await interpolator.interpolate(url);

    // then
    expect(interpolatedUrl).toBe('https://sample.com/main?ts=1234567890123')
  })

  test("URL에 origin 과 query string 을 조합해서 interpolation 한다.", async () => {
    // given
    interpolator.destroy();
    interpolator.initInterpolator(() => Promise.resolve({
      domain: "jobs",
      page: "main",
      ts: getTimestamp()
    }))

    // when
    const url = "https://sample.{domain}.com/{page}{?ts}";
    const interpolatedUrl = await interpolator.interpolate(url);

    // given
    expect(interpolatedUrl).toBe('https://sample.jobs.com/main?ts=1234567890123')
  })

  test("URL에 plugin 을 사용해서 interpolation 한다.", async () => {
    // given
    interpolator.destroy();
    interpolator.initInterpolator(targetMap)

    // when
    const url = "https://sample.com/{asyncValue}{?ts}";
    const interpolatedUrl = await interpolator.interpolate(url);

    // given
    expect(interpolatedUrl).toBe('https://sample.com/trail-a-blaze?ts=1234567890123')
  })
})
