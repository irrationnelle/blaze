import Loki from 'lokijs'

const db = new Loki('test.db');
const urls = db.addCollection('urls');

export function insert(url: {key: string; value: string;}) {
    urls.insert(url)
}

export function findAll() {
   return urls.find();
}

export function removeAll() {
    urls.clear();
}

