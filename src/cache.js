const path = require('path')
const crypto = require('crypto')
const FileStore = require('./core/file')
const MemoryStore = require('./core/memory')
const RedisStore = require('./core/redis')

/**
 * Function to create singleton cache instance and functions of it (wrapper)
 *
 * @return {{
 *    init: init,
 *    set: set,
 *    get: get,
 *    has: has,
 *    remove: remove
 *    removeByPattern: removeByPattern
 *    clear: clear
 *    middleware: middleware
 * }}
 */
const cache = function (engine) {
  /**
   * Cache singleton instance
   * @type {subject}
   */
  let instance = null

  /**
   * Default config of file cache module
   *
   * @type {object}
   */
  const baseConfig = {
    isEnable: true,
    ttl: 90,
    file: {
      path: path.join(process.cwd(), 'storage', 'cache'),
    },
    redis: {
      port: 6379,
      host: '127.0.0.1',
    },
  }
  /**
   * Init cache engine
   *
   * @param {object} config
   */
  async function init(config) {
    config = Object.assign({}, baseConfig, config)

    // If cache was disable (development purpose, etc...)
    if (!config.isEnable) return

    // NOTE: cheat for sync expireIn with ttl
    // expireIn was deprecate from v2.0.0, use ttl instead
    if (config.expireIn) config.ttl = config.expireIn

    switch (engine) {
      case 'file':
        instance = new FileStore(config.file)
        break
      case 'memory':
        instance = new MemoryStore({ ttl: config.ttl })
        break
      case 'redis':
        instance = new RedisStore(config.redis)
        break
    }

    await new Promise((resolve, reject) => {
      instance.init(error => {
        if (error) return reject(error)

        resolve()
      })
    })
    instance.config = config
  }

  /**
   * Set new cache
   *
   * @param key
   * @param value
   * @param {number} time
   * @return {Promise<Object>}
   */
  async function set(key, value, time) {
    // Check cache module instance was init yet
    if (!instance) {
      return { status: 0 }
    }

    return new Promise((resolve, reject) => {
      instance.set(key, value, time || instance.config.ttl, function (error) {
        if (error) return reject(error)

        resolve({ status: 1 })
      })
    })
  }

  /**
   * Get specific cached data
   *
   * @param key
   * @return {Promise<*>}
   */
  async function get(key) {
    // Check cache module instance was init yet
    if (!instance) {
      return null
    }

    return new Promise((resolve, reject) => {
      instance.get(key, function (error, value) {
        if (error) return reject(error)

        resolve(value)
      })
    })
  }

  /**
   * Get all cached data
   *
   * @return {Promise<*>}
   */
  async function getAll() {
    // Check cache module instance was init yet
    if (!instance) {
      return null
    }

    return new Promise((resolve, reject) => {
      instance.getAll(function (error, value) {
        if (error) return reject(error)

        resolve(value)
      })
    })
  }

  /**
   * Check whenever specific key was cached
   *
   * @param key
   * @return {Promise<boolean>}
   * @deprecated
   */
  async function has(key) {
    // Check cache module instance was init yet
    if (!instance) {
      return false
    }

    return new Promise((resolve, reject) => {
      instance.get(key, function (error, value) {
        if (error) return reject(error)

        resolve(!!value)
      })
    })
  }

  /**
   * Remove specific keys
   *
   * @param key
   * @return {Promise<Object>}
   */
  async function remove(key) {
    // Check cache module instance was init yet
    if (!instance) {
      return { status: 0 }
    }

    return new Promise((resolve, reject) => {
      instance.remove(key, function (err) {
        if (err) return reject(err)

        resolve({ status: 1 })
      })
    })
  }

  /**
   * Remove all keys that match the pattern
   *
   * @param pattern
   * @return {Promise<object>}
   */
  async function removeByPattern(pattern) {
    if (!instance) {
      return { status: 0 }
    }

    return new Promise((resolve, reject) => {
      instance.removeByPattern(pattern, function (err) {
        if (err) return reject(err)

        resolve({ status: 1 })
      })
    })
  }

  /**
   * Clear all cached data
   *
   * @return {Promise<object>}
   */
  async function clear() {
    // Check cache module instance was init yet
    if (!instance) {
      return { status: 0 }
    }

    return new Promise((resolve, reject) => {
      instance.clear(function (err) {
        if (err) return reject(err)

        resolve({ status: 1 })
      })
    })
  }

  /**
   * Middleware for caching response
   * Use on express route
   *
   * @param time
   * @param prefix
   * @return {function}
   */
  function middleware(time, prefix = null) {
    return async function (req, res, next) {
      let key = _routeFingerprint(req.originalUrl, req.method)
      if (prefix) {
        key = prefix + '_' + key
      }

      // If data of current request was cached, response it
      let cached = await get(key)
      if (cached) {
        return res.send(cached)
      }

      // Flag to determine whenever data was cached
      let isCached = false
      // Get response data and set cache before response to client (json)
      res.sendJsonResponse = res.json
      res.json = async function (data) {
        if (!isCached) {
          await set(key, data, time || instance.config.ttl)
          isCached = true
        }
        res.sendJsonResponse(data)
      }

      // Get response data and set cache before response to client (plain text)
      res.sendPlainTextResponse = res.send
      res.send = async function (data) {
        if (!isCached) {
          await set(key, data, time || instance.config.ttl)
          isCached = true
        }
        res.sendPlainTextResponse(data)
      }
      next()
    }
  }

  /**
   * Get fingerprint of current request
   * Use request full route (include query string) and request method
   * For unique key each different request
   *
   * @param reqUrl
   * @param reqMethod
   * @return {string}
   * @private
   */
  function _routeFingerprint(reqUrl, reqMethod) {
    let fingerprint = reqMethod + '|' + reqUrl
    return crypto
      .createHash('md5')
      .update(fingerprint)
      .digest('hex')
  }

  return {
    init,
    set,
    get,
    getAll,
    has,
    remove,
    removeByPattern,
    clear,
    middleware,
  }
}

module.exports = cache
