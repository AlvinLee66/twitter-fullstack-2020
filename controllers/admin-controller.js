const adminController = {
  signInPage: (req, res) => {
    res.render('admin/signin')
  },
  signIn: (req, res) => {
    req.flash('success_messages', 'login successfully!')
    res.redirect('/admin/tweets')
  },
  logout: (req, res) => {
    req.flash('success_messages', 'logout successfully!')
    req.logout()
    res.redirect('/admin/signin')
  }
}

module.exports = adminController
