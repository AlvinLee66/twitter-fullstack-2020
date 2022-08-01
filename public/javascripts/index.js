const postPanel = document.querySelector('.table')

// 特定貼文詳情
postPanel.addEventListener('click', e => {
  console.log(e.target)
  if (e.target.matches('.btn-show-reply')) {
    console.log(e.target.dataset.id)
  }
})

// wrapper.addEventListener('click', e => {()}
// const tweet = document.getElementById('modal-description').value

// document.getElementById('error').innerHTML = '請輸入推文內容!'
// document.getElementById('error').innerHTML = '內容不可空白'
