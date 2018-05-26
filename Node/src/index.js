const initializeNode = require('./Node').initializeNode

const serverHost = process.env.HTTP_HOST || 'localhost'
const serverPort = process.env.HTTP_PORT || 5555
const url = `http://${serverHost}:${serverPort}`
const express = require('express')

let app = express()

require('./config/express')(app)
require('./config/routes')(app)

initializeNode(serverHost, serverPort, url)

app.listen(serverPort, () => {
  console.log(`Server started at ${url}`)
})
