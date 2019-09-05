const Fs = require('fs-extra')
const sanitize = require('sanitize-filename')
const Path = require('path')
const Noop = function() {}

/**
 * FileStore constructor
 * @param {Object} options
 * @param {String} options.path
 * @api public
 */
function FileStore(options) {
  let self = this
  self.path = options.path

  if (!Fs.existsSync(self.path)) Fs.mkdirSync(self.path)

  let cacheFiles = Fs.readdirSync(self.path)
  self.cache = {}
  cacheFiles.forEach(function(file) {
    file = file.replace('.json', '')

    self.cache[file] = true
  })
}

/**
 * Get entry
 * @param {String} key
 * @param {Function} fn
 * @api public
 */
FileStore.prototype.get = function get(key, fn) {
  key = sanitize(key)

  let self = this,
    val = null,
    data = null,
    cacheFile = Path.join(self.path, key + '.json')

  fn = fn || Noop

  if (Fs.existsSync(cacheFile)) {
    data = Fs.readFileSync(cacheFile)
    data = JSON.parse(data)
  } else {
    return fn(null, null)
  }

  if (!this.cache[key]) {
    return fn(null, null)
  }

  if (!data) return fn(null, data)
  if (data.expire < Date.now()) {
    this.del(key)
    return fn(null, null)
  }

  try {
    val = JSON.parse(data.value)
  } catch (e) {
    return fn(e)
  }

  process.nextTick(function tick() {
    fn(null, val)
  })
}

/**
 * Set an entry.
 * @param {String} key
 * @param {Mixed} val
 * @param {Number} ttl
 * @param {Function} fn
 * @api public
 */
FileStore.prototype.set = function set(key, val, ttl, fn) {
  let data, self = this

  if (typeof val === 'undefined' || null) return fn(new Error('val not set'))
  if (typeof ttl === 'function') fn = ttl
  fn = fn || Noop
  ttl = ttl * 1000 || 60 * 1000

  try {
    data = {
      value: JSON.stringify(val),
      expire: JSON.stringify(Date.now() + ttl)
    }
  } catch (e) {
    return fn(e)
  }

  key = sanitize(key)
  let cacheFile = Path.join(self.path, key + '.json')

  Fs.writeFileSync(cacheFile, JSON.stringify(data, null, 4))

  process.nextTick(function tick() {
    self.cache[key] = data.expire
    fn(null, val)
  })
}

/**
 * Delete an entry.
 * @param {String} key
 * @param {Function} fn
 * @api public
 */
FileStore.prototype.remove = function remove(key, fn) {
  key = sanitize(key)
  let self = this,
    cacheFile = Path.join(self.path, key + '.json')

  fn = fn || Noop

  if (!Fs.existsSync(cacheFile)) {
    self.cache[key] = null
    return fn()
  }

  try {
    Fs.removeSync(cacheFile)
  } catch (e) {
    return fn(e)
  }

  process.nextTick(function tick() {
    self.cache[key] = null

    fn(null)
  })
}

/**
 * Clear all cached files
 * @param {String} key
 * @param {Function} fn
 * @api public
 */
FileStore.prototype.clear = function clear(fn) {
  let self = this

  fn = fn || Noop

  try {
    Fs.removeSync(self.path)
    Fs.mkdirSync(self.path)
  } catch (e) {
    return fn(e)
  }

  process.nextTick(function tick() {
    self.cache = {}
    fn(null)
  })
}

/**
 * Get all cached entries
 * @param {Function} fn
 */
FileStore.prototype.getAll = function (fn) {
  let self = this,
    entries = [], cache = self.cache

  Object.keys(cache).forEach(function (entry) {
    self.get(entry, function (err, result) {
      if (err) return fn(err)

      entries.push(result)
    })
  })

  process.nextTick(function () {
    fn(null, entries)
  })
}

/**
 * Remove all cached entries that match the pattern
 *
 * @param {String} pattern
 * @param {Function} fn
 */
FileStore.prototype.removeByPattern = function removeByPattern(pattern, fn) {
  let self = this,
    storagePath = self.path,
    clearedKeys = []

  fn = fn || Noop

  try {
    let files = Fs.readdirSync(storagePath)

    files.forEach(file => {
      if (file.match(pattern)) {
        Fs.removeSync(Path.join(storagePath, file))
        clearedKeys.push(file.split('.json')[0])
      }
    })
  } catch (e) {
    return fn(e)
  }

  process.nextTick(function tick() {
    clearedKeys.forEach(key => {
      self.cache[key] = null
    })

    fn(null)
  })
}

module.exports = FileStore
