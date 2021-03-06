const emailModel = {}
const Users = require('../db').Users
const sendError = require('../helpers/sendError')

emailModel.PASSWORD_RESET = (email, token) => {
  return Users.update(
    {
      token,
    },
    {
      where: {
        email,
      },
    },
  ).then(result => {
    if (!result) {
      sendError('PasswordReset', 'Password reset failure', {}, 'Email')
      return 'Error'
    }
    return `https://www.ooloo.app/passwordreset/${token}`
  })
}

module.exports = emailModel
