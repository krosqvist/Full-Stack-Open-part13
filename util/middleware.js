
const jwt = require('jsonwebtoken')
const { SECRET } = require('../util/config')
const { Session, User } = require('../models')

const tokenExtractor = (req, res, next) => {
  const authorization = req.get('authorization')

  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    req.token = authorization.substring(7)
  } else {
    return res.status(401).json({ error: 'token missing' })
  }

  next()
}

const userExtractor = async (req, res, next) => {
  try {
    const decodedToken = jwt.verify(req.token, SECRET)

    const session = await Session.findOne({
      where: { token: req.token }
    })

    if (!session) {
      return res.status(401).json({ error: 'session expired' })
    }

    const user = await User.findByPk(decodedToken.id)

    if (!user || user.disabled || session.userId !== user.id) {
      return res.status(401).json({
        error: 'user is disabled or session is invalid'
      })
    }

    req.user = user
    next()
  } catch (error) {
    if (error.name === 'JsonWebTokenError' ||
        error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'token invalid or expired' })
    }

    next(error)
  }
}

module.exports = {
  tokenExtractor,
  userExtractor
}
