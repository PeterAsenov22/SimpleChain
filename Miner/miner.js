const axios = require('axios')
const CryptoJs = require('crypto-js')

const program = require('commander')
  .option('-h, --host [host]', 'Node hostname / IP', 'localhost')
  .option('-p, --port [port]', 'Node port number', 5555)
  .option('-a, --address [port]', 'Miner blockchain address',
    '84ede81c58f5c490fc6e1a3035789eef897b5b35')
  .parse(process.argv)
let nodeUrl = `http://${program.host}:${program.port}`
let miningJobUrl = `${nodeUrl}/mining/get-mining-job/${program.address}`
let submitMinedBlockUrl = `${nodeUrl}/mining/submit-mined-block`

async function startMining () {
  while (true) {
    try {
      let nextBlock = (await axios.get(miningJobUrl)).data
      console.log('Taken mining job: ' + JSON.stringify(nextBlock))
      await mine(nextBlock)
      console.log('Mined a block: ' + nextBlock.blockHash)
      let submitResult = (await axios.post(submitMinedBlockUrl, nextBlock)).data
      if (submitResult.message) {
        console.log(submitResult.message)
      } else {
        console.log(submitResult.errorMsg)
      }
    } catch (error) {
      console.log(error)
      if (error.response) {
        console.log('Returned response from node: ' +
                JSON.stringify(error.response.data))
      }
    }
  }
}

async function mine (nextBlock) {
  nextBlock.timestamp = (new Date()).toISOString()
  nextBlock.nonce = 0
  do {
    nextBlock.nonce++
    let data = nextBlock.dataHash + nextBlock.timestamp + nextBlock.nonce
    nextBlock.blockHash = CryptoJs.SHA256(data).toString()
  } while (!isValidDifficulty(nextBlock.blockHash, nextBlock.difficulty))
}

function isValidDifficulty (blockHash, difficulty) {
  for (let i = 0; i < difficulty; i++) {
    if (blockHash[i] !== '0') {
      return false
    }
  }

  return true
}

startMining()
