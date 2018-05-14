const Node = require('../Node').Node

module.exports = (app) => {
  app.get('/', (req, res) => {
    res.send('Simple Blockchain Network')
  })
  app.get('/chain', (req, res) => {
    res.json(Node.chain)
  })
}
