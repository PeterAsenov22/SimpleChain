require('dotenv').config()
const initializeNode = require('./Node').initializeNode

const serverHost = process.env.HOST || 'localhost'
const serverPort = process.env.PORT || 5555

const url = `http://${serverHost}:${serverPort}`
const express = require('express')

let app = express()

require('./config/express')(app)
require('./config/routes')(app)

initializeNode(serverHost, serverPort, url)

app.listen(serverPort, () => {
  console.log(`Server started at ${url}`)
})
