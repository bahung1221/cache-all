'use strict'

const Fs = require('fs-extra')
const sanitize = require('sanitize-filename')
const path = require('path')
const noop = () => {}

module.exports = class FileStore {
  /**
   * FileStore constructor.
   *
   * @param {Object} options
   * @api public
   */
  constructor(options) {
    let self = this
    self.path = options.path

    if (!Fs.existsSync(self.path)) {
      Fs.ensureDirSync(self.path)
    }

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
  get(key, fn = noop) {
    key = sanitize(key)

    let val = null,
      data = null,
      cacheFile = path.join(this.path, key + '.json')

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
      this.remove(key)
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
  set(key, val, ttl, fn = noop) {
    if (val === undefined || val === null) {
      return fn(new Error('val not set'))
    }
    ttl = ttl * 1000
    key = sanitize(key)

    let data
    try {
      data = {
        value: JSON.stringify(val),
        expire: JSON.stringify(Date.now() + ttl)
      }
    } catch (e) {
      return fn(e)
    }

    let cacheFile = path.join(this.path, key + '.json')
    Fs.writeFileSync(cacheFile, JSON.stringify(data, null, 4))

    process.nextTick(() => {
      this.cache[key] = true
      fn(null, val)
    })
  }

  /**
   * Delete an entry.
   * @param {String} key
   * @param {Function} fn
   * @api public
   */
  remove(key, fn = noop) {
    key = sanitize(key)
    let cacheFile = path.join(this.path, key + '.json')

    if (!Fs.existsSync(cacheFile)) {
      delete this.cache[key]
      return fn()
    }

    try {
      Fs.removeSync(cacheFile)
    } catch (e) {
      return fn(e)
    }

    process.nextTick(() => {
      delete this.cache[key]

      fn(null)
    })
  }

  /**
   * Clear all cached files
   * @param {String} key
   * @param {Function} fn
   * @api public
   */
  clear(fn = noop) {
    try {
      Fs.removeSync(this.path)
      Fs.mkdirSync(this.path)
    } catch (e) {
      return fn(e)
    }

    process.nextTick(() => {
      this.cache = {}
      fn(null)
    })
  }

  /**
   * Get all cached entries
   * @param {Function} fn
   */
  getAll (fn = noop) {
    let self = this,
      entries = [],
      cache = self.cache

    Object.keys(cache).forEach(function (entry) {
      self.get(entry, function (err, data) {
        if (err) return fn(err)

        entries.push({ key: entry, value: data })
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
  removeByPattern(pattern, fn = noop) {
    let self = this,
      storagePath = self.path,
      clearedKeys = []

    try {
      let files = Fs.readdirSync(storagePath)

      files.forEach(file => {
        if (file.match(pattern)) {
          Fs.removeSync(path.join(storagePath, file))
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
}
