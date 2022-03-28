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
  mapping(uint256 => mapping(uint256 => Candidate)) public _candidate;


  mapping(uint256 => Election) public _election;
  mapping(address => uint256[]) private _userVotes;
  mapping(uint256 => address) public _users;

  modifier requireOwner() {
    require(owner == msg.sender, "No access");
    _;
  }

  enum ElectionStatus {
    COMPLETED,
    ACTIVE
  }

  event NewElection(uint256 indexed index);
  event Voted(uint indexed id, address indexed voter);
  event Withdraw(address indexed account, uint256 amount);
  event VotingFinished(uint256 indexed id,ElectionStatus electionStatus,bool callDataStatus);

  struct Candidate {
    string name;
    address adrCandidate;
    uint numberVotes;
  }
  struct Vote {
    bool isVoted;
    address candidateAddress;
    address adrFrom;
  }
  struct Election {
    string description;
    uint256 endTimeOfElecting;
    ElectionStatus status;
    uint256 numberOfVotes;
    uint numberOfCandidate;
  }

  

  function createElection(string memory description) public requireOwner returns (uint256){
    uint256 electionId =_currentElectionId++;

    _election[electionId] = Election({
      description: description,
      endTimeOfElecting: block.timestamp + totalTime,
      status: ElectionStatus.ACTIVE,
      numberOfVotes: 0,
      numberOfCandidate: 0
    });
    emit NewElection(electionId);
    return electionId;
  }

  function addCandidate(uint electionId,string memory _name, address _adrCandidate) public {
    require(_election[electionId].status==ElectionStatus.ACTIVE,"Voting is not ACTIVE");
    //require(_election[electionId].endTimeOfElecting >= block.timestamp,"Start voting first.");
    
    for (uint256 i = 0; i < _election[electionId].numberOfCandidate; i++) {
      //require(condition);
    }

    _candidate[electionId][_election[electionId].numberOfCandidate].name = _name;
    _candidate[electionId][_election[electionId].numberOfCandidate].adrCandidate = _adrCandidate;

    _election[electionId].numberOfCandidate++;
  }

  function vote(uint electionId, uint candidate) public payable {
    require(_currentElectionId >= electionId, "Voting does not exist");
    Election storage election = _election[electionId];
    require(election.endTimeOfElecting >= block.timestamp,"The voting is over");
    require(!_votes[electionId][msg.sender].isVoted,"have you already voted");
    require(msg.value >= .01 ether);
    
    _votes[electionId][msg.sender].isVoted = true;
    _votes[electionId][msg.sender].candidateAddress = _candidate[electionId][candidate].adrCandidate;

    _election[electionId].numberOfVotes++;

    _candidate[electionId][candidate].numberVotes++;

    //_userVotes[msg.sender].push(electionId);

    emit Voted(electionId, msg.sender);
  }

  //Показать список кандидатов
  function infCandidate(uint8 electionId) external view returns (string[] memory){
    string[] memory curentAdrCandidate;
    for (uint256 i = 0; i < _election[electionId].numberOfCandidate; i++) {
    curentAdrCandidate[i] = _candidate[electionId][i].name;
    }
    return curentAdrCandidate;
  }

  //Инфо про любого
  function infOf(uint8 electionId,address candidate) external view returns (Vote memory votes){
    return _votes[electionId][candidate];
  }

  //Инфо про одно из голосований
  function informationOf(uint8 electionId) external view returns (Election memory election){
    return _election[electionId];
  }

  //Завершить голосование
  function finishElection(uint256 electionId) public {
    require(_election[electionId].status == ElectionStatus.ACTIVE,"Proposal is already completed.");
    require(_election[electionId].endTimeOfElecting <= block.timestamp,"Voting is active.");
    _election[electionId].status = ElectionStatus.COMPLETED;

    address winCandidate;
    uint256 maxVotes;
    for (uint256 i = 0; i < _election[electionId].numberOfCandidate; i++) {
      if(_candidate[electionId][i].numberVotes > maxVotes){
        maxVotes == _candidate[electionId][i].numberVotes;
        winCandidate == _candidate[electionId][i].adrCandidate;
      }
    }
    //winCandidate.transfer(address(this).balance);
  }

    
}