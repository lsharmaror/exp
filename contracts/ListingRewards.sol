import "./Rating.sol";

pragma solidity ^0.4.15;
/*********************************************************************************************
* This Contract keeps track of pending reward requests and their status
*
* (r) = Reward cost
* (d) = deposit cost
* (v) = veto cost
* (a) = appeal cost
*
* Verified listees only can make claims for a reward (r), they post (d) * ETH/REX rate as deposit
* separate UI process can be used to validate reward requests
* Other verified users can veto withdraw with (v) ETH deposit and get their (v) ETH + (d + r / num(vetos) back, listee looses (d + r)
* Verified listee can appeal for another (a) ETH
*  If Listee wins, gets (d + a + r) ETH back, Vetos loose their (v) ETH which goes to REX
*  If Vetos win, get their (v + (d + r / num(vetos)), Listee looses (d + a + r) ETH, REX gets (a)
*
* A typical successful claim scenario looks like this
*  Listee submits reward claim for (r) rewards (capped at 5), deposits (d)
*  After 14 day (r) and (d) is available for withdraw
* 
* A protracted scenario looks like this
*  Listee submits fraudulent claim for (r) rewards, deposits (d)
*  Verified listee submits a Veto within the 14 days (v), original Listee has 1 * 7 days to appeal
*  Listee submits appeal (a)
*  Rex to decide, submits tx with outcome.  (d + v + a + r) are available for withdraw to winner
*********************************************************************************************/


contract StandardToken {
    function transferFrom(address from, address to, uint amount) returns (bool);
}


contract ListingRewards is Rating {

    function version() constant returns (bytes32) {
        return "0.2.2-debug";
    }

    struct listeeStruct {
        uint lastBlockClaimed;
        uint requestIdx;
        uint balance;
    }

    struct vetosStruct {
        mapping (address => vetosState) vetos; // Bool value will check if the user is eligible to withdraw
        uint numberOfVetos;
        uint numberOfWithdrawn;
    }

    struct listingRewardRequestsStruct {
        address listeeAddress;
        uint fromBlock;
        uint toBlock;
        uint newListings;
        uint amount;
        uint dateCreated;
        uint deposit;
        vetosStruct vetosInFavor;
        vetosStruct vetosAgainst;
        uint vetoDateCreated;
    }

    vetoType winner;

    //ADDRESSES

    address creator;
    address coordinator;

    uint public rewardAmount;
    uint public depositAmount;
    uint public trustAmount;

    // MAPPINGS

    mapping (address => listingRewardRequestsStruct) requests;
    mapping (address => listeeStruct) listees;
    // mapping (address => address[]) vetosAgainstToRequestMapping;
    // mapping (address => address[]) vetosInFavorToRequestMapping;

    // ENUMS

    enum vetosState {NotActive, Created, Withdrawn}
    enum RequestEventTypes {New, Cancel, Payout, Vetoed, Appeal, Verdict}
    enum vetoType {Pending, InFavor, Against, Tie}
    enum userType {Listee, Voter}

    // EVENTS

    event RewardAmountChanged(uint newAmount);
    event DepositAmountChanged(uint newAmount);
    event NumberOfVotes(uint number);
    event RequestEvent(RequestEventTypes eventType, address idx, uint amount);
    // MODIFIERS

    modifier isOwner {
        require(msg.sender == creator);
        _;
    }

    modifier isValidAddress {
        require(msg.sender != 0x00);
        _;
    } 

    modifier isValidListeeAddress(address _listeeAddress) {
        require(requests[_listeeAddress].listeeAddress != 0x00);
        _;
    }

    //CTOR
    function ListingRewards(address coordinatorAddress, uint initialRewardAmount, uint initialDepositAmount) {
        winner = vetoType.Pending;
        creator = msg.sender;
        coordinator = coordinatorAddress;
        updateRewardAmount(initialRewardAmount);
        updateDepositAmount(initialDepositAmount);
    }

    //For testing
    //Add Listee

    function addListee(uint idx) returns (uint) {
        listees[msg.sender].lastBlockClaimed = 0;
        listees[msg.sender].requestIdx = idx;
        listees[msg.sender].balance = 0;
        return listees[msg.sender].requestIdx;
    }

    //For testing

    function getRequestID() returns (address) {
        return requests[msg.sender].listeeAddress;
    }


    //Listing Reward Amount

    function updateRewardAmount(uint newAmount) isOwner {
        rewardAmount = newAmount;
        RewardAmountChanged(newAmount);
    }

    //Deposit Amount

    function updateDepositAmount(uint newAmount) isOwner {
        depositAmount = newAmount;
        trustAmount = (depositAmount * 10) / 100;
        DepositAmountChanged(newAmount);
    }

    // New Reward Request
    
    function newRewardRequest(uint newListings) payable {
        require(requests[msg.sender].listeeAddress == 0x00);
        require(msg.value >= depositAmount);

        requests[msg.sender].listeeAddress = msg.sender;
        // requests[msg.sender].fromBlock = listees[msg.sender].lastBlockClaimed + 1;
        // requests[msg.sender].toBlock = block.number;
        requests[msg.sender].newListings = newListings;
        requests[msg.sender].dateCreated = now;
        requests[msg.sender].deposit = depositAmount;

        // if (ratingInfo[msg.sender].numOfActions == 0) {
        //     setRatingInfo(msg.sender);
        // }
        // incrementUserAction(msg.sender);

        RequestEvent(RequestEventTypes.New, msg.sender, 0);
    }

    function cancelRewardRequest() payable isValidListeeAddress(msg.sender) {

        require(requests[msg.sender].vetosAgainst.numberOfVetos == 0);
        // Avoid reentrancy 
        //clear the data
        requests[msg.sender].listeeAddress = 0x00;

        //send listee their deposit back
        msg.sender.transfer(requests[msg.sender].deposit);

        //raise the event
        RequestEvent(RequestEventTypes.Cancel, msg.sender, requests[msg.sender].deposit);
    }

    function flagListing(address listeeAddress) payable isValidAddress isValidListeeAddress(listeeAddress) {

        require(msg.sender != listeeAddress);
        require(requests[listeeAddress].vetosAgainst.numberOfVetos == 0);
        // Check if it's 14 days past reward request
        require(now - requests[listeeAddress].dateCreated <= (14 days));
        // take 10% of deposit amount
        require(msg.value >= trustAmount);

        requests[listeeAddress].vetoDateCreated = now;

        vetosStruct storage vetoAgainstObject = requests[listeeAddress].vetosAgainst;
        vetosStruct storage vetoInfavorObject = requests[listeeAddress].vetosInFavor;

        vetoAgainstObject.vetos[msg.sender] = vetosState.Created;
        // vetosAgainstToRequestMapping[listeeAddress].push(msg.sender);

        vetoInfavorObject.vetos[requests[listeeAddress].listeeAddress] = vetosState.Created;
        // vetosInFavorToRequestMapping[listeeAddress].push(listeeAddress);

        vetoAgainstObject.numberOfVetos = 1;
        vetoInfavorObject.numberOfVetos = 1;

        // if (ratingInfo[msg.sender].numOfActions == 0) {
        //     setRatingInfo(msg.sender);
        // }
        // incrementUserAction(msg.sender);
    }

    function isValidVoteRequest(address listeeAddress) isValidAddress isValidListeeAddress(listeeAddress) {
        // Avoid self veto
        require(msg.sender != listeeAddress);
        // Check if it's 1 * 7 days past reward request and check for a tie too
        if ((now - requests[listeeAddress].vetoDateCreated > (1 * 7 days)) && checkForVetoWinner(listeeAddress) == vetoType.Tie) {
            require(now - requests[listeeAddress].vetoDateCreated <= (1 * 10 days));
        } else {
            require(now - requests[listeeAddress].vetoDateCreated <= (1 * 7 days));
        }

        // take 10% of deposit amount
        require(msg.value >= trustAmount);
    }

    function voteInFavorOfListing(address listeeAddress) payable {
        isValidVoteRequest(listeeAddress);
        // Check if its 1 * 7 days past the first veto request
        vetosStruct storage vetoInfavorObject = requests[listeeAddress].vetosInFavor;
        require(vetoInfavorObject.numberOfVetos != 0);
        // Check if the veto already exist
        require(vetoInfavorObject.vetos[msg.sender] == vetosState.NotActive);
        require(requests[listeeAddress].vetosAgainst.vetos[msg.sender] == vetosState.NotActive);
        vetoInfavorObject.vetos[msg.sender] = vetosState.Created;
        // vetosInFavorToRequestMapping[listeeAddress].push(msg.sender);
        vetoInfavorObject.numberOfVetos += 1;

        // if (ratingInfo[msg.sender].numOfActions == 0) {
        //     setRatingInfo(msg.sender);
        // }
        // incrementUserAction(msg.sender);

        RequestEvent(RequestEventTypes.Vetoed, listeeAddress, 0);
    }

    function voteAgainstListing(address listeeAddress) payable {
        isValidVoteRequest(listeeAddress);
        vetosStruct storage vetoAgainstObject = requests[listeeAddress].vetosAgainst;
        require(vetoAgainstObject.numberOfVetos != 0);
        // Check if the veto already exist
        require(vetoAgainstObject.vetos[msg.sender] == vetosState.NotActive);
        require(requests[listeeAddress].vetosInFavor.vetos[msg.sender] == vetosState.NotActive);
        vetoAgainstObject.vetos[msg.sender] = vetosState.Created;
        // vetosAgainstToRequestMapping[listeeAddress].push(msg.sender);
        vetoAgainstObject.numberOfVetos += 1;

        // if (ratingInfo[msg.sender].numOfActions == 0) {
        //     setRatingInfo(msg.sender);
        // }
        // incrementUserAction(msg.sender);

        RequestEvent(RequestEventTypes.Vetoed, listeeAddress, 0);
    }

    function listeePayout() payable isValidListeeAddress(msg.sender) {
        // NOTE: Check if the vetos exist for the listee
        require(requests[msg.sender].vetosAgainst.numberOfVetos == 0);

        require(now - requests[msg.sender].dateCreated > (14 days));

        // Avoid reentrancy 
        //clear the data
        requests[msg.sender].listeeAddress = 0x00;

        // setUserRating(msg.sender, 100);
        //send listee their deposit back
        msg.sender.transfer(rewardAmount);
        // address tokenAddress = 0x1234567890;
        //     if (!StandardToken(tokenAddress).transferFrom(msg.sender, this, rewardAmount))
        //         revert();
        RequestEvent(RequestEventTypes.Payout, msg.sender, depositAmount);
    }

    // function getVetoAgainstRequests(address listeeAddress) isValidListeeAddress(listeeAddress) returns (address[]) {
    //     if (checkForVetoWinner(listeeAddress) == vetoType.Tie) {
    //         require(now - requests[listeeAddress].vetoDateCreated > (1 * 10 days));
    //     } else {
    //         require(now - requests[listeeAddress].vetoDateCreated > (1 * 7 days));
    //     }
    //     return vetosAgainstToRequestMapping[listeeAddress];
    // }

    // function getVetoInFavorRequests(address listeeAddress) isValidListeeAddress(listeeAddress) returns (address[]) {
    //     if (checkForVetoWinner(listeeAddress) == vetoType.Tie) {
    //         require(now - requests[listeeAddress].vetoDateCreated > (1 * 10 days));
    //     } else {
    //         require(now - requests[listeeAddress].vetoDateCreated > (1 * 7 days));
    //     }
    //     return vetosInFavorToRequestMapping[listeeAddress];
    // }

    function vetoPayoutValidation(address listeeAddress) isValidAddress {

        require(requests[listeeAddress].vetosAgainst.numberOfVetos != 0);
    }

    function getNumberOfVotesInFavor(address listingAddress) isValidListeeAddress(listingAddress) returns (uint) {
        if (checkForVetoWinner(listingAddress) == vetoType.Tie) {
            require(now - requests[listingAddress].vetoDateCreated > (1 * 10 days));
        } else {
            require(now - requests[listingAddress].vetoDateCreated > (1 * 7 days));
        }
        NumberOfVotes(requests[listingAddress].vetosInFavor.numberOfVetos);
        return requests[listingAddress].vetosInFavor.numberOfVetos;
    }

    function getNumberOfVotesAgainst(address listingAddress) isValidListeeAddress(listingAddress) returns (uint) {
        if (checkForVetoWinner(listingAddress) == vetoType.Tie) {
            require(now - requests[listingAddress].vetoDateCreated > (1 * 10 days));
        } else {
            require(now - requests[listingAddress].vetoDateCreated > (1 * 7 days));
        }
        NumberOfVotes(requests[listingAddress].vetosAgainst.numberOfVetos);
        return requests[listingAddress].vetosAgainst.numberOfVetos;
    }

    function vetoWinner(address listeeAddress) internal returns (vetoType) {
        if (requests[listeeAddress].vetosInFavor.numberOfVetos > requests[listeeAddress].vetosAgainst.numberOfVetos) {
            return winner = vetoType.InFavor;
        } else if (requests[listeeAddress].vetosInFavor.numberOfVetos < requests[listeeAddress].vetosAgainst.numberOfVetos) {
            return winner = vetoType.Against;
        } else {
            return winner = vetoType.Tie;
        }
    }

    function checkForVetoWinner(address listingAddress) returns (vetoType) {
        require(now - requests[listingAddress].vetoDateCreated > (1 * 7 days));
        if (winner == vetoType.Tie) {
            if (now - requests[listingAddress].vetoDateCreated > (1 * 10 days)) {
                return vetoWinner(listingAddress);
            } else {
                return vetoType.Tie;
            }
        } else { 
            return vetoWinner(listingAddress);
        }
    }

    function vetosInFavorPayout(address listingAddress) {

        vetoPayoutValidation(listingAddress);
        // Check for the winner
        require(checkForVetoWinner(listingAddress)==vetoType.InFavor);

        uint amount;
        require((requests[listingAddress].vetosInFavor.vetos[msg.sender]==vetosState.Created));
        // Avoid reentrancy
        if (msg.sender == requests[listingAddress].listeeAddress) {
            amount = (rewardAmount);
            // setUserRating(msg.sender, 100);
        } else {
            amount = (trustAmount*(requests[listingAddress].vetosAgainst.numberOfVetos - 1))/(requests[listingAddress].vetosInFavor.numberOfVetos - 1) + trustAmount;
            // setUserRating(msg.sender, 100);
        }
        requests[listingAddress].vetosInFavor.vetos[msg.sender] = vetosState.Withdrawn;

        msg.sender.transfer(amount);
        
        // address tokenAddress = 0x1234567890;
        // if (!StandardToken(tokenAddress).transferFrom(msg.sender, this, rewardAmount/requests[idx].vetos.numberOfVetos))
        //     revert();
        RequestEvent(RequestEventTypes.Payout, listingAddress, amount);
        checkNumberOfWithdraws(listingAddress, requests[listingAddress].vetosInFavor);

    }

    function vetosAgainstPayout(address listingAddress) {

        vetoPayoutValidation(listingAddress);
        // Check for the winner
        require(checkForVetoWinner(listingAddress)==vetoType.Against);
        require(requests[listingAddress].vetosAgainst.vetos[msg.sender] == vetosState.Created);
        // Avoid reentrancy
        uint inFavorOfListing = requests[listingAddress].vetosInFavor.numberOfVetos;
        uint againstListing = requests[listingAddress].vetosAgainst.numberOfVetos;
        uint amount = ( trustAmount*(inFavorOfListing - 1))/againstListing + trustAmount;
        requests[listingAddress].vetosAgainst.vetos[msg.sender] = vetosState.Withdrawn;

        // setUserRating(msg.sender, 100);

        msg.sender.transfer(amount);
        
        // address tokenAddress = 0x1234567890;
        // if (!StandardToken(tokenAddress).transferFrom(msg.sender, this, rewardAmount/requests[idx].vetos.numberOfVetos))
        //     revert();
        RequestEvent(RequestEventTypes.Payout, listingAddress, amount);
        checkNumberOfWithdraws(listingAddress, requests[listingAddress].vetosAgainst);

    }

    function vetosTiePayout(address listingAddress) {
        vetoPayoutValidation(listingAddress);
        require(now - requests[listingAddress].vetoDateCreated > (1 * 10 days));
        require(checkForVetoWinner(listingAddress) == vetoType.Tie);
        require((requests[listingAddress].vetosInFavor.vetos[msg.sender]==vetosState.Created) || (requests[listingAddress].vetosAgainst.vetos[msg.sender]==vetosState.Created));

        uint amount;
        if (msg.sender == requests[listingAddress].listeeAddress) {
            amount = depositAmount;
        } else {
            amount = trustAmount;
        }
        if (requests[listingAddress].vetosInFavor.vetos[msg.sender] == vetosState.Created) {
            requests[listingAddress].vetosInFavor.vetos[msg.sender] = vetosState.Withdrawn;
        } else {
            requests[listingAddress].vetosAgainst.vetos[msg.sender] = vetosState.Withdrawn;
        }
        msg.sender.transfer(amount);
        RequestEvent(RequestEventTypes.Payout, listingAddress, amount);
    }

    function checkNumberOfWithdraws(address listingAddress, vetosStruct veto) internal {
        if (veto.numberOfWithdrawn == veto.numberOfVetos) {
            requests[listingAddress].listeeAddress = 0x00;
        } else {
            veto.numberOfWithdrawn += 1;
        }
    }

    function returnEth(address _to) isOwner {
        if (!_to.send(this.balance)) revert();
    }
}
