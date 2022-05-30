import {nanoid} from "nanoid";

export function generateUuid(url: string) {
  return nanoid(7);
}

export function getTimestamp() {
  return Date.now().toString(10);
}
