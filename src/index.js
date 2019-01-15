const cacheFile = require('./file')
const cacheMemory = require('./memory')

/**
 * Proxy to specific cache instance and functions of it
 *
 * @return {{
 *    set: set,
 *    get: get,
 *    has: has,
 *    remove: remove
 * }}
 */
const cacheProxy = function () {
  /**
   * Cache module (file, redis, mem)
   *
   * @type {object}
   */
  let module = null

  /**
   * Get cache module base on given engine name
   *
   * @param engine
   * @return {subject}
   * @private
   */
  function _getCacheModule(engine) {
    // Get cache module base on config engine
    switch (engine) {
      case 'file':
        return cacheFile
      case 'memory':
        return cacheMemory
      default:
        return cacheMemory
    }
  }
  /**
   * Init cache engine
   *
   * @param {object} config
   * @private
   */
  function init(config = {}) {
    module = _getCacheModule(config.engine)
    module.init()
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
    return await module.set(key, value, time)
  }

  /**
   * Get specific cached data
   *
   * @param key
   * @return {Promise<*>}
   */
  async function get(key) {
    return await module.get(key)
  }

  /**
   * Check whenever specific key was cached
   *
   * @param key
   * @return {Promise<boolean>}
   */
  async function has(key) {
    return await module.has(key)
  }

  /**
   * Remove specific keys
   *
   * @param key
   * @return {Promise<Object>}
   */
  async function remove(key) {
    return await module.remove(key)
  }

  /**
   * Clear all cached data
   *
   * @return {Promise<object>}
   */
  async function clear() {
    return await module.clear()
  }

  /**
   * Middleware for caching response
   * Use on express route
   *
   * @param time
   * @return {function}
   */
  function middleware(time) {
    return module.middleware(time)
  }

  return {
    init,
    set,
    get,
    has,
    remove,
    clear,
    middleware,
  }
}

module.exports = cacheProxy()
