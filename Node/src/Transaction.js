const CryptoJs = require('crypto-js')

module.exports.Transaction = class Transaction {
  constructor (senderAddress, recipientAddress, amount, fee, timestamp, senderPubKey, senderSignature, blockIndex, isSuccessful) {
    this.senderAddress = senderAddress
    this.recipientAddress = recipientAddress
    this.amount = amount
    this.fee = fee
    this.timestamp = timestamp
    this.senderPubKey = senderPubKey
    this.senderSignature = senderSignature
    this.hash = Transaction.calculateTransactionHash(this)
    this.blockIndex = blockIndex
    this.isSuccessful = isSuccessful
  }

  static calculateTransactionHash (transaction) {
    let data = {
      senderAddress: transaction.senderAddress,
      recipientAddress: transaction.recipientAddress,
      amount: transaction.amount,
      fee: transaction.fee,
      senderPubKey: transaction.senderPubKey,
      timestamp: transaction.timestamp
    }

    let dataJson = JSON.stringify(data)
    return CryptoJs.SHA256(dataJson).toString()
  }
}
