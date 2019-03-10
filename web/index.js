if (typeof web3 != 'undefined') {
    web3 = new Web3(web3.currentProvider);
} else {
    web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:9545"));
}
var account, piggyGoal, piggyBalance;

if (window.localStorage.getItem("account")) {
    $("#accountPrompt").css("display", "none");
    $("#dashboard").css("display", "flex")
} else {
    $("#accountPrompt").css("display", "flex");
    $("#dashboard").css("display", "none")
}


if(localStorage.getItem("piggyGoal") === "0" || localStorage.getItem("piggyGoal") === null){
    $("#create-piggie-bank").css("display", "")
    $("#create-piggie-bank1").css("display", "none")
}else{
    $("#goal1")[0].innerText = localStorage.getItem("piggyGoal")
    $("#balance")[0].innerText = localStorage.getItem("piggyBalance")
    // $("#").value = localStorage.getItem("piggieGoal")
}

if(localStorage.getItem("piggyGoal") !== "0" && localStorage.getItem("piggyGoal") !== null){
    if(parseInt(localStorage.getItem("piggyBalance")) >= parseInt(localStorage.getItem("piggyGoal"))){
        $("#withdraw-form1").css("display","none");
        $("#withdraw-form").css("display","block");
    }else{
        $("#withdraw-form1").css("display","block");
        $("#withdraw-form").css("display","none");
    }
}


var contractAddress = web3.utils.toChecksumAddress('0xB57201E824D53f24bC98c7987Bc3B0Dcc14120f6');

var version = web3.version;
console.log("using web3 version: " + version);

var PiggyBankContract = new web3.eth.Contract(abi, contractAddress);

console.log(PiggyBankContract);



account = window.localStorage.getItem("account");
piggyGoal = window.localStorage.getItem("piggyGoal");
piggyBalance = window.localStorage.getItem("piggyBalance");


if (account && !(localStorage.getItem("piggyGoal"))) {
    // piggyInfo = getPiggy(account)
    getPiggy(account);
}

function getPiggy(account) {
    var goal, balance;
    PiggyBankContract.methods.viewGoal().call({from: account},
        function (error, result) {
            if (error) {
                console.log("view goal error: " + error);
            } else {
                piggyGoal = result / 10**18;
                localStorage.setItem("piggyGoal", piggyGoal)
                PiggyBankContract.methods.viewBalance().call({from: account},
                    function (error, result) {
                        if (error) {
                            console.log("view balance error " + error);
                        } else {
                            piggyBalance = result / 10**18;
                            localStorage.setItem("piggyBalance", piggyBalance)
                            location.reload();
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
                alert("error:" + error);
                // if account has piggyInfo but not in localstorage
            } else {
                // account = creatorAddress;
                // localStorage.setItem("account", account);
                // piggyInfo = {"goal": goal, "balance": 0};
                piggyGoal = goal;
                localStorage.setItem("piggyGoal",piggyGoal);
                // $('#create-result').html('Piggy Bank successfully created: ' + result);
                location.reload();
            }
        })//.bind(localstorage);
});

$('#deposit-form').on("submit",function () {
    event.preventDefault();
    // var fromAddress = $('#fromAddress').val();
    var amount = parseInt($('#amount').val());

    // the following conditional should actually be redundant, but we will leave it here for now.
    if (web3.utils.isAddress(account) != true) {
        alert('You did not enter a proper address');
        return;
    }

    if (amount == 0) {
        alert('Please put in more than 0 in your piggy bank.');
        return;
    }

    PiggyBankContract.methods.deposit().send({from: account, value: amount * 10**18},
        function (error, result) {
            if (error) {
                console.log("error: " + error);
            } else {
                // oldBalance = account.piggie.balance;
                // account.piggie.balance = oldBalance + amount;
                piggyBalance = parseInt(localStorage.getItem("piggyBalance"));
                piggyBalance += amount; // update piggyInfo's balance
                localStorage.setItem("piggyBalance", piggyBalance);
                location.reload();
                // $('#deposit-result').html('Successful Transaction: <b>' + result + '</b>');
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

$('#withdraw-form').on("click",function () {
    event.preventDefault();

    var withdrawFromAddress = account;
    // var withdrawToAddress = $('#withdrawToAddress').val();

    PiggyBankContract.methods.withdraw(withdrawFromAddress).send({from: withdrawFromAddress, gas: 3000000},
        function (error, result) {
            if (error) {
                console.log("Bad stuff happened: " + error);
                alert('You have not reached your goal.');
                // $('#withdraw-message').html('You have not reached your goal.');
            } else {
                piggyBalance = 0;
                localStorage.setItem("piggyGoal","0");
                localStorage.setItem("piggyBalance","0");
                confirm("Withdraw successful!");
                location.reload();
                // $('#withdraw-message').html('Withdraw successful!');
            }
        });
});

// $('#account-prompt').submit(function () {
//     event.preventDefault();
//     var input = $('#account').val();
//
//     localStorage.setItem("account", input);
//     location.reload();
// });
$('#account-prompt').on("submit", function () {
    event.preventDefault();
    var input = $('#account').val();
    console.log(typeof($('#account').val()))

    localStorage.setItem("account", input);
    location.reload();
});