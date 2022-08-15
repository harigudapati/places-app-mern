// const { v4: uuidv4 } = require('uuid')
const HttpError = require('../models/http-error')
const { validationResult } = require('express-validator')
const User = require('../models/user')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const getUsers = async (req, res, next) => {
  let users
  try {
    users = await User.find({}, '-password')
  } catch (error) {
    return next(new HttpError('Something went wrong, please try again later', 500))
  }
  res.status(200).json({ users: users.map(user => user.toObject({ getters: true })) })
}

const signup = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return next(new HttpError('Invalid inputs passed, please check your data.', 422))
  }

  const { name, email, password } = req.body
  // let existingUser

  // try {
  const existingUser = await User.findOne({ email })
  // } catch (error) {
  //   return next(new HttpError('Signup failed, please try again', 500))
  // }

  if (existingUser) {
    // throw never works in Async functions
    return next(new HttpError('Could not create user, email already exists', 422))
  }

  let hashedPassword
  try {
    hashedPassword = await bcrypt.hash(password, 12)
  } catch (error) {
    return next(new HttpError('Could not create user, please try again!', 500))
  }

  const createdUser = new User({
    name,
    email,
    password: hashedPassword,
    places: [],
    image: req.file.path
  })

  try {
    await createdUser.save()
  } catch (error) {
    return next(new HttpError('Could not create the user, please try again later', 500))
  }

  let token
  try {
    token = jwt.sign({ userId: createdUser.id, email: createdUser.email }, process.env.SECRET_KEY, { expiresIn: '1hr' })
  } catch (error) {
    return next(new HttpError('Signup failed, please try again.', 500))
  }

  res.status(201).json({ userId: createdUser.id, email: createdUser.email, token })
}

const login = async (req, res, next) => {
  const { email, password } = req.body
  let identifiedUser

  try {
    identifiedUser = await User.findOne({ email })
  } catch (error) {
    return next(new HttpError('Something went wrong, please try again later', 500))
  }

  if (!identifiedUser) {
    return next(new HttpError('Could not identify user, Invalid credentials', 403))
  }

  let validPassword
  try {
    validPassword = await bcrypt.compare(password, identifiedUser.password)
  } catch (error) {
    return next(new HttpError('Could not log you in. Please check your credentials and try again!', 500))
  }

  if (!validPassword) {
    return next(new HttpError('Could not identify user, Invalid credentials', 403))
  }

  let token
  try {
    token = jwt.sign({ userId: identifiedUser.id, email: identifiedUser.email }, process.env.SECRET_KEY, { expiresIn: '1hr' })
  } catch (error) {
    return next(new HttpError('Loggingin  failed, please try again.', 500))
  }

  res.json({ userId: identifiedUser.id, email: identifiedUser.email, token })
}

exports.getUsers = getUsers
exports.signup = signup
exports.login = login
