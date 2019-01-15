const assert = require('assert')
const path = require('path')
const cache = require('../')
const fileCache = require('../file')
const memoryCache = require('../memory')

describe('Cache Proxy', function() {
  describe('#init()', function() {
    it('should have main methods', function () {
      assert.ok(cache.set)
      assert.ok(cache.get)
      assert.ok(cache.has)
      assert.ok(cache.remove)
      assert.ok(cache.middleware)
    })

    it('should throw error if cache module wasn\'t init before', async function () {
      try {
        await cache.set('key', {foo: 'bar'})
        return Promise.reject('it doesn\'t throw error')
      } catch (e) {
        Promise.resolve('OK')
      }
    })

    it('should init successful use default config', async function() {
      cache.init()

      try {
        await cache.get('key')
        return Promise.resolve('OK')
      } catch (e) {
        Promise.reject('Init default fail')
      }
    })
  })

  describe('#set', function() {
    it('should return status 1 when set string data cache successful', async function() {
      let rs = await cache.set('foo', 'bar')
      if (rs.status === 1) {
        return Promise.resolve('OK')
      }
      return Promise.reject('response status not equal 1')
    })

    it('should return status 1 when set object data cache successful', async function() {
      let rs = await cache.set('foo1', {bar: 'baz'})
      if (rs.status === 1) {
        return Promise.resolve('OK')
      }
      return Promise.reject('response status not equal 1')
    })
  })

  describe('#get', function() {
    it('should return "bar" when get key "foo" successful', async function() {
      let rs = await cache.get('foo')
      assert.equal(rs, 'bar', 'response not equal "bar"');
    })

    it('should return "{bar: \'baz\'}" when get key "foo1" successful', async function() {
      let rs = await cache.get('foo1')
      assert.deepEqual(rs, {bar: 'baz'}, 'response not equal "{bar: \'baz\'}"')
    })
  })
})

describe('File Cache Module', function() {
  describe('#init()', function() {
    it('should have main methods', function () {
      assert.ok(fileCache.set)
      assert.ok(fileCache.get)
      assert.ok(fileCache.has)
      assert.ok(fileCache.remove)
      assert.ok(fileCache.middleware)
    })

    it('should throw error if cache module wasn\'t init before', async function () {
      try {
        await fileCache.set('key', {foo: 'bar'})
        return Promise.reject('it doesn\'t throw error')
      } catch (e) {
        Promise.resolve('OK')
      }
    })

    it('should init successful use default config', async function() {
      fileCache.init()

      try {
        await fileCache.get('key')
        return Promise.resolve('OK')
      } catch (e) {
        Promise.reject('Init default fail')
      }
    })

    it('should init successful use file engine', async function() {
      fileCache.init({
        engine: 'file',
        expireIn: 60,
        file: { path: path.join(__dirname, '../src/storage/cache') }
      })

      try {
        await fileCache.get('key')
        return Promise.resolve('OK')
      } catch (e) {
        Promise.reject('Init cache file module fail')
      }
    })
  })

  describe('#set', function() {
    it('should return status 1 when set string data cache successful', async function() {
      let rs = await fileCache.set('foo', 'bar')
      if (rs.status === 1) {
        return Promise.resolve('OK')
      }
      return Promise.reject('response status not equal 1')
    })

    it('should return status 1 when set object data cache successful', async function() {
      let rs = await fileCache.set('foo1', {bar: 'baz'})
      if (rs.status === 1) {
        return Promise.resolve('OK')
      }
      return Promise.reject('response status not equal 1')
    })
  })

  describe('#get', function() {
    it('should return "bar" when get key "foo" successful', async function() {
      let rs = await fileCache.get('foo')
      assert.equal(rs, 'bar', 'response not equal "bar"');
    })

    it('should return "{bar: \'baz\'}" when get key "foo1" successful', async function() {
      let rs = await fileCache.get('foo1')
      assert.deepEqual(rs, {bar: 'baz'}, 'response not equal "{bar: \'baz\'}"')
    })
  })
})


describe('In-memory Cache Module', function() {
  describe('#init()', function() {
    it('should have main methods', function () {
      assert.ok(memoryCache.set)
      assert.ok(memoryCache.get)
      assert.ok(memoryCache.has)
      assert.ok(memoryCache.remove)
      assert.ok(memoryCache.middleware)
    })

    it('should init successful use default config', async function() {
      memoryCache.init()

      try {
        await memoryCache.get('key')
        return Promise.resolve('OK')
      } catch (e) {
        Promise.reject('Init default fail')
      }
    })

    it('should init successful use in-memory engine', async function() {
      memoryCache.init({
        engine: 'memory',
        expireIn: 60,
      })

      try {
        await memoryCache.get('key')
        return Promise.resolve('Done')
      } catch (e) {
        Promise.reject('Init cache memory module fail')
      }
    })
  })

  describe('#set', function() {
    it('should return status 1 when set string data cache successful', async function() {
      let rs = await memoryCache.set('foo', 'bar')
      if (rs.status === 1) {
        return Promise.resolve('OK')
      }
      return Promise.reject('response status not equal 1')
    })

    it('should return status 1 when set object data cache successful', async function() {
      let rs = await memoryCache.set('foo1', {bar: 'baz'})
      if (rs.status === 1) {
        return Promise.resolve('OK')
      }
      return Promise.reject('response status not equal 1')
    })
  })

  describe('#get', function() {
    it('should return "bar" when get key "foo" successful', async function() {
      let rs = await memoryCache.get('foo')
      assert.equal(rs, 'bar', 'response not equal "bar"');
    })

    it('should return "{bar: \'baz\'}" when get key "foo1" successful', async function() {
      let rs = await memoryCache.get('foo1')
      assert.deepEqual(rs, {bar: 'baz'}, 'response not equal "{bar: \'baz\'}"')
    })
  })
})
