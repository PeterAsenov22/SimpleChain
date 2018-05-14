const CryptoJs = require('crypto-js')

module.exports.Block = class Block {
  constructor (index, transactions, difficulty, previousBlockHash, minedBy, dataHash, nonce, timestamp, blockHash) {
    this.index = index
    this.transactions = transactions
    this.difficulty = difficulty
    this.previousBlockHash = previousBlockHash
    this.minedBy = minedBy
    this.dataHash = dataHash
    this.nonce = nonce
    this.timestamp = timestamp
    this.blockHash = blockHash
  }
}

module.exports.calculateDataHash = (block) => {
  let blockData = {
    index: block.index,
    transactions: block.transactions.map(t => Object({
      from: t.fromAddress,
      to: t.toAddress,
      value: t.value,
      fee: t.fee,
      dateCreated: t.dateCreated,
      senderPubKey: t.senderPubKey,
      transactionDataHash: t.senderSignature,
      senderSignature: t.senderSignature,
      minedInBlockIndex: t.minedInBlockIndex,
      paid: t.paid
    })),
    difficulty: block.difficulty,
    previousBlockHash: block.previousBlockHash,
    minedBy: block.minedBy
  }

  let dataJson = JSON.stringify(blockData)
  return CryptoJs.SHA256(dataJson).toString()
}

module.exports.calculateBlockHash = (block) => {
  let data = block.dataHash + block.timestamp + block.nonce
  return CryptoJs.SHA256(data).toString()
}
