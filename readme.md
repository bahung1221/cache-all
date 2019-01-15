# cache-all
:rocket: Fast, efficient cache engines for expressJS & native nodeJS (redis, in-memory & file caching,...),
singleton pattern make your application run smoothly like a boss.

- Multi cache engines, each engine has one singleton instance and independent with other engine.
- Include express middleware, which can be use for cache response on specific routes.
- Init once and then use anywhere for cache anything in your application.

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
Init cache engine once and then you can use it anywhere without re init (singleton),
recommend init when booting your application

Example init in your server.js:
```javascript
const express = require('express')
const cache = require('cache-all')
const app = express()

// ...
cache.init({
  engine: 'memory',
  expireIn: 60,
})
// ...

app.listen(...)
```

### Default config:
```javascript
{
    engine: 'memory', // 'memory', 'file', 'redis'
    expireIn: 90,
    file: {
      path: path.join(process.cwd(), 'storage', 'cache') // Storage path for file cache engine
    }
}
```

### Set
Set cache:
```javascript
const cache = require('cache-all')
// or 
const {set} = require('cache-all')

cache
  .set('foo', 'bar')
  .then(result => console.log(result))
```

Set cache with specific expire time (second):
```javascript
const cache = require('cache-all')
// or 
const {set} = require('cache-all')

cache
  .set('foo', 'bar', 90)
  .then(result => console.log(result)) // {status: 1}
```

### Get
Get cache (if key doesn't exist, null will be return withou exception):
```javascript
const cache = require('cache-all')
// or 
const {get} = require('cache-all')

cache
  .get('foo')
  .then(result => console.log(result)) // 'bar'
```

### Has
Check if given key exist:
```javascript
const cache = require('cache-all')
// or 
const {has} = require('cache-all')

cache
  .has('foo')
  .then(result => console.log(result)) // true
```

### Remove
Remove given cache key:
```javascript
const cache = require('cache-all')
// or 
const {remove} = require('cache-all')

cache
  .remove('foo')
  .then(result => console.log(result)) // {status: 1}
```

### Cache on express route
This package provide a middleware which will cache your response data
base on request fullpath and request method

```javascript
const express = require('express')
const router = express.Router()
const cache = require('cache-all')
// or 
const {middleware} = require('cache-all')

router.get('/foo', cache.middleware(60), function(req, res, next) {
  res.json({foo: 'bar'})
})
// First time request '/foo' will cache response data before send back to client
// Next time requests '/foo' will be response cached data
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
Redis & mongo cache engines

## Contributes
You are welcome
