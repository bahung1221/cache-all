const path = require('path')
const mkdirp = require('mkdirp')
const CachemanFile = require('cacheman-file')
const CachemanMemory = require('cacheman-memory')

/**
 * Create instance for specific cache module
 *
 * @param inputConfig
 * @returns {subject}
 */
function getCacheModule(inputConfig) {
  // Assign default config with input config
  let config = Object.assign({
    engine: 'memory',
    expireIn: 90,
    file: {
      path: path.join(process.cwd(), 'storage', 'cache')
    }
  }, inputConfig)

  // Get cache module base on config engine
  switch (config.engine) {
    case 'file':
      return _fileCacheModule(config)
    case 'memory':
      return _memcacheModule(config)
    default:
      return _memcacheModule(config)
  }
}

/**
 * Create instance for file caching module
 *
 * @param config
 * @returns {subject}
 * @private
 */
function _fileCacheModule(config) {
  let cachePath = config.file.path

  // Create file cache directory if it doesn't yet exist
  mkdirp.sync(cachePath)
  let instance = new CachemanFile({ tmpDir: cachePath })
  instance.config = config

  return instance
}

/**
 * Create instance for in-memory caching module
 *
 * @param config
 * @returns {subject}
 * @private
 */
function _memcacheModule(config) {
  let instance = new CachemanMemory()
  instance.config = config

  return instance
}

module.exports = getCacheModule
