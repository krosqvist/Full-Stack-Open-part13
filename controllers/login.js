const jwt = require('jsonwebtoken')
const router = require('express').Router()
const { SECRET } = require('../util/config')
const { User, Session } = require('../models')

router.post('/', async (request, response) => {
  const body = request.body

  const user = await User.findOne({
    where: {
      username: body.username
    }
  })

  if (!(user)) {
    return response.status(401).json({
      error: 'invalid username'
    })
  }

  if (user.disabled) {
    return res.status(401).json({
      error: 'account disabled'
    })
  }

  const userForToken = {
    username: user.username,
    id: user.id,
  }

  const token = jwt.sign(userForToken, SECRET)

  await Session.create({
    token,
    userId: user.id
  })

  response
    .status(200)
    .send({ token, username: user.username, name: user.name })
})

module.exports = router