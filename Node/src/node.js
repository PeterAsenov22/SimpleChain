const Block = require('./Block')
const Transaction = require('./Transaction')
const Helper = require('./helpers/helper')
// const Blockchain = require('./Blockchain')
const difficulty = 5

let node = {}

module.exports.initializeNode = (host, port, selfUrl) => {
  node.host = host
  node.port = port
  node.selfUrl = selfUrl
  node.peers = []

  let genesisBlock = Helper.generateGenesisBlock()
  node.chain = [genesisBlock]
  // node.chain = new Blockchain(genesisBlock, difficulty)
}

module.exports.Node = node
