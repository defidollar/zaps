const { expect } = require("chai");
const { network } = require("hardhat");
const { BigNumber } = ethers

const _1e6 = BigNumber.from(10).pow(6)
const ZERO = BigNumber.from(0)

const usdtWhale = '0xbe0eb53f46cd790cd13851d5eff43d12404d33e8'

describe('Zap', function() {
    before('setup contracts', async function() {
        await network.provider.request({
            method: 'hardhat_reset',
            params: [{
                forking: {
                    jsonRpcUrl: `https://eth-mainnet.alchemyapi.io/v2/${process.env.ALCHEMY}`,
                    blockNumber: 11841010
                }
            }]
        })
        ;([ dai, tether, dusd, ibdusd, Zap ] = await Promise.all([
            ethers.getContractAt('IERC20', '0x6B175474E89094C44Da98b954EedeAC495271d0F'),
            ethers.getContractAt('IERC20', '0xdAC17F958D2ee523a2206206994597C13D831ec7'),
            ethers.getContractAt('IERC20', '0x5BC25f649fc4e26069dDF4cF4010F9f706c23831'),
            ethers.getContractAt('IbDUSD', '0x42600c4f6d84aa4d246a3957994da411fa8a4e1c'),
            ethers.getContractFactory('Zap')
        ]))
        underlyingCoins = [
            '0x6B175474E89094C44Da98b954EedeAC495271d0F', // dai
            '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // usdc
            '0xdAC17F958D2ee523a2206206994597C13D831ec7', // usdt
            '0x0000000000085d4780B73119b644AE5ecd22b376' // tusd
        ]
        zap = await Zap.deploy(
            '0xbBC81d23Ea2c3ec7e56D39296F0cbB648873a5d3',
            '0x45F783CCE6B7FF23B2ab2D70e416cdb7D6055f51',
            '0xdF5e0e81Dff6FAF3A7e52BA697820c5e32D806A8',
            dusd.address,
            ibdusd.address,
            '0xa89bd606d5dadda60242e8dedeebc95c41ad8986',
            underlyingCoins,
            [
                '0x16de59092dAE5CcF4A1E6439D611fd0653f0Bd01', // ydai
                '0xd6aD7a6750A7593E092a9B218d66C0A814a3436e', // yusdc
                '0x83f798e925BcD4017Eb265844FDDAbb448f1707D', // yusdt
                '0x73a052500105205d34Daf004eAb301916DA8190f' // ytusd
            ]
        )
        signers = await ethers.getSigners()
        alice = signers[0].address
    })

    it('deposit', async function() {
        await impersonateAccount(usdtWhale)
        const amount = _1e6.mul(10)
        await tether.connect(ethers.provider.getSigner(usdtWhale)).transfer(alice, amount)

        await tether.approve(zap.address, amount)
        await zap.deposit([0,0,amount,0], 0);

        expect(await dusd.balanceOf(alice)).to.eq(ZERO)
        expect(await tether.balanceOf(alice)).to.eq(ZERO)
        expect((await ibdusd.balanceOf(alice)).gt(ZERO)).to.be.true
    })

    it('withdraw', async function() {
        const amount = (await ibdusd.balanceOf(alice)).div(2)

        await ibdusd.approve(zap.address, amount)
        await zap.withdraw(amount, 0, 0)

        expect((await dai.balanceOf(alice)).gt(ZERO)).to.be.true
        expect(await tether.balanceOf(alice)).to.eq(ZERO)
        expect(await ibdusd.balanceOf(alice)).to.eq(amount)
    })

    it('withdrawInAll', async function() {
        const amount = await ibdusd.balanceOf(alice)

        expect(await tether.balanceOf(alice)).to.eq(ZERO)

        await ibdusd.approve(zap.address, amount)
        await zap.withdrawInAll(amount, [0,0,0,0])

        underlyingCoins.forEach(async coin => {
            const _coin = await ethers.getContractAt('IERC20', coin)
            expect((await _coin.balanceOf(alice)).gt(ZERO)).to.be.true
        })
        expect(await ibdusd.balanceOf(alice)).to.eq(ZERO)
    })
})

function impersonateAccount(account) {
    return network.provider.request({
        method: 'hardhat_impersonateAccount',
        params: [ account ]
    })
}
