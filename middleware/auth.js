const helpers = require('../_helpers')
const authenticated = (req, res, next) => {
  const loginUser = helpers.getUser(req)
  if (helpers.ensureAuthenticated(req)) {
    if (loginUser.role === 'user') return next()
    return res.redirect('/admin/signin')
  }
  res.redirect('/signin')
}
const authenticatedAdmin = (req, res, next) => {
  if (helpers.ensureAuthenticated(req)) {
    const loginUser = helpers.getUser(req)
    if (loginUser.role === 'admin') return next()
    return res.redirect('/signin')
  }
}

module.exports = {
  authenticated,
  authenticatedAdmin
}
