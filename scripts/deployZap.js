async function main() {
    const Zap = await ethers.getContractFactory('Zap')
    const underlyingCoins = [
        '0x55071e80056e01625ee30234fc71c1a07bfa66d1',
        '0xa137041ce05f0c6dd08d58fe1f5ea8107ffed493',
        '0x83492abff02e47ebb38057e925248cfa8d1bd803',
        '0xd2e3a2c8326625c9584217ad83833d7e766ec528'
    ]
    await Zap.deploy(
        '0xffe0569dc0e5c40bdf83f06b002f80031689073b',
        '0x527981e3cb24413d58cfb68ce1d4d4488ef7003f',
        '0xeac1740e7f57b1e3e4a1124444e12d359a68039e',
        '0xbA125322A44Aa62b6B621257C6120d39bEA4d6de',
        '0x24698159aE4a46945f014D250089E1156ebce6b5',
        '0x598A96A5b27585D520828931faA74428Dc34bC09',
        underlyingCoins,
        underlyingCoins
    )
}

main()
.then(() => process.exit(0))
.catch(error => {
    console.error(error);
    process.exit(1);
});
