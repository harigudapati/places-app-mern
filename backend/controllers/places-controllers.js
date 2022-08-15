const HttpError = require('../models/http-error')
const { validationResult } = require('express-validator')
const getCoordsByAddress = require('../utils/location')
const Place = require('../models/place')
const User = require('../models/user')
const { default: mongoose } = require('mongoose')
const fs = require('fs')

const getPlaceById = async (req, res, next) => {
  const placeId = req.params.pid

  let place

  try {
    place = await Place.findById(placeId)
  } catch (error) {
    return next(new HttpError('Something went wrong, could not find a place', 500))
  }

  if (!place) {
    throw new HttpError('Could not find a place for the provided id.', 404)
  }
  res.json({ place: place.toObject({ getters: true }) })
}

const getPlacesByUserId = async (req, res, next) => {
  const userId = req.params.uid
  let places

  try {
    places = await Place.find({ creator: userId })
    // or
    // userWithPlaces = await User.findById(userId).populate('places')
    // populate gives access to another complete collection with the reference key
  } catch (error) {
    return next(new HttpError('Something went wrong, could not find user id', 500))
  }

  if (!places || places.length === 0) {
    return next(new HttpError('Could not find places for the provided user id.', 404))
  }
  res.json({ places: places.map(place => place.toObject({ getters: true })) })
}

const createPlace = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return next(new HttpError('Invalid inputs passed, please check your data.', 422))
  }
  const { title, description, address } = req.body

  let coordinates

  try {
    coordinates = await getCoordsByAddress(address)
  } catch (error) {
    return next(error)
  }

  const createdPlace = new Place({
    title,
    description,
    location: coordinates,
    address,
    image: req.file.path,
    creator: req.userData.userId
  })

  let user

  try {
    user = await User.findById(req.userData.userId)
  } catch (error) {
    return next(new HttpError('Something went wrong, please try again', 500))
  }

  if (!user) {
    return next(new HttpError('Couldnt find the user for provided id', 404))
  }

  try {
    const session = await mongoose.startSession()
    session.startTransaction()
    await createdPlace.save({ session })
    user.places.push(createdPlace)
    await user.save({ session })
    await session.commitTransaction()
  } catch (error) {
    return next(new HttpError('Could not create place', 500))
  }

  res.status(201).json({ place: createdPlace })
}

const updatePlace = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return next(new HttpError('Invalid inputs passed, please check your data.', 422))
  }
  const placeId = req.params.pid
  const { title, description } = req.body

  let updatedPlace

  try {
    updatedPlace = await Place.findById(placeId)
  } catch (error) {
    return next(new HttpError('Something went wrong, could not find id', 500))
  }

  if (updatedPlace.creator.toString() !== req.userData.userId) {
    return next(new HttpError('You are not allowed to edit this place.', 401))
  }

  updatedPlace.title = title
  updatedPlace.description = description

  try {
    await updatedPlace.save()
  } catch (error) {
    return next(new HttpError('Something went wrong, could not update', 500))
  }

  res.status(200).json({ place: updatedPlace.toObject({ getters: true }) })
}

const deletePlace = async (req, res, next) => {
  const placeId = req.params.pid

  let place
  try {
    place = await Place.findById(placeId).populate('creator')
  } catch (error) {
    return next(new HttpError('Could not find a place for that id.', 500))
  }

  if (!place) {
    return next(new HttpError('Could not find the place for the provided id', 404))
  }

  if (place.creator.id !== req.userData.userId) {
    return next(new HttpError('You are not allowed to delete this place.', 401))
  }

  const imagePath = place.image

  try {
    const session = await mongoose.startSession()
    await session.startTransaction()
    await place.remove({ session })
    place.creator.places.pull(place)
    await place.creator.save({ session })
    await (await session).commitTransaction()
  } catch (error) {
    return next(new HttpError('Could not delete the place', 500))
  }

  fs.unlink(imagePath, (error) => {
    console.log(error)
  })
  res.status(200).json({ message: 'Deleted place' })
}

exports.getPlaceById = getPlaceById
exports.getPlacesByUserId = getPlacesByUserId
exports.createPlace = createPlace
exports.updatePlace = updatePlace
exports.deletePlace = deletePlace
