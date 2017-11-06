pragma solidity ^0.4.15;


contract Rating {

    struct ratingStruct {
        uint numOfActions;
        uint rating;
    }

    mapping (address => ratingStruct) ratingInfo;

    function getUserRating(address user) returns (uint){
        // should be added after testing
        // require (ratingInfo[user]numOfActions >= 15);
        return ratingInfo[user].rating;
    }

    function setRatingInfo(address user) internal {
        ratingInfo[user].numOfActions = 0;
        ratingInfo[user].rating = 0;
    }

    function incrementUserAction(address user) internal {
        ratingInfo[user].numOfActions += 1;
    }

    function setUserRating(address user, uint rate) internal {
        ratingInfo[user].rating = ((ratingInfo[user].rating * (ratingInfo[user].numOfActions - 1)) + rate)/ratingInfo[user].numOfActions;
    }
}