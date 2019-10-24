/**
 * Module dependencies.
 */
const redis = require('redis')
const noop = () => {}

class RedisStore {
  /**
   * RedisStore constructor.
   *
   * @param {String|Object} options
   * @api public
   */
  constructor(options = {}) {
    const { port, host, client, setex, password, database, prefix } = options

    if (typeof setex === 'function') {
      this.client = options
    } else if (client) {
      this.client = client
    } else if (!port && !host) {
      this.client = redis.createClient()
    } else {
      const opts = Object.assign({}, options, { prefix: null })
      this.client = redis.createClient(port, host, opts)
    }

    if (password) {
      this.client.auth(password, (err) => {
        if (err) throw err
      })
    }

    if (database) {
      this.client.select(database, (err) => {
        if (err) throw err
      })
    }

    const isPrefixEmpty = (prefix === '')

    this.prefix = isPrefixEmpty ? '' : 'cacheall:'
  }

  /**
   * Get an entry.
   *
   * @param {String} key
   * @param {Function} fn
   * @public
   */
  get(key, fn = noop) {
    const k = `${this.prefix}${key}`
    this.client.get(k, (err, data) => {
      if (err) return fn(err)
      if (!data) return fn(null, null)
      data = data.toString()
      try {
        fn(null, JSON.parse(data))
      } catch (e) {
        fn(e)
      }
    })
  }

  /**
   * Set an entry.
   *
   * @param {String} key
   * @param {Mixed} val
   * @param {Number} ttl
   * @param {Function} fn
   * @public
   */
  set(key, val, ttl, fn = noop) {
    const k = `${this.prefix}${key}`

    try {
      val = JSON.stringify(val)
    } catch (e) {
      return fn(e)
    }

    const cb = (err) => {
      if (err) return fn(err)
      fn(null, val)
    }

    if (ttl === -1) {
      this.client.set(k, val, cb)
    } else {
      this.client.setex(k, ttl || 60, val, cb)
    }
  }

  /**
   * Delete an entry (Supported glob-style patterns).
   *
   * @param {String} key
   * @param {Function} fn
   * @public
   */
  remove(key, fn = noop) {
    this.client.del(`${this.prefix}${key}`, fn)
  }

  /**
   * Clear all entries in cache.
   *
   * @param {Function} fn
   * @public
   */
  clear(fn = noop) {
    this.client.keys(`${this.prefix}*`, (err, data) => {
      if (err) return fn(err)
      let count = data.length
      if (count === 0) return fn(null, null)
      data.forEach((key) => {
        this.client.del(key, (err) => {
          if (err) {
            count = 0
            return fn(err)
          }
          if (--count === 0) {
            fn(null, null)
          }
        })
      })
    })
  }

  /**
   * Get all entries in cache.
   *
   * @param {Function} fn
   * @public
   */
  getAll(fn = noop) {
    const entries = []

    this._loop((err, total, key) => {
      if (err) {
        fn(err, null)
      }

      if (total === 0) {
        fn(null, entries)
      }
      this.client.get(key, (err, data) => {
        if (err) return fn(err)
        if (!data) data = null
        data = data.toString()
        try {
          entries.push({ key: key, value: JSON.parse(data) })
          if (entries.length === total) {
            fn(null, entries)
          }
        } catch (e) {
          fn(e)
        }
      })
    })
  }

  /**
   * Remove all cached entries that match the pattern
   *
   * @param {String} pattern
   * @param {Function} fn
   * @public
   */
  removeByPattern(pattern, fn = noop) {
    let count = 0

    this._loop((err, total, key) => {
      if (err) return fn(err)

      if (key.match(pattern)) {
        this.client.del(key)
      }

      if (++count === total) {
        fn(null)
      }
    })
  }

  /**
   * Clear all entries in cache.
   *
   * @param {Function} fn
   * @private
   */
  _loop(fn = noop) {
    this.client.keys(`${this.prefix}*`, (err, keys) => {
      if (err) return fn(err)
      let count = keys.length
      if (count === 0) return

      keys.forEach((key) => fn(null, count, key))
    })
  }
}

module.exports = RedisStore
