// npx hardhat run scripts/run.js

const main = async () => {
    const [owner, randomPerson] = await hre.ethers.getSigners();
    const domainContractFactory = await hre.ethers.getContractFactory('Domains');
    const domainContract = await domainContractFactory.deploy("tacos");
    await domainContract.deployed();
    console.log("Contract deployed to:", domainContract.address);
    console.log("Contract deployed by:", owner.address);

    let txn = await domainContract.register("matt", { value: hre.ethers.utils.parseEther("0.5") });
    await txn.wait();

    // const domainOwner = await domainContract.getAddress("matt");
    // console.log("Owner of domain matt.tacos:", domainOwner);

    let contractBalance = await hre.ethers.provider.getBalance(
        domainContract.address
    );
    console.log("Contract balance", hre.ethers.utils.formatEther(contractBalance)); //this logs 0.5 
    // console.log("Contract balance", contractBalance) // this logs a big number: 500000000000000000


    //test case
    //try to set a record that doesn't belong to me
    // txn = await domainContract.connect(randomPerson).setRecord("tacos", "haha my domain now!");
    // await txn.wait()'

    //test case
    // //try to rob our contract
    // try {
    //     txn = await domainContract.connect(randomPerson).withdraw();
    //     await txn.wait();
    // } catch (error) {
    //     console.log('Could not rob the contract');
    // }

    // //get the owner's balance
    // let ownerBalance = await hre.ethers.provider.getBalance(owner.address);
    // console.log("Balance of owner before withdrawal:", hre.ethers.utils.formatEther(ownerBalance));


    // //test withdraw
    // txn = await domainContract.withdraw();
    // await txn.wait();

    // //check balances
    // ownerBalance = await hre.ethers.provider.getBalance(owner.address);
    // contractBalance = await hre.ethers.provider.getBalance(
    //     domainContract.address
    // );
    // console.log("Contract balance after withdrawal", hre.ethers.utils.formatEther(contractBalance));
    // console.log("Owner balance after withdrawal", hre.ethers.utils.formatEther(ownerBalance));


    //test case
    //try to register a domain that's already registered
    // txn = await domainContract.register("matt", { value: hre.ethers.utils.parseEther("0.5") });
    // await txn.wait();


    //test case
    //try to register domain longer than 10 characters or <3 characters
    txn = await domainContract.register("hello", { value: hre.ethers.utils.parseEther("0.5") });
    await txn.wait();

    // console.log('----------------')
    // console.log(`Verify by running: npx hardhat verify --network mumbai ${domainContract.address} 'tacos'`);

};

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