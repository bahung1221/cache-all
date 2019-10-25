const redis = require('redis')
const assert = require('assert')
const redisCache = require('../redis')

describe('Redis Cache Module', function() {
  describe('#init()', function() {
    it('should have main methods', function () {
      assert.ok(redisCache.set)
      assert.ok(redisCache.get)
      assert.ok(redisCache.has)
      assert.ok(redisCache.remove)
      assert.ok(redisCache.removeByPattern)
      assert.ok(redisCache.clear)
      assert.ok(redisCache.middleware)
    })

    it('should return status 0 if cache module wasn\'t init before', async function () {
      let rs = await redisCache.set('key', { foo: 'bar' })
      if (rs.status === 0) {
        return Promise.resolve('OK')
      }
      return Promise.reject('response status not equal 0')
    })

    it('should return status 0 if cache module wasn\'t enable', async function () {
      redisCache.init({
        isEnable: false,
      })

      let rs = await redisCache.set('key', { foo: 'bar' })
      if (rs.status === 0) {
        return Promise.resolve('OK')
      }
      return Promise.reject('response status not equal 0')
    })

    it('should init successful use default config', async function() {
      redisCache.init()

      try {
        let rs = await redisCache.set('key', { foo: 'bar' })
        if (rs.status === 1) {
          return Promise.resolve('OK')
        }
        return Promise.reject('response status not equal 1')
      } catch (e) {
        Promise.reject('Init default fail')
      }
    })

    it('should init successful use redis engine', async function() {
      redisCache.init({
        engine: 'redis',
        ttl: 90,
        redis: {
          port: 6379,
          host: '127.0.0.1',
        },
      })

      try {
        await redisCache.get('key')
        return Promise.resolve('Done')
      } catch (e) {
        Promise.reject('Init cache memory module fail')
      }
    })

    it('should init successful with empty prefix', async function() {
      const options = {
        engine: 'redis',
        ttl: 90,
        redis: {
          port: 6379,
          host: '127.0.0.1',
          prefix: '',
        },
      }
      const redisClient = redis.createClient(options.redis.port, options.redis.host)

      redisCache.init(options)
      try {
        await redisCache.set('prefixKey', 'prefixValue')
        return new Promise((resolve, reject) => {
          redisClient.get('prefixKey', (err, data) => {
            if (err || !data) return reject('Init cache redis module with empty prefix fail')

            resolve('Done')
          })
        })
      } catch (e) {
        Promise.reject('Init cache memory module fail')
      }
    })

    it('should init successful with custom prefix', async function() {
      const options = {
        engine: 'redis',
        ttl: 90,
        redis: {
          port: 6379,
          host: '127.0.0.1',
          prefix: 'custom:'
        },
      }
      const redisClient = redis.createClient(options.redis.port, options.redis.host)

      redisCache.init(options)
      try {
        await redisCache.set('prefixKey', 'prefixValue')
        return new Promise((resolve, reject) => {
          redisClient.get('custom:prefixKey', (err, data) => {
            if (err || !data) return reject('Init cache redis module with custom prefix fail')

            resolve('Done')
          })
        })
      } catch (e) {
        Promise.reject('Init cache memory module fail')
      }
    })

    it('should init successful with default prefix', async function() {
      const options = {
        engine: 'redis',
        ttl: 90,
        redis: {
          port: 6379,
          host: '127.0.0.1',
        },
      }
      const redisClient = redis.createClient(options.redis.port, options.redis.host)

      redisCache.init(options)
      try {
        await redisCache.set('prefixKey', 'prefixValue')
        return new Promise((resolve, reject) => {
          redisClient.get('cacheall:prefixKey', (err, data) => {
            if (err || !data) return reject('Init cache redis module with empty prefix fail')

            resolve('Done')
          })
        })
      } catch (e) {
        Promise.reject('Init cache memory module fail')
      }
    })
  })

  describe('#set', function() {
    it('should return status 1 when set string data cache successful', async function() {
      let rs = await redisCache.set('foo', 'bar')
      if (rs.status === 1) {
        return Promise.resolve('OK')
      }
      return Promise.reject('response status not equal 1')
    })

    it('should return status 1 when set object data cache successful', async function() {
      let rs = await redisCache.set('foo1', { bar: 'baz' })
      if (rs.status === 1) {
        return Promise.resolve('OK')
      }
      return Promise.reject('response status not equal 1')
    })
  })

  describe('#get', function() {
    it('should return "bar" when get key "foo" successful', async function() {
      let rs = await redisCache.get('foo')
      assert.equal(rs, 'bar', 'response not equal "bar"')
    })

    it('should return "{bar: \'baz\'}" when get key "foo1" successful', async function() {
      let rs = await redisCache.get('foo1')
      assert.deepEqual(rs, { bar: 'baz' }, 'response not equal "{bar: \'baz\'}"')
    })
  })

  describe('#getAll', function() {
    it('should return array length  == 4 when getAll', async function() {
      let rs = await redisCache.getAll()
      if (rs.length === 4) {
        return Promise.resolve('OK')
      }
      return Promise.reject('Length is incorrect, result length is: ' + rs.length)
    })
  })

  describe('#has', function() {
    it('should return true when check key "foo"', async function() {
      let rs = await redisCache.has('foo')
      assert.equal(rs, true, 'response not equal true')
    })

    it('should return true when check key "foo1"', async function() {
      let rs = await redisCache.has('foo1')
      assert.equal(rs, true, 'response not equal true')
    })
  })

  describe('#remove', function() {
    it('should return status 1 when remove "foo" key', async function () {
      let rs = await redisCache.remove('foo', 'bar')
      if (rs.status === 1) {
        return Promise.resolve('OK')
      }
      return Promise.reject('response status not equal 1')
    })
  })

  describe('#removeByPattern', function() {
    it('should be empty when get cache after remove all by pattern', async function () {
      await redisCache.set('other_foo', 'bar')
      await redisCache.set('pattern_foo', 'bar')
      await redisCache.set('pattern_foo2', 'bar')
      await redisCache.set('pattern_foo3', 'bar')

      await redisCache.removeByPattern(/pattern/g)
      if (
        await redisCache.get('pattern_foo') ||
        await redisCache.get('pattern_foo2') ||
        await redisCache.get('pattern_foo3')
      ) {
        return Promise.reject('It still has cache after remove')
      }

      if (!await redisCache.get('other_foo')) {
        return Promise.reject('It removed incorrect key')
      }

      return Promise.resolve('OK')
    })
  })

  describe('#clear', function() {
    it('should return status 1 when clear all cache', async function () {
      let rs = await redisCache.clear()
      if (rs.status === 1) {
        return Promise.resolve('OK')
      }
      return Promise.reject('response status not equal 1')
    })
  })
})
