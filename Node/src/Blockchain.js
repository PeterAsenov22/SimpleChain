const helper = require('./helpers/helper')
const Transaction = require('./Transaction')

module.exports = class Blockchain {
  constructor (genesisBlock, difficulty) {
    this.blocks = [genesisBlock]
    this.difficulty = difficulty
    this.pendingTransactions = []
    this.miningJobs = {}
  }

  getPendingTransactions () {
    return this.pendingTransactions
  }

  getConfirmedTransactions () {
    let transactions = []
    for (let block of this.blocks) {
      transactions.push.apply(transactions, block.transactions);
    }
    return transactions
  }

  getTransactionByHash (hash) {
    let allTransactions =
      this.getConfirmedTransactions()
        .concat(this.pendingTransactions)

    let tran = allTransactions.filter(t => t.transactionHash === hash)
    if (tran.length > 0) {
      return tran[0]
    }
    return undefined
  }

  addNewTransaction (transactionData) {
    if (!helper.isValidAddress(transactionData.senderAddress)) {
      return {errorMsg: 'Invalid sender address: ' + transactionData.senderAddress}
    }
    if (!helper.isValidAddress(transactionData.recipientAddress)) {
      return {errorMsg: 'Invalid recipient address: ' + transactionData.recipientAddress}
    }
    if (!helper.isValidPublicKey(transactionData.senderPubKey)) {
      return {errorMsg: 'Invalid public key: ' + transactionData.senderPubKey}
    }
    if (helper.publicKeyToAddress(transactionData.senderPubKey) !== transactionData.senderAddress) {
      return {errorMsg: 'The public key should match the sender address'}
    }
    if (!helper.isValidTransferAmount(transactionData.amount)) {
      return {errorMsg: 'Invalid transfer amount: ' + transactionData.amount}
    }
    if (!helper.isValidFee(transactionData.fee)) {
      return {errorMsg: 'Invalid transaction fee: ' + transactionData.fee}
    }
    if (!helper.isValidTimestamp(transactionData.timestamp)) {
      return {errorMsg: 'Invalid date: ' + transactionData.timestamp}
    }
    if (!helper.isValidSignatureFormat(transactionData.senderSignature)) {
      return {errorMsg: 'Invalid or missing signature. Expected signature format: ["hexnum", "hexnum"]'}
    }
    if (!helper.validateSignature(transactionData.transactionHash, transactionData.senderPubKey, transactionData.senderSignature)) {
      return {errorMsg: 'Invalid signature: ' + transactionData.senderSignature}
    }
    if (this.getTransactionByHash(transactionData.transactionHash)) {
      return {errorMsg: 'Duplicated transaction: ' + transactionData.transactionHash}
    }

    let tran = new Transaction(
      transactionData.senderAddress,
      transactionData.recipientAddress,
      transactionData.amount,
      transactionData.fee,
      transactionData.timestamp,
      transactionData.senderPubKey,
      transactionData.senderSignature
    )

    this.pendingTransactions.push(tran)

    return tran
  }
}
