
module.exports = io => {
  const userlist = []
  const formatMessage = require('../utils/messages.js')
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
    io.emit('onlineUsers', userlist)

    // welcome
    socket.emit('system message', formatMessage('system', 'welcome to public chatroom'))

    // broadcast when a user connects
    socket.broadcast.emit('system message', formatMessage('system', `${user.name} has joined the chat`))

    // runs when client disconnects
    socket.on('disconnect', () => {
      io.emit('system message', formatMessage('system', `${user.name} has left the chat`))
    })

    // listen for chatMessage
    socket.on('chatMessage', msg => {
      io.emit('message', formatMessage(user.name, msg))
    })
  })
}
