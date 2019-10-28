const assert = require('assert')
const path = require('path')
const fileCache = require('../file')

afterEach(async function() {
  // Cleanup
  await fileCache.clear()
  return Promise.resolve()
})

describe('File Cache Module', function() {
  describe('#init()', function() {
    it('should have main methods', function () {
      assert.ok(fileCache.set)
      assert.ok(fileCache.get)
      assert.ok(fileCache.has)
      assert.ok(fileCache.remove)
      assert.ok(fileCache.removeByPattern)
      assert.ok(fileCache.clear)
      assert.ok(fileCache.middleware)
    })

    it('should return status 0 if cache module wasn\'t init before', async function () {
      let rs = await fileCache.set('key', { foo: 'bar' })
      if (rs.status === 0) {
        return Promise.resolve('OK')
      }
      return Promise.reject('response status not equal 0')
    })

    it('should return status 0 if cache module wasn\'t enable', async function () {
      await fileCache.init({
        isEnable: false,
      })

      let rs = await fileCache.set('key', { foo: 'bar' })
      if (rs.status === 0) {
        return Promise.resolve('OK')
      }
      return Promise.reject('response status not equal 0')
    })

    it('should init successful use default config', async function() {
      await fileCache.init({
        isEnable: true,
      })

      let rs = await fileCache.set('key', { foo: 'bar' })
      if (rs.status === 1) {
        return Promise.resolve('OK')
      }
      return Promise.reject('response status not equal 1')
    })

    it('should init successful use file engine', async function() {
      await fileCache.init({
        engine: 'file',
        ttl: 60,
        file: { path: path.join(__dirname, '../storage/cache') },
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
      let rs = await fileCache.set('foo1', { bar: 'baz' })
      if (rs.status === 1) {
        return Promise.resolve('OK')
      }
      return Promise.reject('response status not equal 1')
    })
  })

  describe('#get', function() {
    it('should return "bar" when get key "foo" successful', async function() {
      await fileCache.set('foo', 'bar')
      let rs = await fileCache.get('foo')
      console.log(rs);

      assert.equal(rs, 'bar', 'response not equal "bar"')
    })

    it('should return "{bar: \'baz\'}" when get key "foo" successful', async function() {
      await fileCache.set('foo', { bar: 'baz' })
      let rs = await fileCache.get('foo')
      assert.deepEqual(rs, { bar: 'baz' }, 'response not equal "{bar: \'baz\'}"')
    })
  })

  describe('#has', function() {
    it('should return true when check key "foo"', async function() {
      await fileCache.set('foo', 'bar')
      let rs = await fileCache.has('foo')
      assert.equal(rs, true, 'response not equal true')
    })
  })

  describe('#getAll', function() {
    it('should return array length  == 2 when getAll', async function() {
      await fileCache.set('foo', 'bar')
      await fileCache.set('foo1', 'baz')

      let rs = await fileCache.getAll()
      if (rs.length === 2) {
        return Promise.resolve('OK')
      }
      return Promise.reject('Length is incorrect, result length is: ' + rs.length)
    })
  })

  describe('#remove', function() {
    it('should return status 1 when remove "foo" key', async function () {
      let rs = await fileCache.remove('foo', 'bar')
      if (rs.status === 1) {
        return Promise.resolve('OK')
      }
      return Promise.reject('response status not equal 1')
    })
  })

  describe('#removeByPattern', function() {
    it('should be empty when get cache after remove all by pattern', async function () {
      await fileCache.set('other_foo', 'bar')
      await fileCache.set('pattern_foo', 'bar')
      await fileCache.set('pattern_foo2', 'bar')
      await fileCache.set('pattern_foo3', 'bar')

      await fileCache.removeByPattern(/pattern/g)
      if (
        await fileCache.get('pattern_foo') ||
        await fileCache.get('pattern_foo2') ||
        await fileCache.get('pattern_foo3')
      ) {
        return Promise.reject('It still has cache after remove')
      }

      if (!await fileCache.get('other_foo')) {
        return Promise.reject('It removed incorrect key')
      }

      return Promise.resolve('OK')
    })
  })

  describe('#clear', function() {
    it('should return status 1 when clear all cache', async function () {
      let rs = await fileCache.clear()
      if (rs.status === 1) {
        return Promise.resolve('OK')
      }
      return Promise.reject('response status not equal 1')
    })
  })
})
