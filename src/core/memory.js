'use strict'

const lru = require('lru-cache')
const noop = () => {}

module.exports = class MemoryStore {
  /**
   * MemoryStore constructor.
   *
   * @param {Object} options
   * @api public
   */
  constructor(options = {}) {
    this.client = new lru(options.ttl || 100)
  }

  /**
   * Get an entry.
   *
   * @param {String} key
   * @param {Function} fn
   * @public
   */
  get(key, fn = noop) {
    let val, data = this.client.get(key)
    if (!data) return fn(null, data)
    if (data.expire !== -1 && data.expire < Date.now()) {
      this.client.del(key)
      return setImmediate(fn)
    }
    try {
      val = JSON.parse(data.value)
    } catch (e) {
      return setImmediate(fn.bind(null, e))
    }

    setImmediate(fn.bind(null, null, val))
  }

  /**
   * Set an entry.
   *
   * @param {String} key
   * @param {Mixed} val
   * @param {Number} ttl
   * @param {Function} fn
   */
  set(key, val, ttl, fn = noop) {
    let data
    if (typeof ttl === 'function') {
      fn = ttl
      ttl = null
    }

    if (typeof val === 'undefined') return fn()

    const expire = -1 === ttl
        ? -1
        : Date.now() + (ttl || 60) * 1000

    try {
      data = {
        value: JSON.stringify(val),
        expire
      }
    } catch (e) {
      return setImmediate(fn.bind(null, e))
    }

    this.client.set(key, data)

    setImmediate(fn.bind(null, null, val))
  }

  /**
   * Delete an entry.
   *
   * @param {String} key
   * @param {Function} fn
   * @public
   */
  remove(key, fn = noop) {
    this.set(key, null, -1, fn)
  }

  /**
   * Clear all entries for this bucket.
   *
   * @param {Function} fn
   * @public
   */
  clear(fn = noop) {
    this.client.reset()
    setImmediate(fn)
  }

  /**
   * Get all entries in cache.
   *
   * @param {Function} fn
   * @public
   */
  getAll(fn = noop) {
    const entries = []
    const keys = this.client.keys()

    this.client.forEach((value, key, cache) => {
      entries.push({ key: key, data: JSON.parse(value.value) })
    })

    fn(null, entries)
  }

  /**
   * Remove all cached entries that match the pattern
   *
   * @param {String} pattern
   * @param {Function} fn
   */
  removeByPattern(pattern, fn = noop) {
    let total = this.client.itemCount,
      count = 0

    this.client.forEach((value, key) => {
      if (key.match(pattern)) {
        this.remove(key, (e) => {
          if (e) return fn(e)
        })
      }

      if (++count === total) {
        fn(null)
      }
    })
  }
}
