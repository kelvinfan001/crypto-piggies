const PiggyBank = artifacts.require('../../contracts/PiggyBank.sol');


contract('PiggyBankContract', function () {
    it('views account balance after a successful withdrawal', async function(){
        const accounts = await web3.eth.getAccounts();
        const contract = await PiggyBank.deployed();

        await contract.createPiggyBank(10, {from: accounts[0]});
        await contract.deposit({value: 10*10**18, from: accounts[0]});

        try {
            await contract.withdraw(accounts[1], {from: accounts[0]});
        } catch (error) {
            err = error;
        }

        let accountBalance = await web3.eth.getBalance(accounts[1]) / 10**18; // the account balance of the receiving account

        assert.equal(accountBalance.valueOf(), 110, "Balance in receiving account should be 110");
    });

    it('views contract balance after a deposit', async function(){
        const accounts = await web3.eth.getAccounts();
        const contract = await PiggyBank.deployed();

        await contract.createPiggyBank(10, {from: accounts[0]});
        await contract.deposit({value: 10, from: accounts[0]});

        let contractAddress = contract.address;
        contractBalance = await web3.eth.getBalance(contractAddress);

        assert.equal(contractBalance.valueOf(), 10, "Contract balance should be 10 after deposit.");
    });

    it('initiates contracts', async function(){
        const accounts = await web3.eth.getAccounts();
        const piggyBankContract = await PiggyBank.deployed();

        await piggyBankContract.createPiggyBank(10, {from: accounts[1]});
        let goal = await piggyBankContract.accountsToGoals.call(accounts[1]);
        assert.equal(goal, 10, "owners don't match");
    });


    it('makes a deposit', async function() {
        const accounts = await web3.eth.getAccounts();
        const piggyBankContract = await PiggyBank.deployed();

        await piggyBankContract.createPiggyBank(10, {from: accounts[0]});
        await piggyBankContract.deposit({ value: 1, from: accounts[0] });
        let balance = await piggyBankContract.accountsToBalances.call(accounts[0]);

        assert.equal(balance.valueOf(), 1, "amounts did not match");
    });


    it('tries to withdraw without permission', async function(){
        const accounts = await web3.eth.getAccounts();
        const contract = await PiggyBank.deployed();

        await contract.createPiggyBank(10, {from: accounts[0]});
        await contract.deposit({value: 1, from: accounts[0]});

        try {
            await contract.withdraw(accounts[0], {from: accounts[0]});
        } catch (error) {
            err = error;
        }

        // let balance = await contract.accountsToBalances.call(accounts[0]);

        assert.ok(err instanceof Error, "should not have had permission to withdraw");
    });

    it('withdraws after reaching goal', async function(){
        const accounts = await web3.eth.getAccounts();
        const contract = await PiggyBank.deployed();

        let beforeBalance = await web3.eth.getBalance(contract.address);

        await contract.createPiggyBank(10, {from: accounts[0]});
        await contract.deposit({value: 12, from: accounts[0]});

        try {
            await contract.withdraw(accounts[0], {from: accounts[0]});
        } catch (error) {
            err = error;
        }

        let afterBalance = await web3.eth.getBalance(contract.address);

        assert.equal(afterBalance.valueOf(), beforeBalance.valueOf(), "amounts did not match");
    });

    it('withdraws before reaching goal', async function(){
        const accounts = await web3.eth.getAccounts();
        const contract = await PiggyBank.deployed();

        let beforeBalance = await web3.eth.getBalance(contract.address);

        await contract.createPiggyBank(10, {from: accounts[0]});
        await contract.deposit({value: 8, from: accounts[0]});

        try {
            await contract.withdraw(accounts[0], {from: accounts[0]});
        } catch (error) {
            err = error;
        }

        let afterBalance = await web3.eth.getBalance(contract.address);
        assert.notEqual(afterBalance.valueOf(), beforeBalance.valueOf(), "Balance should not be the same since the " +
            "withdrawal should have failed.");
    });

    it('views balance', async function(){
        const accounts = await web3.eth.getAccounts();
        const contract = await PiggyBank.deployed();

        await contract.createPiggyBank(10, {from: accounts[0]});
        await contract.deposit({value: 8, from: accounts[0]});

        let balance = await contract.viewBalance({from: accounts[0]});
        assert.equal(balance, 8, "Balance in this piggy bank should be 8.");
    });

    it('views balance after a successful withdrawal', async function(){
        const accounts = await web3.eth.getAccounts();
        const contract = await PiggyBank.deployed();

        await contract.createPiggyBank(10, {from: accounts[0]});
        await contract.deposit({value: 10, from: accounts[0]});

        try {
            await contract.withdraw(accounts[0], {from: accounts[0]});
        } catch (error) {
            err = error;
        }

        try {
            await contract.viewBalance({from: accounts[0]});
        } catch (error) {
            err = error;
        }


        assert.ok(err instanceof Error, "Balance in piggy bank should be destroyed after being withdrawn and thus cannot be viewed.");
    });
});