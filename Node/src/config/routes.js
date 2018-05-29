const axios = require('axios')
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
      'nodeId': node.nodeId,
      'chainId': node.chainId,
      'nodeUrl': node.selfUrl,
      'peers': node.peers.length,
      'difficulty': node.chain.difficulty,
      'cumulativeDifficulty': node.chain.calculateCumulativeDifficulty(),
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
  app.get('/mining/get-mining-job/:address', (req, res) => {
    let address = req.params.address
    let blockCandidate = node.chain.getMiningJob(address)
    res.json({
      index: blockCandidate.index,
      transactionsIncluded: blockCandidate.transactions.length,
      difficulty: blockCandidate.difficulty,
      expectedReward: blockCandidate.transactions[0].amount,
      rewardAddress: blockCandidate.transactions[0].recipientAddress,
      blockDataHash: blockCandidate.dataHash
    })
  })
  app.post('/mining/submit-mined-block', (req, res) => {
    let dataHash = req.body.dataHash
    let timestamp = req.body.timestamp
    let nonce = req.body.nonce
    let blockHash = req.body.blockHash
    let result = node.chain.submitMinedBlock(dataHash, timestamp, nonce, blockHash)
    if (result.errorMsg) {
      res.status(HttpStatus.BAD_REQUEST).json(result)
    } else {
      res.json({'message': `Block accepted, reward paid: ${result.transactions[0].amount} microcoins`})
      node.notifyPeersAboutNewBlock()
    }
  })
  app.get('/debug/mine/:minerAddress/:difficulty', (req, res) => {
    let minerAddress = req.params.minerAddress
    let difficulty = parseInt(req.params.difficulty) || 3
    let result = node.chain.mineNextBlock(minerAddress, difficulty)
    if (result.errorMsg) {
      res.status(HttpStatus.BAD_REQUEST)
    }
    res.json(result)
  })
  app.get('/peers', (req, res) => {
    res.json(node.peers)
  })
  app.post('/blocks/notify-new-block', (req, res) => {
    node.syncChain(req.body)
    res.json({ message: 'Thank you for the notification.' })
  })
  app.post('/peers/connect', (req, res) => {
    let peerUrl = req.body.peerUrl
    if (peerUrl === undefined) {
      return res.status(HttpStatus.BAD_REQUEST.json({errorMsg: "Missing 'peerUrl' in the request body"}))
    }
    console.log('Trying to connect to peer: ' + peerUrl)
    axios.get(peerUrl + '/info')
      .then(function (result) {
        if (node.peers[result.data.nodeId]) {
          console.log('Error: already connected to peer: ' + peerUrl)
          return res.status(HttpStatus.CONFLICT).json({errorMsg: 'Already connected to peer: ' + peerUrl})
        } else {
          node.peers[result.data.nodeId] = peerUrl
          console.log('Successfully connected to peer: ' + peerUrl)
          node.syncChain(result.data)
          res.json({message: 'Connected to peer: ' + peerUrl})

          // Try to connect back the remote peer to self
          axios.post(peerUrl + '/peers/connect', {peerUrl: node.selfUrl})
            .then(function () {

            })
            .catch(function () {

            })
        }
      })
      .catch(function () {
        console.log(`Error: connecting to peer: ${peerUrl} failed.`)
        return res.status(HttpStatus.BAD_REQUEST).json({errorMsg: 'Cannot connect to peer: ' + peerUrl})
      })
  })
}
