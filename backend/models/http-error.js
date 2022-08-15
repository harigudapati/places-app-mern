class HttpError extends Error {
  constructor (message, errorCode) {
    super()
    this.message = message // Add a "message" property
    this.code = errorCode // Add  a "code" propperty
  }
}

module.exports = HttpError
