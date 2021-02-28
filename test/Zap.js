const { expect } = require("chai");
const { BigNumber } = ethers

const util = require('./utils')

const _1e6 = BigNumber.from(10).pow(6)
const ZERO = BigNumber.from(0)

describe('Savings Zap', function() {
    before('setup contracts', async function() {
        ;({ underlyingCoins, dusd, ibdusd, zap } = await util.setupContracts())
        ;([ dai, _, tether] =  underlyingCoins)
        signers = await ethers.getSigners()
        alice = signers[0].address
    })

    it('deposit', async function() {
        const amount = _1e6.mul(10)
        await util.getCoins(tether, alice, amount)

        await tether.approve(zap.address, amount)
        await zap.deposit([0,0,amount,0], 0);

        expect(await dusd.balanceOf(alice)).to.eq(ZERO)
        expect(await tether.balanceOf(alice)).to.eq(ZERO)
        expect((await ibdusd.balanceOf(alice)).gt(ZERO)).to.be.true
    })

    it('withdraw', async function() {
        const bal = await ibdusd.balanceOf(alice)
        const amount = bal.div(2)

        await ibdusd.approve(zap.address, amount)
        await zap.withdraw(amount, 0, 0)

        expect((await dai.balanceOf(alice)).gt(ZERO)).to.be.true
        expect(await tether.balanceOf(alice)).to.eq(ZERO)
        expect(await ibdusd.balanceOf(alice)).to.eq(bal.sub(amount))
    })

    it('withdrawInAll', async function() {
        const amount = await ibdusd.balanceOf(alice)

        expect(await tether.balanceOf(alice)).to.eq(ZERO)

        await ibdusd.approve(zap.address, amount)
        await zap.withdrawInAll(amount, [0,0,0,0])

        underlyingCoins.forEach(async coin => {
            expect((await coin.balanceOf(alice)).gt(ZERO)).to.be.true
        })
        expect(await ibdusd.balanceOf(alice)).to.eq(ZERO)
    })
})
