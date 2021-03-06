const Router = require('express').Router()
const user = require('./user')
const email = require('./email')
const interest = require('./interest')
const admin = require('./admin')
const image = require('./image')
const subscription = require('./subscription')
const leaderboard = require('./leaderboard')
const graph = require('./graph') 
const school = require('./school')
const news = require('./news')

Router.use('/user', user)
Router.use('/email', email)
Router.use('/interest', interest)
Router.use('/admin', admin)
Router.use('/image', image)
Router.use('/subscription', subscription)
Router.use('/leaderboard', leaderboard)
Router.use('/graph', graph); 
Router.use('/school', school)
Router.use('/news', news); 

module.exports = Router
