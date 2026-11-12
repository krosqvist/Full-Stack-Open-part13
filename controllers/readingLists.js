const router = require('express').Router()
const { ReadingList, User, Blog } = require('../models')
const { tokenExtractor, userExtractor } = require('../util/middleware')

router.post('/', async (req, res, next) => {
  try {
    const { blogId, userId } = req.body

    if (!Number.isInteger(blogId) || !Number.isInteger(userId)) {
      return res.status(400).json({
        error: 'blogId and userId must be integers'
      })
    }

    const user = await User.findByPk(userId)
    if (!user) {
      return res.status(404).json({
        error: `User with id ${userId} does not exist`
      })
    }

    const blog = await Blog.findByPk(blogId)
    if (!blog) {
      return res.status(404).json({
        error: `Blog with id ${blogId} does not exist`
      })
    }

    const readingListEntry = await ReadingList.create({
      userId,
      blogId
    })

    return res.status(201).json(readingListEntry)
  } catch (error) {
    next(error)
  }
})

router.put('/:id', tokenExtractor, userExtractor, async (req, res, next) => {
  try {
    const readingList = await ReadingList.findByPk(req.params.id)

    if (!readingList) {
      return res.status(404).json({
        error: 'Reading list entry not found'
      })
    }

    if (!req.user) {
      return res.status(401).json({
        error: 'user associated with token not found'
      })
    }

    if (readingList.userId !== req.user.id) {
      return res.status(401).json({
        error: 'You can only modify your own reading list'
      })
    }

    if (typeof req.body.read !== 'boolean') {
      return res.status(400).json({
        error: 'read must be a boolean'
      })
    }

    readingList.read = req.body.read
    await readingList.save()

    res.json(readingList)
  } catch (error) {
    next(error)
  }
})

module.exports = router