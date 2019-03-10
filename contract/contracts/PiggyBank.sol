pragma solidity ^0.5.0;

/** @title Piggy Bank. */
contract PiggyBank {

    mapping(address => uint256) public accountsToGoals;
    mapping(address => uint256) public accountsToBalances;


    /** @dev Creates a new piggyInfo bank with a goal that must be reached before being able to withdraw.
      * @param _goal Goal to be reached before being allowed to withdraw.
      */
    function createPiggyBank(uint256 _goal) public {
        require(_goal > 0, "Your goal must be greater than 0."); // make sure that specified goal is greater than 0.
        require(accountsToGoals[msg.sender] == 0, "You must not have a piggy bank.");
        accountsToBalances[msg.sender] = 0;
        accountsToGoals[msg.sender] = _goal;
    }

    /** @dev Deposits into sender's piggyInfo bank, if it exists.
      */
    function deposit() external payable {
        require(msg.value > 0, "You cannot deposit 0."); // make sure that user is depositing more than 0.
        require(accountsToGoals[msg.sender] != 0); // require sender to have a piggyInfo bank.
        accountsToBalances[msg.sender] += msg.value;

        // use something such as Oracleize to make an HTTP request that will call the following bash command
//        curl 'https://services.totlesystem.com' -X POST \
//
//        -H 'Accept: application/json, text/plain, */*' \
//
//        -H 'Content-Type: application/json;charset=UTF-8' \
//
//        --data-binary ‘{
//
//            "address": // address of our piggy bank smart contract,
//
//            "swap": {
//
//            “from”: // ether,
//
//            “to”: // some sort of stable coin, such as Dai,
//
//            “amount”: // deposit amount,
//
//            "minFillPercent": 100
//
//            "minSlippagePercent": 3
//
//          },
//
//        "breakdown": true
//
//        }' //

    }

    /** @dev Withdraws from sender's piggyInfo bank and deposits that into a specified account.
      * @param _receiver The account to deposit the withdrew money into.
      */
    function withdraw(address payable _receiver) external {
        uint256 goal = accountsToGoals[msg.sender];
        uint256 balance = accountsToBalances[msg.sender];

        require(balance >= goal, "You have not reached your goal yet."); // make sure that the goal has been reached.
        accountsToBalances[msg.sender] = 0;
        accountsToGoals[msg.sender] = 0;
        _receiver.transfer(balance);
    }

    /** @dev Function to view the current balance in sender's piggyInfo bank.
      * @return Returns the current balance in sender's piggyInfo bank.
      */
    function viewBalance() public view returns(uint256) {
//        require(accountsToGoals[msg.sender] != 0); // require sender to have a piggyInfo bank
        return accountsToBalances[msg.sender];
    }

    function accountHasPiggy() view public returns(bool){
        return accountsToGoals[msg.sender] != 0;
    }

    function viewGoal() view public returns(uint256){
        return accountsToGoals[msg.sender];
    }

}
