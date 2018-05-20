const CryptoJs = require('crypto-js')

module.exports = class Transaction {
  constructor (senderAddress, recipientAddress, amount, fee, timestamp, senderPubKey, senderSignature, transactionHash, blockIndex, isSuccessful) {
    this.senderAddress = senderAddress
    this.recipientAddress = recipientAddress
    this.amount = amount
    this.fee = fee
    this.timestamp = timestamp
    this.senderPubKey = senderPubKey
    this.senderSignature = senderSignature

    this.transactionHash = transactionHash
    if (!this.transactionHash) {
      this.calculateTransactionHash()
    }

    this.blockIndex = blockIndex
    this.isSuccessful = isSuccessful
  }

  calculateTransactionHash () {
    let data = {
      senderAddress: this.senderAddress,
      recipientAddress: this.recipientAddress,
      amount: this.amount,
      fee: this.fee,
      senderPubKey: this.senderPubKey,
      timestamp: this.timestamp
    }

    let dataJson = JSON.stringify(data)
    this.transactionHash = CryptoJs.SHA256(dataJson).toString()
  }
}
