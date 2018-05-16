const EllipticCurve = require('elliptic').ec
const secp256k1 = new EllipticCurve('secp256k1')
const CryptoJs = require('crypto-js')
const Block = require('../Block').Block
const Transaction = require('../Transaction')
const nodeConfig = require('../config/node')

function generateGenesisBlock () {
  let faucetAddress = privateKeyToAddress(nodeConfig.faucetPrivateKey)
  let genesisTimestamp = Date.now()

  let genesisTransaction = new Transaction(
    nodeConfig.nullAddress,
    faucetAddress,
    nodeConfig.networkCirculatingSupply,
    0,
    genesisTimestamp,
    nodeConfig.nullPubKey,
    nodeConfig.nullSignature,
    undefined,
    0,
    true
  )

  let genesisBlock = new Block(
    0,
    [genesisTransaction],
    0,
    undefined,
    nodeConfig.nullAddress,
    undefined,
    0,
    genesisTimestamp,
    undefined
  )

  return genesisBlock
}

function privateKeyToPublicKey (privateKey) {
  let keyPair = secp256k1.keyFromPrivate(privateKey)
  let isOdd = keyPair.getPublic().getY().isOdd()
  let publicKey = keyPair.getPublic().getX() + (isOdd ? '1' : '0')
  return publicKey
}

function publicKeyToAddress (publicKey) {
  return CryptoJs.RIPEMD160(publicKey).toString()
}

function privateKeyToAddress (privateKey) {
  let publicKey = privateKeyToPublicKey(privateKey)
  let address = publicKeyToAddress(publicKey)
  return address
}

function isValidAddress (address) {
  return /^[0-9a-f]{40}$/.test(address)
}

function isValidPublicKey (publicKey) {
  return /^[0-9a-f]{65}$/.test(publicKey)
}

function isValidTransferAmount (amount) {
  if (typeof (amount) !== 'number') {
    return false
  }
  if (!Number.isInteger(amount)) {
    return false
  }

  return (amount >= 0) && (amount <= nodeConfig.networkCirculatingSupply)
}

function isValidFee (fee) {
  if (typeof (fee) !== 'number') {
    return false
  }
  if (!Number.isInteger(fee)) {
    return false
  }

  return fee >= nodeConfig.minTransactionFee
}

function isValidTimestamp (date) {
  const isoTimeRegex =
    /^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{2,6}Z$/

  if (typeof (date) !== 'string') {
    return false
  }
  if (!isoTimeRegex.test(date)) {
    return false
  }

  let d = Date.parse(date)
  if (Number.isNaN(d)) {
    return false
  }

  let year = d.getUTCFullYear()
  return (year >= 2018) && (year <= 2100)
}

function isValidSignatureFormat (signature) {
  if (!Array.isArray(signature)) {
    return false
  }
  if (signature.length !== 2) {
    return false
  }

  return /^[0-9a-f]{1,65}$/.test(signature)
}

function sign (data, privateKey) {
  let keyPair = secp256k1.keyFromPrivate(privateKey)
  let signature = keyPair.sign(data)
  return [signature.r.toString(16), signature.s.toString(16)]
}

function validateSignature (data, publicKey, signature) {
  let keyPair = secp256k1.keyFromPublic(publicKey, 'hex')
  return keyPair.verify(data, {r: signature[0], s: signature[1]})
}


module.exports = {
  generateGenesisBlock: generateGenesisBlock,
  privateKeyToPublicKey: privateKeyToPublicKey,
  publicKeyToAddress: publicKeyToAddress,
  privateKeyToAddress: privateKeyToAddress,
  isValidAddress: isValidAddress,
  isValidPublicKey: isValidPublicKey,
  isValidFee: isValidFee,
  isValidTransferAmount: isValidTransferAmount,
  isValidSignatureFormat: isValidSignatureFormat,
  isValidTimestamp: isValidTimestamp,
  sign: sign,
  validateSignature: validateSignature
}
