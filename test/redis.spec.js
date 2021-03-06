const redis = require('redis')
const assert = require('assert')
const redisCache = require('../redis')

const defaultConfig = {
  engine: 'redis',
  ttl: 90,
  redis: {
    port: 6379,
    host: '127.0.0.1',
    database: 3,
    password: 'secret',
  },
}

function startRedisClient(options) {
  const redisClient = redis.createClient(options.redis.port, options.redis.host)
  return new Promise((resolve, reject) => {
    redisClient.auth(options.redis.password, (err) => {
      if (err) return reject(err)

      redisClient.select(options.redis.database, (err) => {
        if (err) return reject(err)

        resolve(redisClient)
      })
    })
  })
}

afterEach(async function() {
  // Cleanup
  await redisCache.clear()
  return Promise.resolve()
})

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
      await redisCache.init({
        isEnable: false,
      })

      let rs = await redisCache.set('key', { foo: 'bar' })
      if (rs.status === 0) {
        return Promise.resolve('OK')
      }
      return Promise.reject('response status not equal 0')
    })

    it('should init successful use default config', async function() {
      const options = JSON.parse(JSON.stringify(defaultConfig))
      await redisCache.init(options)

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

    it('should init successful with empty prefix', async function() {
      const options = JSON.parse(JSON.stringify(defaultConfig))
      const redisClient = await startRedisClient(options)

      options.redis.prefix = ''
      await redisCache.init(options)
      await redisCache.set('prefixKey', 'prefixValue')

      return new Promise((resolve, reject) => {
        redisClient.get('prefixKey', (err, data) => {
          if (err || !data) return reject('Init cache redis module with custom prefix fail')

          resolve('Done')
        })
      })
    })

    it('should init successful with custom prefix', async function() {
      const options = JSON.parse(JSON.stringify(defaultConfig))
      const redisClient = await startRedisClient(options)

      options.redis.prefix = 'custom:'

      await redisCache.init(options)
      await redisCache.set('prefixKey', 'prefixValue')

      return new Promise((resolve, reject) => {
        redisClient.get('custom:prefixKey', (err, data) => {
          if (err || !data) return reject('Init cache redis module with custom prefix fail')

          resolve('Done')
        })
      })
    })

    it('should init successful with default prefix', async function() {
      const options = JSON.parse(JSON.stringify(defaultConfig))
      const redisClient = await startRedisClient(options)

      await redisCache.init(options)
      await redisCache.set('prefixKey', 'prefixValue')

      return new Promise((resolve, reject) => {
        redisClient.get('cacheall:prefixKey', (err, data) => {
          if (err || !data) return reject('Init cache redis module with empty prefix fail')

          resolve('Done')
        })
      })
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
      await redisCache.set('foo', 'bar')

      let rs = await redisCache.get('foo')
      assert.equal(rs, 'bar', 'response not equal "bar"')
    })

    it('should return "{bar: \'baz\'}" when get key "foo" successful', async function() {
      await redisCache.set('foo', { bar: 'baz' })

      let rs = await redisCache.get('foo')
      assert.deepEqual(rs, { bar: 'baz' }, 'response not equal "{bar: \'baz\'}"')
    })
  })

  describe('#getAll', function() {
    it('should return array length == 2 when getAll', async function() {
      await redisCache.set('foo', 'bar')
      await redisCache.set('foo1', 'baz')

      let rs = await redisCache.getAll()
      if (rs.length === 2) {
        return Promise.resolve('OK')
      }
      return Promise.reject('Length is incorrect, result length is: ' + rs.length)
    })
  })

  describe('#has', function() {
    it('should return true when check key "foo"', async function() {
      await redisCache.set('foo', 'bar')

      let rs = await redisCache.has('foo')
      assert.equal(rs, true, 'response not equal true')
    })
  })

  describe('#remove', function() {
    it('should return status 1 when remove "foo" key', async function () {
      await redisCache.set('foo', 'bar')

      let rs = await redisCache.remove('foo')
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
