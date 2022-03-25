// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract Voting {
  constructor()  {
    owner = msg.sender;
  }

  address public owner;
  uint private Count;
  uint _end;
  uint _start;
  uint totalTime = 86400;
  bool timesUp = false;


  //uint public votingTime = 72;

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

  modifier timerOver() {
    require(block.timestamp<=_end, "Voting time is up.");
    _;
  }

  function time ()  public requireOwner{
    _start = block.timestamp;
    _end = totalTime+_start;
    if (block.timestamp<=_end)
    timesUp = true;
    
  }

  function getTimerLeft() public timerOver view returns(uint) {
    return _end - block.timestamp;
  }

  function startVote() public requireOwner {
    timesUp = false;
    time();
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

  function showVotes(uint candidateId) public view returns  (uint) {
    return candidates[candidateId].totalVotes;
  }

  function searchMax() public {

  }

  function withdrawCommission () public {

  }
  
  //TO DO: Найти победителя
  /*function endOfVoting (address payable _to) public  {
    if(timesUp = true){
      _to.transfer(address));
    }
  }*/
 }
