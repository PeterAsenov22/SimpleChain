module.exports = class Blockchain {
  constructor (genesisBlock, difficulty) {
    this.blocks = [genesisBlock]
    this.difficulty = difficulty
    this.pendingTransactions = []
    this.miningJobs = {}
  }
}
