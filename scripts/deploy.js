//npx hardhat run scripts/deploy.js --network mumbai

const main = async () => {
    const domainContractFactory = await hre.ethers.getContractFactory('Domains');
    const domainContract = await domainContractFactory.deploy("tacos");
    await domainContract.deployed();

    console.log("Contract deployed to:", domainContract.address);

    let txn = await domainContract.register("matt", { value: hre.ethers.utils.parseEther('0.3') });
    await txn.wait();
    console.log("Minted domain matt.tacos");

    const address = await domainContract.getAddress("matt");
    console.log("Owner of domain matt.tacos:", address);

    const balance = await hre.ethers.provider.getBalance(domainContract.address);
    console.log("Contract balance:", hre.ethers.utils.formatEther(balance));

    console.log('----------------')
    console.log(`Verify by running: npx hardhat verify --network mumbai ${domainContract.address} 'tacos'`);
    
}

const runMain = async () => {
    try {
        await main();
        process.exit(0);
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
};

runMain();