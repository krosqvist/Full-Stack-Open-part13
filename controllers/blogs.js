const router = require('express').Router()
const { Blog, User } = require('../models')
const { tokenExtractor, userExtractor } = require('../util/middleware')
const { Op } = require('sequelize')

const blogFinder = async (req, res, next) => {
  req.blog = await Blog.findByPk(req.params.id)
  if (!req.blog) {
    return res.status(404).end()
  }
  next()
}

router.get('/', async (req, res) => {
  const where = {}

  if (req.query.search) {
    where[Op.or] = [
      {
        title: {
          [Op.iLike]: `%${req.query.search}%`
        }
      },
      {
        author: {
          [Op.iLike]: `%${req.query.search}%`
        }
      }
    ]
  }

  const blogs = await Blog.findAll({
    attributes: { exclude: ['userId'] },
    include: {
      model: User,
      attributes: ['username', 'name']
    },
    where,
    order: [['likes', 'DESC']]
  })  
  res.json(blogs)
})

router.get('/:id', blogFinder, async (req, res) => {
  res.json(req.blog)
})

router.post('/', tokenExtractor, userExtractor, async (req, res, next) => {
  try {
    const blog = await Blog.create({ ...req.body, userId: req.user.id })
    res.json(blog)
  } catch(error) {
    next(error)
  }
})

router.put('/:id', blogFinder, async (req, res, next) => {
  try {
    req.blog.likes = req.body.likes
    const updatedBlog = await req.blog.save()
    res.json(updatedBlog)
  } catch(error) {
    next(error)
  }
})

router.delete('/:id', tokenExtractor, userExtractor, blogFinder, async (req, res, next) => {
  try {
    if (req.blog.userId !== req.user.id) {
      return res.status(403).json({
        error: 'Only the user who created this blog can delete it'
      })
    }
    await req.blog.destroy()
    res.status(204).end()
  } catch (error) {
    next(error)
  }
})

module.exports = router