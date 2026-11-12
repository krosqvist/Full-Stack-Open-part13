const router = require('express').Router()
const { Blog, User, ReadingList, Session } = require('../models')

router.post('/', async (req, res, next) => {
  try {
    await Session.destroy({ where: {} })
    await ReadingList.destroy({ where: {} })
    await Blog.destroy({ where: {} })
    await User.destroy({ where: {} })

    res.status(204).end()
  } catch (error) {
    next(error)
  }
})

module.exports = router