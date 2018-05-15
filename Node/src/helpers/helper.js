const Block = require('../Block').Block
const Transaction = require('../Transaction')

const faucetPrivateKey = 'd816f0c72ecc7dc1f0a8d5294676098ea0d5ee826f5c13c7026952ff8ea24fe4'
const nullAddress = '0000000000000000000000000000000000000000'
const nullPubKey = '00000000000000000000000000000000000000000000000000000000000000000'
const nullSignature = [
  '0000000000000000000000000000000000000000000000000000000000000000',
  '0000000000000000000000000000000000000000000000000000000000000000'
]
const networkCirculatingSupply = 1000000000000

function privateKeyToAddress (privateKey) {
}

function generateGenesisBlock () {
  let faucetAddress = privateKeyToAddress(faucetPrivateKey)
  let genesisTimestamp = Date.now()

  let genesisTransaction = new Transaction(
    nullAddress,
    faucetAddress,
    networkCirculatingSupply,
    0,
    genesisTimestamp,
    nullPubKey,
    nullSignature,
    undefined,
    0,
    true
  )

  let genesisBlock = new Block(
    0,
    [genesisTransaction],
    0,
    undefined,
    nullAddress,
    undefined,
    0,
    genesisTimestamp,
    undefined
  )

  return genesisBlock
}

module.exports = {
  generateGenesisBlock: generateGenesisBlock,
  privateKeyToAddress: privateKeyToAddress
}
