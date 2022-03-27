// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract Voting {
  address owner;

  uint256 private _currentElectionId;
  uint256 public totalTime = 3 days;

  constructor()  {
    owner = msg.sender;
  }

  mapping(uint256 => mapping(address => Vote)) private _votes;
  mapping(uint256 => Election) public _election;

  modifier requireOwner() {
    require(owner == msg.sender, "No access");
    _;
  }

  enum ElectionStatus {
    SUCCESSFUL,
    UNSUCCESSFUL,
    ACTIVE
  }

  event NewElection(uint256 indexed index);

  struct Vote {
    uint256 voteNum;
    bool isVoted;
  }

  struct Election {
    string description;
    uint256 endTimeOfElecting;
    ElectionStatus status;
    uint256 numberOfVotes;
  }

  function createElection(string memory description) public requireOwner returns (uint256){
    uint256 electionId =_currentElectionId++;
    _election[electionId] = Election({
      description: description,
      endTimeOfElecting: block.timestamp + totalTime,
      status: ElectionStatus.ACTIVE,
      numberOfVotes: 0
    });

    emit NewElection(electionId);
    return electionId;
  }

  function vote() public payable {

  }

  //Инфо про одно из голосований
  function informationOf(uint8 electionId) external view returns (Election memory election){
    return _election[electionId];
  }

  //
  function finishElection(uint256 electionId) external {

  }

    
}