if ( typeof web3 != 'undefined') {
    web3 = new Web3(web3.currentProvider);
} else {
    // web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:9545"));
}

// var contractAddress = web3.utils.toChecksumAddress('0x2203833bAa8576b8D3e7016Ece5197abbc43dAE5');

var version = web3.version;
console.log("using web3 version: " + version);

var PiggyBankContract = new web3.eth.Contract(abi, contractAddress);

console.log(PiggyBankContract);

$('#create-piggy-form').submit(function() {
    event.preventDefault();
    var creatorAddress = $('#creatorAddress').val();
    var goal = $('#goal').val();

    if (web3.utils.isAddress(creatorAddress) != true) {
        alert('You did not enter a proper address');
        return;
    }

    if (goal == 0) {
        alert('Your goal cannot be 0.');
        return;
    }

    PiggyBankContract.methods.createPiggyBank(web3.utils.toWei(goal, 'ether')).send({from: creatorAddress},
        function (error, result) {
            if (error) {
                console.log("error:" + error);
            } else {
                $('#create-result').html('Piggy Bank successfully created: ' + result);
            }
        });
});

$('#contract-form').submit(function() {
    event.preventDefault();
    var fromAddress = $('#fromAddress').val();
    var amount = $('#amount').val();

    if (web3.utils.isAddress(fromAddress) != true) {
        alert('You did not enter a proper address');
        return;
    }

    if (amount == 0) {
        alert('Please put in more than 0 in the piggy bank.');
        return;
    }

    PiggyBankContract.methods.deposit().send({from: fromAddress, value: web3.utils.toWei(amount, 'ether')},
        function(error, result){
            if (error){
                console.log("error:" + error);
            } else {
                $('#deposit-result').html('Successful Transaction: <b>' + result + '</b>');
            }
        });
});

$('#get-balance-form').submit(function(){
    event.preventDefault();
    var addressBalance = $('#addressBalance').val();

    if (web3.utils.isAddress(addressBalance) != true) {
        alert('You did not enter a proper address');
        return;
    }

    PiggyBankContract.methods.viewBalance().call({from: addressBalance},
        function(error, result) {
            if (error)  {
                console.log("error: " + error);
                $('#the-balance').html('<b>This address does not have a piggy bank.</b>');
            } else {
                console.log("balance: "+ result);
                $('#the-balance').html('<b>Current Balance: </b>' + web3.utils.fromWei(result, "ether"));
            }
        });
});

$('#withdraw-form').submit(function(){
    event.preventDefault();

    var withdrawFromAddress = $('#withdrawFromAddress').val();
    var withdrawToAddress = $('#withdrawToAddress').val();

    PiggyBankContract.methods.withdraw(withdrawToAddress).send({from: withdrawFromAddress, gas: 3000000},
        function(error, result) {
            if (error) {
                console.log("Bad stuff happened: " + error);
                $('#withdraw-message').html('You have not reached your goal.');
            } else {
                $('#withdraw-message').html('Withdraw successful!');
            }
        });
});