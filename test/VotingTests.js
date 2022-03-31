const { expect  } = require("chai");
const { ethers } = require("hardhat");

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
          "The best contract"
        )

        const cElection = await voting._election(0)
        //console.log(cElection)
        expect(cElection.description).to.eq("The best contract")
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
      })
    })

    function delay(ms){
      return new Promise(resolve => setTimeout(resolve,ms))
    }

    describe("addCandidate",function(){
      it("addCandodate correctly", async function(){
        await voting.createElection(
          "The best contract"
        )
        const cElection = await voting._election(0)
        this.timeout(5000)  
        await delay(1000)
      
        const txAddCandidate = await voting.addCandidate (0,"Stepan Sergeeich",owner.address)
        
        console.log(cElection.numberOfCandidate)
      })
    })

    describe("Vote",function(){
      it("It is possible to vote", async function(){

      })
    })
})