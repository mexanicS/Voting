// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract Voting {
  constructor()  {
    owner = msg.sender;
  }

  address public owner;
  uint private Count;

  struct Candidate {
    uint id;
    string name;
    uint totalVotes;
  }

  mapping(uint => Candidate) public candidates;

  modifier requireOwner() {
    require(owner == msg.sender, "No access");
    _;
  }

  function addCandidate(string memory new_name) public requireOwner {
    Count ++;
    candidates[Count] = Candidate(Count, new_name, 0);
  }
}
