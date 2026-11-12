const express = require('express')
const app = express()

const { PORT } = require('./util/config')
const { connectToDatabase } = require('./util/db')

const blogsRouter = require('./controllers/blogs')
const usersRouter = require('./controllers/users')
const loginRouter = require('./controllers/login')
const authorsRouter = require('./controllers/authors')
const resetRouter = require('./controllers/testing')
const readingListsRouter = require('./controllers/readingLists')
const logoutRouter = require('./controllers/logout')

app.use(express.json())

app.get('/', (req, res) => {
  res.status(200).send('OK')
})

app.use('/api/blogs', blogsRouter)
app.use('/api/users', usersRouter)
app.use('/api/login', loginRouter)
app.use('/api/authors', authorsRouter)
app.use('/api/readinglists', readingListsRouter)
app.use('/api/logout', logoutRouter)
if (process.env.TESTING === 'true') {
  app.use('/api/reset', resetRouter)
}

const errorHandler = (error, req, res, next) => {
  console.error(error.message)

  if (error.name === 'SequelizeValidationError') {
    return res.status(400).json({
      error: error.message
    })
  }

  if (error.name === 'SequelizeUniqueConstraintError') {
    return res.status(400).json({
      error: error.message
    })
  }

  next(error)
}

app.use(errorHandler)

const start = async () => {
  await connectToDatabase()
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })
}

start()