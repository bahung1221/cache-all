[![npm version](https://badge.fury.io/js/cache-all.svg)](https://www.npmjs.com/package/cache-all)
[![Dependency Status](https://david-dm.org/bahung1221/cache-all.svg)](https://david-dm.org/bahung1221/cache-all)
[![Build Status](https://travis-ci.com/bahung1221/cache-all.svg?branch=master)](https://travis-ci.com/bahung1221/cache-all)
[![Coverage Status](https://coveralls.io/repos/github/bahung1221/cache-all/badge.svg?branch=master)](https://coveralls.io/github/bahung1221/cache-all?branch=master)

[![NPM info](https://nodei.co/npm/cache-all.png?downloads=true)](https://nodei.co/npm/cache-all.png?downloads=true)

# cache-all
:rocket: Fast, efficient cache engines for expressJS & native nodeJS (redis, in-memory & file caching),
singleton pattern make your application run smoothly like a boss.

- Multi cache engines, each engine has one singleton instance and independent with other engine.
- Include express middleware, which can be use for cache response on specific routes.
- Init once and then use anywhere for caching anything in your application.
- ES6 Promise.

## Install
```
npm install --save cache-all
```
or
```
yarn add cache-all
```

## Usages (single cache engine):
### Init
Init cache engine once and then you can use it anywhere,
recommend init when booting your application

Example init in your server.js:
```javascript
const express = require('express')
const cache = require('cache-all') // default is in-memory engine
// or
const cache = require('cache-all/memory') // explicit in-memory engine
// or
const cache = require('cache-all/file') // file engine
// or
const cache = require('cache-all/redis') // redis engine
const app = express()

// ...
cache.init({
  ttl: 90,
})
// ...

app.listen(...)
```

Default config:
Just config for engine that will be use

- in-memory
```javascript
{
  ttl: 90,
  isEnable: true, // Flag for enable/disable cache, useful for development
}
```

- file
```javascript
{
  ttl: 90,
  isEnable: true,
  file: {
    path: path.join(process.cwd(), 'storage', 'cache') // Storage path for file cache engine
  }
}
```

- redis
```javascript
{
  ttl: 90,
  isEnable: true,
  redis: {
    port: 6379,
    host: '127.0.0.1',
    // password: 'yourpass',
    // database: 0,
  }
}
```

### set(key, value, [expireIn])
Set cache:
```javascript
const cache = require('cache-all')

cache
  .set('foo', 'bar')
  .then(result => console.log(result))
```

Set cache with specific expire time (second):
```javascript
const cache = require('cache-all')

cache
  .set('foo', 'bar', 90)
  .then(result => console.log(result)) // {status: 1}
```

### get(key)
Get cache (if key doesn't exist, null will be return):
```javascript
const cache = require('cache-all')

cache
  .get('foo')
  .then(result => console.log(result)) // 'bar'
```

### getAll()
Get all cached entries as array:
```javascript
const cache = require('cache-all')

cache
  .getAll()
  .then(result => console.log(result)) // [ { key: 'foo', value: 'bar'},... ]
```

### has(key)
**Deprecated**: should use `cache.get` and then check returned value instead use this function because costs of these functions is same.

Check if given key exist:
```javascript
const cache = require('cache-all')

cache
  .has('foo')
  .then(result => console.log(result)) // true
```

### remove(key)
Remove given cache key:
```javascript
const cache = require('cache-all')

cache
  .remove('foo')
  .then(result => console.log(result)) // {status: 1}
```

### removeByPattern(pattern)
Remove all cached data base on pattern/text:
```javascript
const cache = require('cache-all')

await cache.set('user_foo', { name: 'foo' })
await cache.set('user_bar', { name: 'bar' })

await cache.removeByPattern('user') // or removeByPattern(/user/)
```

### middleware([expireIn], [prefix]) (Cache on express route)
This package provide a middleware which will cache your response data
base on request fullpath, request method and prefix (optinal).

**NOTE**: using prefix if you want manual clear data that was cached by middleware (using `removeByPattern(prefix)` method)

```javascript
const express = require('express')
const router = express.Router()
const cache = require('cache-all')

router.get('/api/user', cache.middleware(86400, 'user'), function(req, res, next) {
  res.json({foo: 'bar'})
})
// First time request '/foo' will cache response data before send back to client (non-blocking)
// Next time requests '/foo' will be response cached data immediately
```

## Usages (multi engine)
You can use many cache engine together in your application, each engine still has
singleton instance of it, that work independent with other

Just require specific engine you need instead require root
- init
```javascript
const fileCache = require('cache-all/file')
const memoryCache = require('cache-all/memory')

// ...
fileCache.init({
  expireIn: 60,
  file: {
    path: path.join(process.cwd(), 'storage', 'cache')
  }
})
memoryCache.init({
  expireIn: 60,
})
// ...

app.listen(...)
```

- set/get/has/remove/middleware
```javascript
const fileCache = require('cache-all/file')
const memoryCache = require('cache-all/memory')

fileCache
  .set('foo', 'bar', 90)
  .then(result => console.log(result)) // {status: 1}
  
memoryCache
  .set('foo', 'bar', 90)
  .then(result => console.log(result)) // {status: 1}
```

## Test
```
npm run test
```

## TODO
- Mongo cache engines
- Reduce number of dependencies
- Update Code coverage
- Event

## Contributes
You are welcome <3

## Release Note
|Version|Date|Description|
|:--:|:--:|:--|
|1.0.0|2019-01-14|First version, contain basic functions|
|1.1.0|2019-08-19|Add removeByPattern function & update dependencies|
|2.0.0|2019-09-05|Re-structure (DRY) & remove `mkdirp` dependency |
|2.0.1|2019-09-08|Refactor FileStore - use ES6 class instead prototype|
|2.0.2|2019-09-21|Add `getAll` method & integrate travis-ci & code coverage|
