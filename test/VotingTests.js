const { expect,should  } = require("chai");
const { ethers } = require("hardhat");

describe("Voting", function () {
  let voting
  let acc1
  let acc2
  let owner
  let Voting

  beforeEach(async function() {
    [owner, acc1, acc2] = await ethers.getSigners() //от какого имени 
    const Voting = await ethers.getContractFactory("Voting", owner)
    //Voting  = await ethers.getContractFactory('Voting')
    voting = await  Voting.deploy()
    })
    
    //Owner равна адресу подписавшего контракт
    it("Should set the right owner", async function () {
      expect(await voting.owner()).to.equal(owner.address);
    });
});