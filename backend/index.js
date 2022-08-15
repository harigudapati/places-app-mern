const express = require('express')
const fs = require('fs')
const path = require('path')
const bodyParser = require('body-parser')
const placesRoutes = require('./routes/places-routes')
const usersRoutes = require('./routes/users-routes')
// const HttpError = require('./models/http-error')
const mongoose = require('mongoose')

const app = express()

app.use(bodyParser.json())

app.use('/uploads/images', express.static(path.join('uploads', 'images')))

app.use(express.static(path.join('public')))

/** **** PLEASE OMMIT IF IT"S THE SAME HOST i.e, same port ********* */
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE')
  next()
})

app.use('/api/places', placesRoutes)

app.use('/api/users', usersRoutes)

app.use((req, res, next) => {
  res.sendFile(path.resolve(__dirname, 'public', 'index.html'))
})

// app.use((req, res, next) => {
//   throw new HttpError('Could not find this route', 404)
// })

app.use((error, req, res, next) => {
  if (req.file) {
    fs.unlink(req.file.path, err => {
      console.log(err)
    })
  }
  if (res.headerSent) {
    return next(error)
  } else {
    res.status(error.code || 500).json({ message: error.message || 'An unknown error occured' })
  }
})

mongoose.connect(
  `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.amstv.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`
)
  .then(() => {
    app.listen(process.env.PORT || 5555, () => { console.log(`Server running on port ${process.env.PORT}`) })
  })
  .catch((error) => { console.log(error) })
