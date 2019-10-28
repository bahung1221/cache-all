const assert = require('assert')
const memoryCache = require('../memory')

afterEach(async function() {
  // Cleanup
  await memoryCache.clear()
  return Promise.resolve()
})

describe('In-memory Cache Module', function() {
  describe('#init()', function() {
    it('should have main methods', function () {
      assert.ok(memoryCache.set)
      assert.ok(memoryCache.get)
      assert.ok(memoryCache.has)
      assert.ok(memoryCache.remove)
      assert.ok(memoryCache.removeByPattern)
      assert.ok(memoryCache.clear)
      assert.ok(memoryCache.middleware)
    })

    it('should return status 0 if cache module wasn\'t init before', async function () {
      let rs = await memoryCache.set('key', { foo: 'bar' })
      if (rs.status === 0) {
        return Promise.resolve('OK')
      }
      return Promise.reject('response status not equal 0')
    })

    it('should return status 0 if cache module wasn\'t enable', async function () {
      await memoryCache.init({
        isEnable: false,
      })

      let rs = await memoryCache.get('key')
      if (rs === null) {
        return Promise.resolve('OK')
      }
      return Promise.reject('response status not equal 0')
    })

    it('should init successful use default config', async function() {
      await memoryCache.init()

      try {
        let rs = await memoryCache.set('key', { foo: 'bar' })
        if (rs.status === 1) {
          return Promise.resolve('OK')
        }
        return Promise.reject('response status not equal 1')
      } catch (e) {
        Promise.reject('Init default fail')
      }
    })

    it('should init successful use in-memory engine', async function() {
      await memoryCache.init({
        ttl: 60,
      })

      try {
        let rs = await memoryCache.set('key', { foo: 'bar' })
        if (rs.status === 1) {
          return Promise.resolve('OK')
        }
        return Promise.reject('response status not equal 1')
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
      let rs = await memoryCache.set('foo1', { bar: 'baz' })
      if (rs.status === 1) {
        return Promise.resolve('OK')
      }
      return Promise.reject('response status not equal 1')
    })
  })

  describe('#get', function() {
    it('should return "bar" when get key "foo" successful', async function() {
      await memoryCache.set('foo', 'bar')
      let rs = await memoryCache.get('foo')
      assert.equal(rs, 'bar', 'response not equal "bar"')
    })

    it('should return "{bar: \'baz\'}" when get key "foo" successful', async function() {
      await memoryCache.set('foo', { bar: 'baz' })
      let rs = await memoryCache.get('foo')
      assert.deepEqual(rs, { bar: 'baz' }, 'response not equal "{bar: \'baz\'}"')
    })
  })

  describe('#getAll', function() {
    it('should return array length  == 2 when getAll', async function() {
      await memoryCache.set('foo', 'bar')
      await memoryCache.set('foo1', 'baz')

      let rs = await memoryCache.getAll()
      if (rs.length === 2) {
        return Promise.resolve('OK')
      }
      return Promise.reject('Length is incorrect, result length is: ' + rs.length)
    })
  })

  describe('#has', function() {
    it('should return true when check key "foo"', async function() {
      await memoryCache.set('foo', 'bar')

      let rs = await memoryCache.has('foo')
      assert.equal(rs, true, 'response not equal true')
    })
  })

  describe('#remove', function() {
    it('should return status 1 when remove "foo" key', async function () {
      let rs = await memoryCache.remove('foo', 'bar')
      if (rs.status === 1) {
        return Promise.resolve('OK')
      }
      return Promise.reject('response status not equal 1')
    })
  })

  describe('#removeByPattern', function() {
    it('should be empty when get cache after remove all by pattern', async function () {
      await memoryCache.set('other_foo', 'bar')
      await memoryCache.set('pattern_foo', 'bar')
      await memoryCache.set('pattern_foo2', 'bar')
      await memoryCache.set('pattern_foo3', 'bar')

      await memoryCache.removeByPattern(/pattern/g)
      if (
        await memoryCache.get('pattern_foo') ||
        await memoryCache.get('pattern_foo2') ||
        await memoryCache.get('pattern_foo3')
      ) {
        return Promise.reject('It still has cache after remove')
      }

      if (!await memoryCache.get('other_foo')) {
        return Promise.reject('It removed incorrect key')
      }

      return Promise.resolve('OK')
    })
  })

  describe('#clear', function() {
    it('should return status 1 when clear all cache', async function () {
      let rs = await memoryCache.clear()
      if (rs.status === 1) {
        return Promise.resolve('OK')
      }
      return Promise.reject('response status not equal 1')
    })
  })
})
