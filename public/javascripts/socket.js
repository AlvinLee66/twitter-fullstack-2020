const socket = io()

const chatForm = document.getElementById('chat-form')
const chatMessages = document.querySelector('.chat-messages')

// message from server
socket.on('message', message => {
  outputMessage(message)

  // scroll down
  chatMessages.scrollTop = chatMessages.scrollHeight
})

chatForm.addEventListener('submit', e => {
  e.preventDefault()

  const msg = e.target.elements.msg.value

  // emit message to server
  socket.emit('chatMessage', msg)
  // clear input
  e.target.elements.msg.value = ''
  e.target.elements.msg.value.focus()
})

// output message to dom
function outputMessage (message) {
  const div = document.createElement('div')
  div.classList.add('message')
  div.innerHTML = `<p class="meta" >${message.username} <span>${message.time}</span ></p>
      <p class="text">
        ${message.text}
      </p>`
  document.querySelector('.chat-messages').appendChild(div)
}
