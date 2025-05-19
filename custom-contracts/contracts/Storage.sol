// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Storage {
    // This variable will store the number
    uint256 private storedNumber;

    // This event will be emitted whenever the stored number is updated
    event NumberStored(uint256 newNumber);

    // Constructor to initialize the stored number
    constructor(uint256 initialNumber) {
        storedNumber = initialNumber;
        emit NumberStored(initialNumber);
    }

    // Function to store a new number
    function storeNumber(uint256 newNumber) public {
        storedNumber = newNumber;
        emit NumberStored(newNumber);
    }

    // Function to retrieve the stored number
    function retrieveNumber() public view returns (uint256) {
        return storedNumber;
    }
}
