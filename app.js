if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}
const express = require('express')
const handlebars = require('express-handlebars')
const flash = require('connect-flash')
const session = require('express-session')
const passport = require('./config/passport')
const methodOverride = require('method-override')
const helpers = require('./_helpers')
const handlebarsHelpers = require('./helpers/handlebars-helpers')
const routes = require('./routes')
const path = require('path')

const app = express()
const port = process.env.PORT || 3000
const http = require('http')
const server = http.createServer(app)
const { Server } = require('socket.io')
const io = new Server(server)
const SESSION_SECRET = 'secret'
const sessionMiddleware = session({ secret: SESSION_SECRET, resave: false, saveUninitialized: false })

app.engine('hbs', handlebars({ extname: '.hbs', helpers: handlebarsHelpers }))
app.set('view engine', 'hbs')

app.use(express.static('public'))

app.use(express.urlencoded({ extended: true }))
app.use(sessionMiddleware)
app.use(passport.initialize())
app.use(passport.session())

app.use(methodOverride('_method'))
app.use('/upload', express.static(path.join(__dirname, 'upload')))
app.use(express.json())

app.use(flash())
app.use((req, res, next) => {
  res.locals.success_messages = req.flash('success_messages')
  res.locals.warning_messages = req.flash('warning_messages')
  res.locals.error_messages = req.flash('error_messages')
  res.locals.user = helpers.getUser(req)
  next()
})

app.use(routes)

// 引入midddleware
const wrap = middleware => (socket, next) => middleware(socket.request, {}, next)

// 包入session和passport (所以可以拿到使用者資料)
io.use(wrap(sessionMiddleware))
io.use(wrap(passport.initialize()))
io.use(wrap(passport.session()))

io.use((socket, next) => {
  if (socket.request.user) {
    next()
  } else {
    next(new Error('unauthorized'))
  }
})

require('./config/socket-io')(io)

server.listen(port, () => console.log(`Example app listening on port ${port}!`))

module.exports = app
