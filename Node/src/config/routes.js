const node = require('../Node').Node
const HttpStatus = require('http-status-codes')

module.exports = (app) => {
  app.get('/', (req, res) => {
    const listExpressEndpoints = require('express-list-endpoints')
    let endpoints = listExpressEndpoints(app)
    let endPointsAsListItems = endpoints.map(e =>
      `<li>${e.methods} <a href="${e.path}">${e.path}</a></li>`).join('')
    res.send(
      '<h1>SimpleChain - Simple Educational Blockchain Network</h1>' +
        `<ul>${endPointsAsListItems}</ul>`)
  })
  app.get('/info', (req, res) => {
    res.json({
      'about': 'SimpleChain/0.1-js',
      'nodeUrl': node.selfUrl,
      'peers': node.peers.length,
      'difficulty': node.chain.difficulty,
      'blocks': node.chain.blocks.length,
      'confirmedTransactions': node.chain.getConfirmedTransactions().length,
      'pendingTransactions': node.chain.pendingTransactions.length
    })
  })
  app.get('/blocks', (req, res) => {
    let blocks = node.chain.blocks
    res.json(blocks)
  })
  app.get('/blocks/:index', (req, res) => {
    let index = req.params.index
    let block = node.chain.blocks[index]
    if (block) {
      res.json(block)
    } else {
      res.status(HttpStatus.NOT_FOUND).json({errorMsg: 'Invalid block index'})
    }
  })
  app.get('/transactions/pending', (req, res) => {
    let pendingTrans = node.chain.getPendingTransactions()
    res.json(pendingTrans)
  })
  app.get('/transactions/confirmed', (req, res) => {
    res.json(node.chain.getConfirmedTransactions())
  })
  app.get('/transactions/:transactionHash', (req, res) => {
    let tranHash = req.params.transactionHash
    let transaction = node.chain.getTransactionByHash(tranHash)
    if (transaction) {
      res.json(transaction)
    } else {
      res.status(HttpStatus.NOT_FOUND).json({errorMsg: 'Invalid transaction hash'})
    }
  })
  app.get('/address/:address/transactions', (req, res) => {
    let address = req.params.address
    let tranHistory = node.chain.getTransactionHistory(address)
    res.json(tranHistory)
  })
  app.get('/address/:address/balance', (req, res) => {
    let address = req.params.address
    let balance = node.chain.getAccountBalance(address)
    if (balance.confirmedBalance) {
      res.json(balance)
    } else {
      res.status(HttpStatus.NOT_FOUND).json(balance)
    }
  })
  app.post('/transactions/send', (req, res) => {
    let sendResult = node.chain.addNewTransaction(req.body)
    if (sendResult.transactionHash) {
      res.status(HttpStatus.CREATED).json(sendResult)
    } else {
      res.status(HttpStatus.BAD_REQUEST).json(sendResult)
    }
  })
}
