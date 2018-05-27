const helper = require('./helpers/helper')
const config = require('./config/node')
const Transaction = require('./Transaction')
const Block = require('./Block')

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

  removePendingTransactions (transactionsToRemove) {
    let tranHashesToRemove = new Set()
    for (let tran of transactionsToRemove) {
      tranHashesToRemove.add(tran.transactionHash)
    }
    this.pendingTransactions = this.pendingTransactions.filter(
      t => !tranHashesToRemove.has(t.transactionHash))
  }

  getConfirmedTransactions () {
    let transactions = []
    for (let block of this.blocks) {
      transactions.push.apply(transactions, block.transactions)
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

  getAllTransactions () {
    let transactions = this.getConfirmedTransactions()
    transactions.push.apply(transactions, this.pendingTransactions)
    return transactions
  }

  getTransactionHistory (address) {
    let transactions = this.getAllTransactions()
    let transactionsByAddress = transactions.filter(t => t.senderAddress === address || t.recipientAddress === address)
    return transactionsByAddress
  }

  getAccountBalance (address) {
    let transactions = this.getTransactionHistory(address)
    if (transactions.length === 0) {
      return { errorMsg: 'No transactions' }
    }

    let balance = {
      safeBalance: 0,
      confirmedBalance: 0,
      pendingBalance: 0
    }


    for (let tran of transactions) {
      let confirmsCount = 0
      if (typeof (tran.blockIndex) === 'number') {
        confirmsCount = this.blocks.length - tran.blockIndex + 1
      }
      if (tran.senderAddress === address) {
        balance.pendingBalance -= tran.fee
        if (confirmsCount === 0 || tran.isSuccessful) {
          balance.pendingBalance -= tran.amount
        }
        if (confirmsCount >= 1) {
          balance.confirmedBalance -= tran.amount
          if (tran.isSuccessful) {
            balance.confirmedBalance -= tran.amount
          }
        }
        if (confirmsCount >= config.safeConfirmCount) {
          balance.safeBalance -= tran.amount
          if (tran.isSuccessful) {
            balance.safeBalance -= tran.amount
          }
        }
      }
      if (tran.recipientAddress === address) {
        if (confirmsCount === 0 || tran.isSuccessful) {
          balance.pendingBalance += tran.amount
        }
        if (confirmsCount >= 1 && tran.transferSuccessful) {
          balance.confirmedBalance += tran.amount
        }
        if (confirmsCount >= config.safeConfirmCount && tran.transferSuccessful) {
          balance.safeBalance += tran.amount
        }
      }
    }

    return balance
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

  calculateConfirmedBalances () {
    let transactions = this.getConfirmedTransactions()
    let balances = {}

    for (let tran of transactions) {
      balances[tran.senderAddress] = balances[tran.senderAddress] || 0
      balances[tran.recipientAddress] = balances[tran.recipientAddress] || 0
      balances[tran.senderAddress] -= tran.fee

      if (tran.isSuccessful) {
        balances[tran.senderAddress] -= tran.amount
        balances[tran.recipientAddress] += tran.amount
      }
    }

    return balances
  }

  getMiningJob (minerAddress) {
    let nextBlockIndex = this.blocks.length

    let rewardTran = new Transaction(
      config.nullAddress,
      minerAddress,
      config.blockReward,
      0,
      new Date().toISOString,
      config.nullPubKey,
      config.nullSignature,
      undefined,
      nextBlockIndex,
      true
    )

    let balances = this.calculateConfirmedBalances()
    let transactions = JSON.parse(JSON.stringify(this.getPendingTransactions()))
    transactions.sort((a, b) => b.fee - a.fee)

    for (let tran of transactions) {
      balances[tran.senderAddress] = balances[tran.senderAddress] || 0
      balances[tran.recipientAddress] = balances[tran.recipientAddress] || 0

      if (balances[tran.senderAddress] >= tran.fee) {
        tran.blockIndex = nextBlockIndex

        balances[tran.senderAddress] -= tran.fee
        rewardTran.amount += tran.fee

        if (balances[tran.senderAddress] >= tran.amount) {
          balances[tran.senderAddress] -= tran.amount
          balances[tran.recipientAddress] += tran.amount
          tran.isSuccessful = true
        } else {
          tran.isSuccessful = false
        }
      } else {
        this.removePendingTransactions([tran])
        transactions = transactions.filter(t => t !== tran)
      }
    }

    rewardTran.calculateTransactionHash()
    transactions.unshift(rewardTran)

    let prevBlockHash = this.blocks[this.blocks.length - 1].blockHash
    let nextBlockCandidate = new Block(
      nextBlockIndex,
      transactions,
      this.difficulty,
      prevBlockHash,
      minerAddress
    )

    this.miningJobs[nextBlockCandidate.dataHash] = nextBlockCandidate
    return nextBlockCandidate
  }

  submitMinedBlock (dataHash, timestamp, nonce, blockHash) {
    let newBlock = this.miningJobs[dataHash]
    if (newBlock === undefined) {
      return { errorMsg: 'Block not found or already mined' }
    }

    newBlock.timestamp = timestamp
    newBlock.nonce = nonce
    newBlock.calculateBlockHash()

    if (newBlock.blockHash !== blockHash) {
      return { errorMsg: 'Block hash is incorrectly calculated' }
    }

    if (newBlock.blockHash.substring(0, newBlock.difficulty) !== '0'.repeat(this.difficulty)) {
      return { errorMsg: 'The calculated block hash does not match the block difficulty' }
    }

    return this.addBlockToChain(newBlock)
  }

  addBlockToChain (newBlock) {
    if (this.blocks.length !== newBlock.index) {
      return { errorMsg: 'The submitted block was already mined by someone else' }
    }

    let prevBlock = this.blocks[this.blocks.length - 1]
    if (prevBlock.blockHash !== newBlock.previousBlockHash) {
      return { errorMsg: 'Incorrect prevBlockHash' }
    }

    this.blocks.push(newBlock)
    this.miningJobs = {}
    this.removePendingTransactions(newBlock.transactions)
    return newBlock
  }

  mineNextBlock (minerAddress, currentDifficulty) {
    this.difficulty = currentDifficulty
    let nextBlock = this.getMiningJob(minerAddress)

    // Mine the next block
    nextBlock.dateCreated = (new Date()).toISOString()
    nextBlock.nonce = 0
    do {
      nextBlock.nonce++
      nextBlock.calculateBlockHash()
    } while (!helper.isValidDifficulty(nextBlock.blockHash, currentDifficulty))

    // Submit the mined block
    let result = this.submitMinedBlock(nextBlock.dataHash,
      nextBlock.timestamp, nextBlock.nonce, nextBlock.blockHash)
    return result
  }

  processLongerChain (blocks) {
    // TODO: validate the chain (it should be longer, should hold valid blocks, each block should hold valid transactions, etc.
    this.blocks = blocks
    this.removePendingTransactions(this.getAllTransactions())
    console.log('Chain sync successful. Block count = ' + blocks.length)
  }

  calculateCumulativeDifficulty () {
    let difficulty = 0
    for (let block of this.blocks) {
      difficulty += block.difficulty
    }
    return difficulty
  }
}
