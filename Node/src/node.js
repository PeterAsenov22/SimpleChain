const axios = require('axios')
const Helper = require('./helpers/helper')
const Blockchain = require('./Blockchain')
const difficulty = 5

let node = {}

module.exports.initializeNode = (host, port, selfUrl) => {
  node.host = host
  node.port = port
  node.selfUrl = selfUrl
  node.peers = {}

  let genesisBlock = Helper.generateGenesisBlock()
  node.chain = new Blockchain(genesisBlock, difficulty)

  node.nodeId = (new Date()).getTime().toString(16) +
        Math.random().toString(16).substring(2)
  node.chainId = node.chain.blocks[0].blockHash
}

node.syncChain = async function (peerChainInfo) {
  try {
    let thisChainLength = node.chain.blocks.length
    let peerChainLength = peerChainInfo.blocks
    let thisChainDifficulty = node.chain.calculateCumulativeDifficulty()
    let peerChainDifficulty = peerChainInfo.cumulativeDifficulty
    if (peerChainLength > thisChainLength && peerChainDifficulty > thisChainDifficulty) {
      console.log(`Chain sync started. Peer: ${peerChainInfo.nodeUrl}. Expected chain length = ${peerChainLength}, expected cummulative difficulty = ${peerChainDifficulty}.`)
      let blocks = (await axios.get(peerChainInfo.nodeUrl + '/blocks')).data
      node.chain.processLongerChain(blocks)
    }
  } catch (err) {
    console.log('Error loading the chain: ' + err)
  }
}

node.notifyPeersAboutNewBlock = async function () {
  let notification = {
    blocks: node.chain.blocks.length,
    cumulativeDifficulty: node.chain.calculateCumulativeDifficulty(),
    nodeUrl: node.selfUrl
  }
  for (let nodeId in node.peers) {
    let peerUrl = node.peers[nodeId]
    console.log(`Notifying peer ${peerUrl} about the new block`)
    axios.post(peerUrl + '/blocks/notify-new-block', notification)
      .then(function () {
        console.log(`Successfully notified peer ${peerUrl} about the new block`)
      })
      .catch(function () {
        console.log(`Error while notifying peer ${peerUrl} about the new block`)
      })
  }
}

module.exports.Node = node
