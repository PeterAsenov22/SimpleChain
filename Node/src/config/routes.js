const Node = require('../Node').Node
const HttpStatus = require('http-status-codes')

module.exports = (app) => {
  app.get('/', (req, res) => {
    res.send('Simple Blockchain Network')
  })
  app.get('/chain', (req, res) => {
    let blocks = Node.chain.blocks
    res.json(blocks)
  })
  app.get('/transactions/pending', (req, res) => {
    let pendingTrans = Node.chain.getPendingTransactions()
    res.json(pendingTrans)
  })
  app.post('/transactions/send', (req, res) => {
    let sendResult = Node.chain.addNewTransaction(req.body)
    if (sendResult.transactionHash) {
      res.status(HttpStatus.CREATED).json(sendResult)
    } else {
      res.status(HttpStatus.BAD_REQUEST).json(sendResult)
    }
  })
}
