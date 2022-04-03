const { expect  } = require("chai");
const { ethers } = require("hardhat");
const {solidity} = require("ethereum-waffle");

describe("Voting", function () {
  let voting
  let acc1
  let acc2
  let owner
  let Voting
  const totalTime = 10;

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

    describe("createElection",function(){
      it("createElection correctly", async function(){
        const zero = 0;
        const tx = await voting.createElection("testVoting")
        const cElection = await voting._election(0)
        //console.log(cElection)
        expect(cElection.description).to.eq("testVoting")
        //console.log(tx)
      
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

        /*await expect(tx)
          .to.emit(voting, "NewElection")
          .withArgs(0);*/
      })
    })

    function delay(ms){
      return new Promise(resolve => setTimeout(resolve,ms))
    }

    describe("addCandidate",function(){
      it("addCandodate correctly", async function(){
        await voting.createElection("testVoting")
        this.timeout(5000)  
        await delay(1000)
      
        await voting
          .addCandidate(0,"Piligrim Ivanivich",acc1.address)
        await voting
          .addCandidate(0,"Mentos Petrivich",acc2.address)

        cElection = await voting._election(0)
        expect(cElection.numberOfCandidate.toString()).to.eq("2")

        cCandidate = await voting._candidate(0,0)
        expect(cCandidate.name).to.eq("Piligrim Ivanivich")
        expect(cCandidate.candidateAddress).to.eq(acc1.address)

        cCandidate = await voting._candidate(0,1)
        expect(cCandidate.name).to.eq("Mentos Petrivich")
        expect(cCandidate.candidateAddress).to.eq(acc2.address)

        //TO DO: Check all require

      })
    })

    describe("vote",function(){
      it("It is possible to vote", async function(){
        await voting.createElection("testVoting")
        await voting.addCandidate(0,"Piligrim Ivanivich",owner.address)
        await voting.addCandidate(0,"Mentos Petrivich",acc2.address)

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
        await voting.addCandidate(0,"Mentos Sergeeich",acc2.address)
        await voting.connect(acc2).vote(0,0, {value: ethers.utils.parseEther("0.02")})
        await voting.connect(acc1).vote(0,1, {value: ethers.utils.parseEther("0.02")})
        await voting.connect(owner).vote(0,1, {value: ethers.utils.parseEther("0.02")})
        
        cCandidate = await voting._candidate(0,0)
        cElection = await voting._election(0)
        cVotes = await voting._votes(0,acc1.address)
        
        await delay(11000)
        await voting.connect(owner).finishElection(0)
        cElection = await voting._election(0)
        expect(cElection.status).to.eq(0)

        //TO DO: Check all param and require
      })
    })



    describe("withdrawComission",function(){
      it("It is possible to withdrawComission", async function(){
        await voting.createElection("testVoting")
        await voting.addCandidate(0,"Piligrim Ivanivich",owner.address)
        await voting.addCandidate(0,"Mentos Petrivich",acc2.address)
        await voting.connect(acc2).vote(0,0, {value: ethers.utils.parseEther("0.02")})
        await voting.connect(acc1).vote(0,1, {value: ethers.utils.parseEther("0.02")})
        await voting.connect(owner).vote(0,1, {value: ethers.utils.parseEther("0.02")})
        
        cCandidate = await voting._candidate(0,1)
        cElection = await voting._election(0)
        cVotes = await voting._votes(1,acc1.address)

        //TO DO: Check all param and require
      })
    })

    
})