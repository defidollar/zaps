const { expect } = require("chai");
const { BigNumber } = ethers

const util = require('./utils')

const _1e18 = ethers.constants.WeiPerEther
const _1e6 = BigNumber.from(10).pow(6)
const ZERO = BigNumber.from(0)

describe('YVaultZap', function() {
    before('setup contracts', async function() {
        ;({ underlyingCoins, dusd, zap } = await util.setupContracts())
        signers = await ethers.getSigners()
        alice = signers[0].address
    })

    it('mint', async function() {
        amounts = [_1e18.mul(100), _1e6.mul(100), _1e6.mul(100), 0]
        const tasks = []
        for (let i = 0; i < 3; i++) {
            tasks.push(util.getCoins(underlyingCoins[i], alice, amounts[i]))
            tasks.push(underlyingCoins[i].approve(zap.address, amounts[i]))
        }
        await Promise.all(tasks)

        await zap.mint(amounts, '0')
        for (let i = 0; i < 3; i++) {
            expect(await underlyingCoins[i].balanceOf(alice)).to.eq(ZERO)
        }
        expect((await dusd.balanceOf(alice)).gt(_1e18.mul(300))).to.be.true
    })

    it('redeemInSingleCoin', async function() {
        const amount = (await dusd.balanceOf(alice)).div(2)
        await dusd.approve(zap.address, amount)
        await zap.redeemInSingleCoin(amount, 3, 0)
        for (let i = 0; i < 3; i++) {
            expect(await underlyingCoins[i].balanceOf(alice)).to.eq(ZERO)
        }
        expect((await underlyingCoins[3].balanceOf(alice)).gt(ZERO)).to.be.true
    })

    it('redeem', async function() {
        const amount = await dusd.balanceOf(alice)
        await dusd.approve(zap.address, amount)
        await zap.redeem(amount, [0,0,0,0])
        for (let i = 0; i < 4; i++) {
            expect((await underlyingCoins[i].balanceOf(alice)).gt(ZERO)).to.be.true
        }
        expect(await dusd.balanceOf(alice)).to.eq(ZERO)
    })
})

