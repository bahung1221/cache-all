const crypto = require('crypto')
const MemoryStore = require('./core/memory')

/**
 * Singleton cache instance and functions of it
 *
 * @return {{
 *    set: set,
 *    get: get,
 *    has: has,
 *    remove: remove
 * }}
 */
const cache = function () {
  /**
   * Cache singleton instance
   * @type {MemoryStore}
   */
  let instance = null

  /**
   * Default config of file cache module
   *
   * @type {object}
   */
  const baseConfig = {
    engine: 'memory',
    isEnable: true,
    expireIn: 90,
  }

  /**
   * Init cache engine
   *
   * @param {object} config
   * @private
   */
  function init(config) {
    // Assign default config with input config
    config = Object.assign(baseConfig, config)

    // If cache was disable (development purpose, etc...)
    if (!config.isEnable) {
      return
    }

    instance = new MemoryStore()
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
      return {status: 0}
    }

    // Promisify because library doesn't support promise
    return new Promise(((resolve, reject) => {
      // Set the value
      instance.set(key, value, time || instance.config.expireIn, function (error) {
        if (error) return reject(error)

        resolve({ status: 1 })
      })
    }))
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

    // Promisify because library doesn't support promise
    return new Promise(((resolve, reject) => {
      instance.get(key, function (error, value) {
        if (error) return reject(error)

        resolve(value)
      })
    }))
  }

  /**
   * Check whenever specific key was cached
   *
   * @param key
   * @return {Promise<boolean>}
   */
  async function has(key) {
    /// Check cache module instance was init yet
    if (!instance) {
      return false
    }

    // Promisify because library doesn't support promise
    return new Promise(((resolve, reject) => {
      instance.get(key, function (error, value) {
        if (error) return reject(error)

        resolve(!value ? false : true)
      })
    }))
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
      return {status: 0}
    }

    // Promisify because library doesn't support promise
    return new Promise(((resolve, reject) => {
      instance.del(key, function (err) {
        if (err) return reject(err)

        resolve({ status: 1 })
      })
    }))
  }

  /**
   * Remove all keys that match the pattern
   *
   * @param pattern
   * @return {Promise<object>}
   */
  async function removeByPattern(pattern) {
    if (!instance) {
      return Promise.resolve({ status: 0 })
    }

    return new Promise((resolve => {
      let total = instance.count(),
        count = 0

      instance.loop(async (value, key) => {
        if (key.match(pattern)) {
          await this.remove(key)
        }

        if (++count === total) {
          resolve({ status: 1 })
        }
      })
    }))
  }

  /**
   * Clear all cached data
   *
   * @return {Promise<object>}
   */
  async function clear() {
    // Check cache module instance was init yet
    if (!instance) {
      return {status: 0}
    }

    // Promisify because library doesn't support promise
    return new Promise(((resolve, reject) => {
      instance.clear(function (err) {
        if (err) return reject(err)

        resolve({ status: 1 })
      })
    }))
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
      if (await has(key)) {
        return res.json(await get(key))
      }

      // Get response data and set cache before response to client
      res.sendJsonResponse = res.json
      res.json = async function (data) {
        await set(key, data, time || instance.config.expireIn)
        res.sendJsonResponse(data)
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

  /**
   * Throw error when cache module was use in incorrect way
   *
   * @param type
   * @private
   */
  function _throwError(type) {
    switch (type) {
      case 'init':
        throw new Error('Cache module must be init first!')
      default:
        throw new Error('Cache module must be init first!')
    }
  }

  return {
    init,
    set,
    get,
    has,
    remove,
    removeByPattern,
    clear,
    middleware,
  }
}

module.exports = cache()
