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
const formatMessage = require('./utils/messages.js')

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

const userlist = []

io.on('connection', socket => {
  const user = socket.request.user

  const index = userlist.findIndex(u => u.userId === user.id)

  if (index === -1) {
    userlist.push({
      socketId: socket.id,
      userId: user.id,
      username: user.name,
      account: user.account,
      avatar: user.avatar
    })
  }
  console.log(userlist)
  io.emit('onlineUsers', userlist)

  console.log(userlist)

  // welcome
  socket.emit('message', formatMessage('system', 'welcome to public chatroom'))

  // broadcast when a user connects
  socket.broadcast.emit('message', formatMessage('system', 'A user has joined the chat'))

  // runs when client disconnects
  socket.on('disconnect', () => {
    io.emit('message', formatMessage('system', 'A user has left the chat'))
  })

  // listen for chatMessage
  socket.on('chatMessage', msg => {
    io.emit('message', formatMessage('USER', msg))
  })
})

server.listen(port, () => console.log(`Example app listening on port ${port}!`))

module.exports = app
