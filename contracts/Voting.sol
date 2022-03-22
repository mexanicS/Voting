// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract Voting {
  constructor()  {
    owner = msg.sender;
  }

  address public owner;
  uint private Count;
  uint public votingTime = 72;

  struct Candidate {
    uint id;
    string name;
    uint totalVotes;
  }

  mapping(uint => Candidate) public candidates;
  mapping(address => bool) private voters;

  event votedEvent (
    uint indexed candidateId
  );

  modifier requireOwner() {
    require(owner == msg.sender, "No access");
    _;
  }

    function createVote() public requireOwner {

  }

  function addCandidate(string memory new_name) public requireOwner {
    Count ++;
    candidates[Count] = Candidate(Count, new_name, 0);
  }

  function vote (uint candidateId) public payable {
    require(candidateId > 0 && candidateId <= Count);
    require(!voters[msg.sender]);
    require(msg.value >= .01 ether);
    voters[msg.sender] = true;
    candidates[candidateId].totalVotes++;
    emit votedEvent(candidateId);
  }

  function withdrawCommission () public {

  }

  function endOfVoting () public requireOwner {

  }
 }
