const config = require('../mainnet.arguments')
const whale = '0x0092081D8E3E570E9E88F4563444bd4B92684502' // doesn't have tusd

async function setupContracts() {
    await network.provider.request({
        method: 'hardhat_reset',
        params: [{
            forking: {
                jsonRpcUrl: `https://eth-mainnet.alchemyapi.io/v2/${process.env.ALCHEMY}`,
                blockNumber: 11933718
            }
        }]
    })
    const underlyingCoins = await Promise.all(config[6].map(address => {
        return ethers.getContractAt('IERC20', address)
    }))
    ;([ dusd, ibdusd, zap ] = await Promise.all([
        ethers.getContractAt('IERC20', config[3]),
        ethers.getContractAt('IbDUSD', config[4]),
        ethers.getContractAt('Zap', '0xde1f578292e75f26dfaebc78aa0eccca45b13521')
        // ethers.getContractFactory('Zap')
    ]))
    // zap = await Zap.deploy(...config)
    await impersonateAccount(whale)
    return { underlyingCoins, dusd, ibdusd, zap }
}

function getCoins(erc20, account, amount) {
    return erc20.connect(ethers.provider.getSigner(whale)).transfer(account, amount)
}

function impersonateAccount(account) {
    return network.provider.request({
        method: 'hardhat_impersonateAccount',
        params: [ account ]
    })
}

module.exports = {
    setupContracts,
    impersonateAccount,
    getCoins
}
