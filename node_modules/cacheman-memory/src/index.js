'use strict'

/**
 * Module dependencies.
 */

const lru = require('lru-cache')

/**
 * Module constants.
 */

const noop = () => {}

module.exports = class MemoryStore {

  /**
   * MemoryStore constructor.
   *
   * @param {Object} options
   * @api public
   */

  constructor(options = {}) {
    this.client = lru(options.count || 100)
  }

  /**
   * Get an entry.
   *
   * @param {String} key
   * @param {Function} fn
   * @api public
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
   * @api public
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
   * @api public
   */

  del(key, fn = noop) {
    this.set(key, null, -1, fn)
  }

  /**
   * Clear all entries for this bucket.
   *
   * @param {Function} fn
   * @api public
   */

  clear(fn = noop) {
    this.client.reset()
    setImmediate(fn)
  }

  /**
   * Get all entries in cache.
   *
   * @param {Function} fn
   * @api public
   */

  getAll(fn = noop) {
    const entries = []
    const keys = this.client.keys()

    this.client.forEach((value, key, cache) => {
      entries.push({ key: key, data: JSON.parse(value.value) })
    })

    fn(null, entries)
  }
}
