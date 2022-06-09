import Loki from 'lokijs'

const db = new Loki('test.db');
const urls = db.addCollection('urls');

export function insert(url: {key: string; value: string;}) {
    urls.insert(url)
}

export function findAll() {
   return urls.find();
}

export function findByKey(key: string) {
  const targetUrl = urls.find({'key': key});
  if(!targetUrl || targetUrl.length < 1) {
    throw new Error('non-existing url');
  }
  return targetUrl[0].value;
}

export function removeAll() {
    urls.clear();
}

