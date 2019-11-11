import express from 'express'
import path from 'path'
import cache from 'cache-all/memory'
const app = express()
const port = 3000

cache.init({
  ttl: 90,
  isEnable: true,
  file: {
    path: path.join(__dirname, 'storage', 'cache') // Storage path for file cache engine
  }
})

const users = [
  {
    id: 1,
    name: 'John Doe'
  },
  {
    id: 2,
    name: 'Ba Hung'
  },
]

/**
 * Get all users
 */
app.get('/api/user', cache.middleware(846000, 'user'), async (req, res) => {
  // Simulate large request
  setTimeout(() => {
    res.json(users)
  }, 3000)
})
/**
 * Get all users
 */
// app.get('/api/user', async (req, res) => {
//   await cache.set('user', users, 846000)
//   let cached = await cache.get('user')

//   res.json(cached)
// })

/**
 * Add new user
 */
app.post('/api/user', (req, res) => {
  let id = Math.floor(Math.random() * 100) + 3
  users.push({
    id: id,
    name: 'user_' + id,
  })

  // Clear old data that was cached in middleware
  cache.removeByPattern(/user/).then(() => res.sendStatus(201))
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))
