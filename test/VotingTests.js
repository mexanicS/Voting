const { expect  } = require("chai");
const { ethers } = require("hardhat");
const {solidity} = require("ethereum-waffle");

describe("Voting", function () {
  let voting
  let acc1
  let acc2
  let owner
  let Voting
  const totalTime = 259200;

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
        
        const tx = await voting.createElection(
          "testVoting"
        )

        const cElection = await voting._election(0)
        //console.log(cElection)
        expect(cElection.description).to.eq("testVoting")
        //console.log(tx)
      
        const ts =  await getTimeStamp(tx.blockNumber)
   
        const endTimeString = await cElection.endTimeOfElecting.toString()
        let endTimeFactsString = totalTime+ts
        endTimeFactsString = endTimeFactsString.toString()
        expect(endTimeString).to.eq(endTimeFactsString)
        
        const zero = 0;
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
        await voting.createElection(
          "testVoting"
        )
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
        await voting
          .addCandidate(0,"Stepan Sergeeich",owner.address)

        //console.log(cCandidate)
        voteTx = await voting.connect(acc2).vote(0,0, {value: ethers.utils.parseEther("0.02")})
        cCandidate = await voting._candidate(0,0)
        //console.log(cCandidate)

        expect(cCandidate.numberVotes.toString()).to.eq("1")
        
        //cCandidate = await voting._candidate(0,0)
        cElection = await voting._election(0)

        expect(cElection.deposit.toString()).to.eq("20000000000000000")


        //TO DO: Check all param and require
      })
    })
})