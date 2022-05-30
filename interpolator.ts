import {getTimestamp} from "./helper";

export function interpolator(url: string) {
  return parser(url);
}

function parser(url: string) {
  return replaceLiteral(url, 'ts', getTimestamp())
}

function replaceLiteral(body: string, literal: string, value: string) {
  return body.replace(/\{ts\}/gi, value)
}