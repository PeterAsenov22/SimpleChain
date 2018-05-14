const Block = require('../Block').Block

module.exports.generateGenesisBlock = () => {
  let genesisBlock = new Block(
    0,
    [],
    0,
    undefined,
    '0000000000000000000000000000000000000000',
    undefined,
    0,
    Date.now(),
    undefined
  )

  return genesisBlock
}
