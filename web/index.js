if (typeof web3 != 'undefined') {
    web3 = new Web3(web3.currentProvider);
} else {
    web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:9545"));
}

var contractAddress = web3.utils.toChecksumAddress('');

var version = web3.version;
console.log("using web3 version: " + version);

var PiggyBankContract = new web3.eth.Contract(abi, contractAddress);

console.log(PiggyBankContract);

var account, piggyInfo;

account = window.localStorage.getItem("account");

if (account) {
    piggyInfo = getPiggy(account)
}

function getPiggy(account) {
    var goal, balance;
    PiggyBankContract.methods.viewGoal().call({from: account},
        (error, result) => {
            if (error) {
                console.log("view goal error: " + error);
            } else {
                goal = result;
                PiggyBankContract.methods.viewBalance().call({from: account},
                    (error, result) => {
                        if (error) {
                            console.log("view balance error " + error);
                        } else {
                            balance = result;
                            return {"goal": goal, "balance": balance};
                        }
                    })
            }
        });
}

$('#create-form').submit(function () {
    event.preventDefault();
    // var creatorAddress = $('#creatorAddress').val();
    var goal = $('#goal').val();

    if (web3.utils.isAddress(account) != true) {
        alert('You did not enter a proper address');
        return;
    }

    if (goal == 0) {
        alert('Your goal cannot be 0.');
        return;
    }

    PiggyBankContract.methods.createPiggyBank(web3.utils.toWei(goal, 'ether')).send({from: account},
        function (error, result) {
            if (error) {
                console.log("error:" + error);
                // if account has piggyInfo but not in localstorage
            } else {
                // account = creatorAddress;
                // localStorage.setItem("account", account);
                // piggyInfo = {"goal": goal, "balance": 0};
                piggyInfo.goal = goal;
                $('#create-result').html('Piggy Bank successfully created: ' + result);
            }
        })//.bind(localstorage);
});

$('#deposit-form').submit(function () {
    event.preventDefault();
    // var fromAddress = $('#fromAddress').val();
    var amount = $('#amount').val();

    // the following conditional should actually be redundant, but we will leave it here for now.
    if (web3.utils.isAddress(account) != true) {
        alert('You did not enter a proper address');
        return;
    }

    if (amount == 0) {
        alert('Please put in more than 0 in your piggy bank.');
        return;
    }

    PiggyBankContract.methods.deposit().send({from: account, value: web3.utils.toWei(amount, 'ether')},
        function (error, result) {
            if (error) {
                console.log("error: " + error);
            } else {
                // oldBalance = account.piggie.balance;
                // account.piggie.balance = oldBalance + amount;
                piggyInfo.balance += amount; // update piggyInfo's balance
                $('#deposit-result').html('Successful Transaction: <b>' + result + '</b>');
            }
        });
});

// TODO: !!!! is the following form redundant under the current design of our UI?
$('#get-balance-form').submit(function () {
    event.preventDefault();
    var addressBalance = $('#addressBalance').val();

    if (web3.utils.isAddress(addressBalance) != true) {
        alert('You did not enter a proper address');
        return;
    }

    PiggyBankContract.methods.viewBalance().call({from: addressBalance},
        function (error, result) {
            if (error) {
                console.log("error: " + error);
                $('#the-balance').html('<b>This address does not have a piggyInfo bank.</b>');
            } else {
                console.log("balance: " + result);
                $('#the-balance').html('<b>Current Balance: </b>' + web3.utils.fromWei(result, "ether"));
            }
        });
});

$('#withdraw-form').submit(function () {
    event.preventDefault();

    var withdrawFromAddress = account;
    var withdrawToAddress = $('#withdrawToAddress').val();

    PiggyBankContract.methods.withdraw(withdrawToAddress).send({from: withdrawFromAddress, gas: 3000000},
        function (error, result) {
            if (error) {
                console.log("Bad stuff happened: " + error);
                $('#withdraw-message').html('You have not reached your goal.');
            } else {
                piggyInfo.balance = 0;
                $('#withdraw-message').html('Withdraw successful!');
            }
        });
});

$('#account-prompt').submit(function () {
    event.preventDefault();
    var input = $('account').val();

    localStorage.setItem("account", input);
});