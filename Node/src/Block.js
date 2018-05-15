const CryptoJs = require('crypto-js')

module.exports.Block = class Block {
  constructor (index, transactions, difficulty, previousBlockHash, minedBy, dataHash, nonce, timestamp, blockHash) {
    this.index = index
    this.transactions = transactions
    this.difficulty = difficulty
    this.previousBlockHash = previousBlockHash
    this.minedBy = minedBy

    this.dataHash = dataHash
    if (!this.dataHash) {
      this.dataHash = this.calculateDataHash()
    }

    this.nonce = nonce
    this.timestamp = timestamp

    this.blockHash = blockHash
    if (!this.blockHash) {
      this.blockHash = this.calculateBlockHash()
    }
  }

  calculateDataHash () {
    let blockData = {
      index: this.index,
      transactions: this.transactions.map(t => Object({
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
      difficulty: this.difficulty,
      previousBlockHash: this.prevBlockHash,
      minedBy: this.minedBy
    }

    let dataJson = JSON.stringify(blockData)
    return CryptoJs.SHA256(dataJson).toString()
  }

  calculateBlockHash () {
    let data = this.dataHash + this.timestamp + this.nonce
    return CryptoJs.SHA256(data).toString()
  }
}
