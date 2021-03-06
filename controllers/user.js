const userController = {}
const userModel = require('../models/user')
const authHelpers = require('../helpers/auth')
const Promise = require('bluebird')
const mailgun = require('mailgun-js')({ apiKey: process.env.MAILGUN_API, domain: process.env.MAILGUN_DOMAIN })
const sendError = require('../helpers/sendError')
const verifyToken = require('../helpers/auth').verifyToken

userController.SIGN_UP = (req, res) => {
  let email = req.body.email
  let password = req.body.password
  let username = req.body.username
  let school = req.body.school

  if (password.length < 7) {
    res.status(400).send({
      error: 'PasswordTooShort',
    })
  }

  return userModel.SIGN_UP(email, password, username, school).then(response => {
    if (response.error) {
      res.status(400).send({
        error: response.error,
      })
    } else {
      let Authorization = authHelpers.generateTokens(response.user.id, response.user.isAdmin)
      let emailData = {
        from: 'contact@ooloo.app',
        to: email,
        subject: 'Ooloo - Email Verification',
        text: `Please use the following link to verify your email: https://www.ooloo.app/emailverification/${Authorization}`,
      }

      mailgun.messages().send(emailData, (err, body) => {
        if (err) {
          sendError('Signup', err, req, 'User')
        }
      })

      res.status(200).send({
        Authorization,
      })
    }
  })
}

userController.PASSWORD_RESET = (req, res) => {
  let password = req.body.password
  let token = req.body.token

  if (password.length < 7) {
    res.status(400).send({
      error: 'PasswordTooShort',
    })
  }

  let verifiedToken = verifyToken(token)
  if (verifiedToken.error) {
    res.status(400).send({
      error: 'InvalidToken',
    })
    return
  }

  return userModel.PASSWORD_RESET(password, verifiedToken.decoded.data).then(response => {
    if (response.error) {
      res.status(400).send({
        error: response.error,
      })
    } else {
      res.status(200).send({
        passwordUpdated: true,
      })
    }
  })
}

userController.VERIFY_EMAIL = (req, res) => {
  let token = req.body.token
  let verifiedToken = verifyToken(token)

  if (verifiedToken.error) {
    res.status(400).send({
      error: 'InvalidToken',
    })
    return
  }

  return userModel.VERIFY_EMAIL(verifiedToken.decoded.id).then(response => {
    if (response.error) {
      res.status(400).send({
        error: response.error,
      })
    } else {
      res.status(200).send({
        emailVerified: true,
      })
    }
  })
}

userController.LOGIN = (req, res) => {
  let email = req.body.email
  let password = req.body.password

  return userModel.LOGIN(email, password).then(user => {
    if (user) {
      if (!user) {
        res.status(400).send({
          error: 'UserNotFound',
        })
        return
      }
      let getTokens = () => {
        return new Promise((resolve, reject) => {
          let tokens = authHelpers.generateTokens(user.id, user.isAdmin)
          resolve(tokens)
        })
      }

      getTokens().then(Authorization => {
        res.status(200).send({
          Authorization,
        })
      })
    } else {
      res.status(400).send({
        error: 'IncorrectCredentials',
      })
    }
  })
}

userController.LOGOUT = (req, res) => {
  res.status(200).send({
    loggedOut: true,
  })
}

userController.GET_USER = (req, res) => {
  let userId = req.user.id

  return userModel.GET_USER(userId).then(user => {
    res.status(200).send(user)
  })
}

userController.CHECK_USERNAME_IN_USE = (req, res) => {
  let username = req.params.username

  return userModel.CHECK_USERNAME_IN_USE(username).then(inUse => {
    res.status(200).send(inUse)
  })
}

userController.GET_USER_PROFILE = (req, res) => {
  let userToFind = req.params.username

  return userModel.GET_USER_PROFILE(userToFind).then(user => {
    res.status(200).send(user)
  })
}

userController.DELETE_USER = (req, res) => {
  let userId = req.user.id

  return userModel.DELETE_USER(userId).then(response => {
    res.status(200).send(response)
  })
}

userController.UPDATE_USER = (req, res) => {
  let userId = req.user.id
  let dataToUpdate = req.body

  return userModel.UPDATE_USER(userId, dataToUpdate).then(user => {
    res.status(200).send(user)
  })
}

userController.ADD_USER_SCHOOL = (req, res) => {
  let userId = req.user.id
  let schoolName = req.body.schoolName

  return userModel.ADD_USER_SCHOOL(userId, schoolName).then(user => {
    res.status(200).send(user)
  })
}

userController.DELETE_USER_SCHOOL = (req, res) => {
  let userId = req.user.id

  return userModel.DELETE_USER_SCHOOL(userId).then(user => {
    res.status(200).send(user)
  })
}

userController.GET_USER_RANK = async (req, res) => {
  try {
    const id = req.params.id
    const rank = await userModel.GET_USER_RANK(id)
    res.status(200).send(rank)
  } catch (error) {
    res.status(500).send(error)
  }
}

userController.GET_TOP_USERS = async (req, res) => {
  try {
    const topUsers = await userModel.GET_TOP_USERS()
    res.status(200).send(topUsers)
  } catch (error) {
    res.status(500).send(error)
  }
}

userController.GET_USER_LEADERBOARD = async (req, res) => {
  try {
    const leadeboard = await userModel.GET_USER_LEADERBOARD(req.params.id)
    res.status(200).send(leadeboard)
  } catch (error) {
    res.status(500).send(error)
  }
}

module.exports = userController
