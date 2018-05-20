const faucetPrivateKey = 'd816f0c72ecc7dc1f0a8d5294676098ea0d5ee826f5c13c7026952ff8ea24fe4'
const nullAddress = '0000000000000000000000000000000000000000'
const nullPubKey = '00000000000000000000000000000000000000000000000000000000000000000'
const nullSignature = [
  '0000000000000000000000000000000000000000000000000000000000000000',
  '0000000000000000000000000000000000000000000000000000000000000000'
]
const networkCirculatingSupply = 1000000000000
const minTransactionFee = 10
const blockReward = 5000000
const safeConfirmCount = 6

module.exports = {
  faucetPrivateKey: faucetPrivateKey,
  nullAddress: nullAddress,
  nullPubKey: nullPubKey,
  nullSignature: nullSignature,
  networkCirculatingSupply: networkCirculatingSupply,
  minTransactionFee: minTransactionFee,
  blockReward: blockReward,
  safeConfirmCount: safeConfirmCount
}
