class FollowYourselfError extends Error {
  constructor(message) {
    super(message)
    this.name = FollowYourselfError
  }
}

module.exports = {
  FollowYourselfError
}
