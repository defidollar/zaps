const config = require('../mainnet.arguments')

async function main() {
    const Zap = await ethers.getContractFactory('Zap')
    const zap = await Zap.deploy(...config)
    console.log(zap.address)
}

main()
.then(() => process.exit(0))
.catch(error => {
    console.error(error);
    process.exit(1);
});
