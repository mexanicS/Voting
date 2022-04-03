const { expect  } = require("chai");
const { ethers } = require("hardhat");
const {solidity} = require("ethereum-waffle");

describe("Voting", function () {
  let voting
  let acc1
  let acc2
  let owner
  let cComission
  let cDeposit
  let Voting
  const totalTime = 10;
  const zero = 0;

  beforeEach(async function() {
    [owner, acc1, acc2] = await ethers.getSigners() //от какого имени 

    const Voting = await ethers.getContractFactory("Voting", owner)
    voting  = await Voting.deploy()
    await voting.deployed()
    })
    
    //Owner равна адресу подписавшего контракт
    it("Sets owner", async function () {
      expect(await voting.owner()).to.equal(owner.address);
    });

    async function getTimeStamp(bn) {
      return(
        await ethers.provider.getBlock(bn)
      ).timestamp
    }
    function delay(ms){
      return new Promise(resolve => setTimeout(resolve,ms))
    }

    describe("createElection",function(){
      it("createElection correctly", async function(){
        
        const tx = await voting.createElection("testVoting")
        const cElection = await voting._election(0)

        expect(cElection.description).to.eq("testVoting")

      
        const ts =  await getTimeStamp(tx.blockNumber)
   
        const endTimeString = await cElection.endTimeOfElecting.toString()
        let endTimeFactsString = totalTime+ts
        endTimeFactsString = endTimeFactsString.toString()
        expect(endTimeString).to.eq(endTimeFactsString)
        expect(cElection.status).to.eq(1)
        expect(cElection.numberOfVotes.toString()).to.eq(zero.toString())
        expect(cElection.numberOfCandidate.toString()).to.eq(zero.toString())
        expect(cElection.deposit.toString()).to.eq(zero.toString())
        expect(cElection.comission.toString()).to.eq(zero.toString())
      })
    })

    

    describe("addCandidate",function(){
      it("addCandodate correctly", async function(){
        await voting.createElection("testVoting")
        this.timeout(5000)  
        await delay(1000)
      
        await voting
          .addCandidate(0,"Piligrim Ivanivich",acc1.address)
        await voting
          .addCandidate(0,"Mentos Sergeich",acc2.address)

        cElection = await voting._election(0)
        expect(cElection.numberOfCandidate.toString()).to.eq("2")

        cCandidate = await voting._candidate(0,0)
        expect(cCandidate.name).to.eq("Piligrim Ivanivich")
        expect(cCandidate.candidateAddress).to.eq(acc1.address)

        cCandidate = await voting._candidate(0,1)
        expect(cCandidate.name).to.eq("Mentos Sergeich")
        expect(cCandidate.candidateAddress).to.eq(acc2.address)
        //check revert
        /*revertMiss = await voting
          .addCandidate(0,"shadow hero",acc2.address)*/

        //TO DO: Check all require

      })
    })

    describe("vote",function(){
      it("It is possible to vote", async function(){
        await voting.createElection("testVoting")
        await voting.addCandidate(0,"Piligrim Ivanivich",owner.address)
        await voting.addCandidate(0,"Mentos Sergeich",acc2.address)

        voteTx = await voting.connect(acc2).vote(0,0, {value: ethers.utils.parseEther("0.02")})
        cCandidate = await voting._candidate(0,0)
        cElection = await voting._election(0)
        cVotes = await voting._votes(0,acc2.address)

        expect(cElection.numberOfVotes.toString()).to.eq("1")
        expect(cElection.deposit.toString()).to.eq("20000000000000000")
        expect(cVotes.voteAddress).to.eq(acc2.address)
        expect(cVotes.isVoted).to.be.eq(true)
        expect(cCandidate.numberVotes.toString()).to.eq("1")

        await voting.connect(acc1).vote(0,1, {value: ethers.utils.parseEther("0.02")})
        await voting.connect(owner).vote(0,1, {value: ethers.utils.parseEther("0.02")})
        
        cCandidate = await voting._candidate(0,1)
        cElection = await voting._election(0)
        cVotes = await voting._votes(0,acc1.address)

        expect(cElection.numberOfVotes.toString()).to.eq("3")
        expect(cElection.deposit.toString()).to.eq("60000000000000000")
        expect(cVotes.voteAddress).to.eq(acc1.address)
        expect(cVotes.isVoted).to.be.eq(true)

        cVotes = await voting._votes(0,owner.address)
        expect(cVotes.voteAddress).to.eq(owner.address)
        expect(cVotes.isVoted).to.be.eq(true)
        expect(cCandidate.numberVotes.toString()).to.eq("2")
        //TO DO: Check require
      })
    })

    describe("finishElection",function(){
      it("It is possible to finishElection", async function(){
        await voting.createElection("testVoting")
        await voting.addCandidate(0,"Piligrim Ivanivich",owner.address)
        await voting.addCandidate(0,"Mentos Sergeich",acc2.address)
        await voting.connect(acc2).vote(0,0, {value: ethers.utils.parseEther("0.02")})
        await voting.connect(acc1).vote(0,1, {value: ethers.utils.parseEther("0.02")})
        await voting.connect(owner).vote(0,1, {value: ethers.utils.parseEther("0.02")})
      
        cCandidate = await voting._candidate(0,0)
        cVotes = await voting._votes(0,acc1.address)
        
        await delay(11000)
        cDeposit = cElection.deposit
        tx = await voting.connect(owner).finishElection(0)
        
        cElection = await voting._election(0)
        expect(cElection.status).to.eq(0)
        cComission = cDeposit / 10
        cDeposit -= cComission
        expect(cElection.comission.toString()).to.eq(cComission.toString())
        expect(cElection.deposit.toString()).to.eq(zero.toString())
        //TO DO: Check all param and require
      })
    })



    describe("withdrawComission",function(){
      it("It is possible to withdrawComission", async function(){
        await voting.createElection("testVoting")
        await voting.addCandidate(0,"Piligrim Ivanivich",owner.address)
        await voting.addCandidate(0,"Mentos Sergeich",acc2.address)
        await voting.connect(acc2).vote(0,0, {value: ethers.utils.parseEther("0.02")})
        await voting.connect(acc1).vote(0,1, {value: ethers.utils.parseEther("0.02")})
        await voting.connect(owner).vote(0,1, {value: ethers.utils.parseEther("0.02")})

        await delay(6000)
        await voting.connect(owner).finishElection(0)
        //check balance winner
        cCandidate = await voting._candidate(0,1)
        cElection = await voting._election(0)
        cVotes = await voting._votes(1,acc1.address)

        await voting.connect(owner).withdrawComission(0,acc2.address)
        //check balance comisiner
        cElection = await voting._election(0)
        expect(cElection.comission.toString()).to.eq(zero.toString())


      })
    })
    

    describe("viewFunction",function(){
      
      it("listCandidate correctly", async function(){
        await voting.createElection("testVoting")
        await voting.addCandidate(0,"Piligrim Ivanivich",owner.address)
        await voting.addCandidate(0,"Mentos Sergeich",acc2.address)
        await voting.connect(acc2).vote(0,0, {value: ethers.utils.parseEther("0.02")})
        await voting.connect(acc1).vote(0,1, {value: ethers.utils.parseEther("0.02")})
        await voting.connect(owner).vote(0,1, {value: ethers.utils.parseEther("0.02")})
        await delay(6000)
        await voting.connect(owner).finishElection(0)

        
        cCandidate = await voting._candidate(0,1)
        cElection = await voting._election(0)
        cVotes = await voting._votes(1,acc1.address)
        listCandidateTx = await voting.listCandidate(0)


      })

      it("timeLeft correctly", async function(){
        await voting.createElection("testVoting")
        await voting.addCandidate(0,"Piligrim Ivanivich",owner.address)
        await voting.addCandidate(0,"Mentos Sergeich",acc2.address)
        await voting.connect(acc2).vote(0,0, {value: ethers.utils.parseEther("0.02")})
        await voting.connect(acc1).vote(0,1, {value: ethers.utils.parseEther("0.02")})
        await voting.connect(owner).vote(0,1, {value: ethers.utils.parseEther("0.02")})
        
        endTimeTest = await voting.timeLeft(0)
        ts =  await getTimeStamp(endTimeTest.blockNumber)
        endTimeContract = await cElection.endTimeOfElecting - ts
        endTimeContract = await endTimeContract.toString()

        //expect(endTimeTest.toString()).to.eq(endTimeContract)
      })
      
      it("infCandidate correctly", async function(){
        await voting.createElection("testVoting")
        await voting.addCandidate(0,"Piligrim Ivanivich",owner.address)
        await voting.addCandidate(0,"Mentos Sergeich",acc2.address)
        await voting.connect(acc2).vote(0,0, {value: ethers.utils.parseEther("0.02")})
        await voting.connect(acc1).vote(0,1, {value: ethers.utils.parseEther("0.02")})
        await voting.connect(owner).vote(0,1, {value: ethers.utils.parseEther("0.02")})
        await delay(6000)
        await voting.connect(owner).finishElection(0)

        const infCandidateTx= await voting.infCandidate(0,0)
        expect(infCandidateTx.toString()).to.equal("Piligrim Ivanivich,0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266,1");
      })

      it("infVoter correctly", async function(){
        await voting.createElection("testVoting")
        await voting.addCandidate(0,"Piligrim Ivanivich",owner.address)
        await voting.addCandidate(0,"Mentos Sergeich",acc2.address)
        await voting.connect(acc2).vote(0,0, {value: ethers.utils.parseEther("0.02")})
        await voting.connect(acc1).vote(0,1, {value: ethers.utils.parseEther("0.02")})
        await voting.connect(owner).vote(0,1, {value: ethers.utils.parseEther("0.02")})
        await delay(6000)
        await voting.connect(owner).finishElection(0)

        const infVoterTx= await voting.infVoter(0,acc1.address)

        expect(infVoterTx.toString()).to.equal("0x70997970C51812dc3A010C7d01b50e0d17dc79C8,true");
      })

      it("infElection correctly", async function(){
        tx = await voting.createElection("testVoting")

        const ts =  await getTimeStamp(tx.blockNumber)

        await voting.addCandidate(0,"Piligrim Ivanivich",owner.address)
        await voting.addCandidate(0,"Mentos Sergeich",acc2.address)
        await voting.connect(acc2).vote(0,0, {value: ethers.utils.parseEther("0.02")})
        await voting.connect(acc1).vote(0,1, {value: ethers.utils.parseEther("0.02")})
        await voting.connect(owner).vote(0,1, {value: ethers.utils.parseEther("0.02")})
        await delay(6000)
        await voting.connect(owner).finishElection(0)

        await voting.infElection(0)

        cCandidate = await voting._candidate(0,1)
        cElection = await voting._election(0)
        cVotes = await voting._votes(1,acc1.address)

        infElectionTx = await voting.infElection(0)
        cElection = await voting._election(0)
        expect(cElection.description).to.eq("testVoting")

        const endTimeString = await cElection.endTimeOfElecting.toString()
        let endTimeFactsString = totalTime+ts
        endTimeFactsString = endTimeFactsString.toString()

        expect(endTimeString).to.eq(endTimeFactsString)
        expect(cElection.status).to.eq(0)
        expect(cElection.numberOfVotes.toString()).to.eq("3")
        expect(cElection.numberOfCandidate.toString()).to.eq("2")
        expect(cElection.deposit.toString()).to.eq("0")
        expect(cElection.comission.toString()).to.eq("6000000000000000")
      })
      
    })


    
})