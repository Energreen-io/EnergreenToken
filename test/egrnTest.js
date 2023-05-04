const { expect } = require("chai");
const { ethers } = require ('hardhat') ;
const provider = ethers.provider ; 


describe("EnergreenToken", function () {
  let EnergreenToken, egrn, owner, addr1, addr2;
  let Reserve = "0x66D9Bb5cC0D8B32C62C46Dfb7376031A497afe70" ;
  let Team  = "0x7F4C6325b0690d98138229C1b2938886ffe10A65" ;
  let Advisor = "0x9c137226d0D4c191F4A680F646dFEb381e7Acee4" ;
  let Listing = "0x656F4EAc864393d61362e24434f8Ad2987543aC3"   ; 
  let Staking = "0xe1C9E85A91f97090f27bE358D03E4Ad28f8F242A"  ;
  let Community = "0x3aca898549cC4863beC8D95362Ecc4030a6ad346" ;  
  let PrivateSale1 = "0xFaC7c87D1777662909b7Bf7e4E7bc0922423229c" ;
  let PrivateSale2 = "0x14530Dd3325CE7D035d231210CC4b2bF5b0ebE88" ;
  let PublicSale = "0x34EcE43178f23F908164651aB673ffbfc26b0b22" ;

  before(async function () {

    [owner, addr1, addr2] = await ethers.getSigners();
    EnergreenToken = await ethers.getContractFactory("EnergreenToken");
    egrn = await EnergreenToken.connect(owner).deploy();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await egrn.owner()).to.equal(owner.address);
    });

    it("Should deployed correctly", async function () {
      expect(await egrn.address).to.be.properAddress;
      //console.log("EnergreenToken deployed to:", egrn.address);
      //console.log("Owner address:", await egrn.owner());
    });

    it("Should set the right token name and symbol", async function () {
      expect(await egrn.name()).to.equal("ENERGREEN");
      expect(await egrn.symbol()).to.equal("EGRN");
      expect(await egrn.decimals()).to.equal(18);
    });

    it("Should set the right initial token supply and balances", async function () {
      const MAX_SUPPLY = ethers.utils.parseEther("200000000");
      expect(await egrn.MAX_SUPPLY()).to.equal(MAX_SUPPLY);
      expect(await egrn.totalSupply()).to.equal(MAX_SUPPLY);
      //console.log("Total supply:", ethers.utils.formatEther(await egrn.totalSupply()));
      //console.log("Max supply:", ethers.utils.formatEther(await egrn.MAX_SUPPLY()));
     // expect(await egrn.balanceOf(egrn.address)).to.equal(MAX_SUPPLY);
    });

    it("Should set the right vesting addresses", async function () {
      expect(await egrn.reserveAddress()).to.equal(Reserve);
      expect(await egrn.teamAddress()).to.equal(Team);
      expect(await egrn.advisorAddress()).to.equal(Advisor);
      expect(await egrn.liquidityAddress()).to.equal(Listing);
      expect(await egrn.stakingAddress()).to.equal(Staking);
      expect(await egrn.marketingAddress()).to.equal(Community);
      expect(await egrn.privateSale1Address()).to.equal(PrivateSale1);
      expect(await egrn.privateSale2Address()).to.equal(PrivateSale2);
      expect(await egrn.idoAddress()).to.equal(PublicSale);
    });

    it("Should set the right initial vesting amounts", async function () {
      expect((await egrn.balanceOf(await egrn.reserveAddress())).toString()).to.equal(ethers.utils.parseEther("75000000")); // 75M
      expect((await egrn.balanceOf(await egrn.teamAddress())).toString()).to.equal(ethers.utils.parseEther("0")); // 0
      expect((await egrn.balanceOf(await egrn.advisorAddress())).toString()).to.equal(ethers.utils.parseEther("0")); // 0
      expect((await egrn.balanceOf(await egrn.liquidityAddress())).toString()).to.equal(ethers.utils.parseEther("3000000")); // 3M
      expect((await egrn.balanceOf(await egrn.stakingAddress())).toString()).to.equal(ethers.utils.parseEther("60000000")); // 60M
      expect((await egrn.balanceOf(await egrn.marketingAddress())).toString()).to.equal(ethers.utils.parseEther("0"));
      expect((await egrn.balanceOf(await egrn.privateSale1Address())).toString()).to.equal(ethers.utils.parseEther("35039.350")); // 35,039.35 K
      expect((await egrn.balanceOf(await egrn.privateSale2Address())).toString()).to.equal(ethers.utils.parseEther("40000")); // 40K
      expect((await egrn.balanceOf(await egrn.idoAddress())).toString()).to.equal(ethers.utils.parseEther("80000")); // 80K
    });

    it("Should set the right vesting amounts", async function () {

      let egrnReserveVesting = await egrn.vestings(await egrn.reserveAddress());
      expect(egrnReserveVesting.amount.mul(egrnReserveVesting.period) ).to.equal(0);
      console.log("Reserve doesn't have vesting") ;

      let egrnTeamVesting = await egrn.vestings(await egrn.teamAddress());
      expect(egrnTeamVesting.amount.mul(egrnTeamVesting.period) ).to.below(ethers.utils.parseEther("20000000"));
      let difference = ethers.utils.parseEther("20000000").sub(egrnTeamVesting.amount.mul(egrnTeamVesting.period) );
      console.log("Team vesting and original wanted difference:", difference , " wei");

      let egrnAdvisorVesting = await egrn.vestings(await egrn.advisorAddress());
      expect(egrnAdvisorVesting.amount.mul(egrnAdvisorVesting.period) ).to.below(ethers.utils.parseEther("6499213"));
      difference = ethers.utils.parseEther("6499213").sub(egrnAdvisorVesting.amount.mul(egrnAdvisorVesting.period) );
      console.log("Advisor vesting and original wanted difference:", difference , " wei");

      let egrnLiquidityVesting = await egrn.vestings(await egrn.liquidityAddress());
      expect(egrnLiquidityVesting.amount.mul(egrnLiquidityVesting.period) ).to.equal(0);
      console.log("Liquidity doesn't have vesting") ;

      let egrnStakingVesting = await egrn.vestings(await egrn.stakingAddress());
      expect(egrnStakingVesting.amount.mul(egrnStakingVesting.period) ).to.equal(0);
      console.log("Staking doesn't have vesting") ;

      let egrnMarketingVesting = await egrn.vestings(await egrn.marketingAddress());
      expect(egrnMarketingVesting.amount.mul(egrnMarketingVesting.period) ).to.below(ethers.utils.parseEther("33000000")); // 33M
      difference = ethers.utils.parseEther("33000000").sub(egrnMarketingVesting.amount.mul(egrnMarketingVesting.period) );
      console.log("Marketing vesting and original wanted difference:", difference , " wei " , ethers.utils.formatEther(difference) , " ether conversion");

      let egrnPrivateSale1Vesting = await egrn.vestings(await egrn.privateSale1Address());
      expect(egrnPrivateSale1Vesting.amount.mul(egrnPrivateSale1Vesting.period) ).to.below(ethers.utils.parseEther("665747.65")); // 665,747.65 K
      difference = ethers.utils.parseEther("665747.65").sub(egrnPrivateSale1Vesting.amount.mul(egrnPrivateSale1Vesting.period) );
      console.log("PrivateSale1 vesting and original wanted difference:", difference , " wei " , ethers.utils.formatEther(difference) , " ether conversion");

      let egrnPrivateSale2Vesting = await egrn.vestings(await egrn.privateSale2Address());
      expect(egrnPrivateSale2Vesting.amount.mul(egrnPrivateSale2Vesting.period) ).to.below(ethers.utils.parseEther("760000")); // 760K
      difference = ethers.utils.parseEther("760000").sub(egrnPrivateSale2Vesting.amount.mul(egrnPrivateSale2Vesting.period) );
      console.log("PrivateSale2 vesting and original wanted difference:", difference , "  wei " , ethers.utils.formatEther(difference) , " ether conversion");

      let egrnIDOAddressVesting = await egrn.vestings(await egrn.idoAddress());
      expect(egrnIDOAddressVesting.amount.mul(egrnIDOAddressVesting.period) ).to.equal(ethers.utils.parseEther("920000")); // 920K
      difference = ethers.utils.parseEther("920000").sub(egrnIDOAddressVesting.amount.mul(egrnIDOAddressVesting.period) );
      console.log("IDO vesting and original wanted difference:", difference , " wei " , ethers.utils.formatEther(difference) , " ether conversion");

    });

    it("Timestamp changers", async function () {
      //console.log("Reserve vesting amount:", (await egrn.vestings(await egrn.privateSale1Address())));
      //let timestamp = (await egrn.vestings(await egrn.privateSale1Address())).vestingTime ;
      //console.log("Reserve vesting timestamp:", timestamp);
      //timestamp = Number( timestamp.toString()) * 1000 ;
      //const date = new Date(timestamp);
      //console.log("Reserve vesting time:", date.toUTCString());
//
      //console.log( "Date" , date.getUTCFullYear() ,( date.getUTCMonth() + 1 ) , date.getUTCDate() , date.getUTCHours() , date.getUTCMinutes() , date.getUTCSeconds() ) ;
//
      //// increase date by 1 UTC month
      //
      //date.setUTCMonth(date.getUTCMonth() + 1);
      //console.log( "Date" , date.getUTCFullYear() , (date.getUTCMonth() + 1) , date.getUTCDate() , date.getUTCHours() , date.getUTCMinutes() , date.getUTCSeconds() ) ;
//
//
      //// increase date by 1 week
//
      //date.setUTCDate(date.getUTCDate() + 7);
      //console.log( "Date" , date.getUTCFullYear() , (date.getUTCMonth() + 1) , date.getUTCDate() , date.getUTCHours() , date.getUTCMinutes() , date.getUTCSeconds() ) ;

      expect((await egrn.vestings(await egrn.reserveAddress())).period).to.equal(0);

    });
  });

  describe("Blacklist", function () {
    it("Should add and remove an address from the blacklist", async function () {
      await egrn.connect(owner).addToBlacklist(addr1.address);
      expect(await egrn.blacklist(addr1.address)).to.be.true;

      await egrn.connect(owner).removeFromBlacklist(addr1.address);
      expect(await egrn.blacklist(addr1.address)).to.be.false;
    });

    it("Should not allow transfers from a blacklisted address", async function () {
      await egrn.connect(owner).addToBlacklist(addr1.address);
      await expect(egrn.connect(addr1).transfer(addr2.address, ethers.utils.parseEther("500"))).to.be.revertedWith("Token transfer not allowed: source address is blacklisted");
    });

    it("Should not allow transfers to a blacklisted address", async function () {
      await egrn.connect(owner).removeFromBlacklist(addr1.address);
      await egrn.connect(owner).addToBlacklist(addr2.address);
      await expect(egrn.connect(addr1).transfer(addr2.address, ethers.utils.parseEther("500"))).to.be.revertedWith("Token transfer not allowed: destination address is blacklisted");
    });
  });


  describe("Token Vesting", function () {
    it("Should not release vesting before the vesting time", async function () {
      await expect(egrn.connect(owner).releaseVesting(await egrn.teamAddress())).to.be.revertedWith("Vesting time is not now.");
      await expect(egrn.connect(owner).releaseVesting(await egrn.advisorAddress())).to.be.revertedWith("Vesting time is not now.");
      await expect(egrn.connect(owner).releaseVesting(await egrn.marketingAddress())).to.be.revertedWith("Vesting time is not now.");
      await expect(egrn.connect(owner).releaseVesting(await egrn.privateSale1Address())).to.be.revertedWith("Vesting time is not now.");
      await expect(egrn.connect(owner).releaseVesting(await egrn.privateSale2Address())).to.be.revertedWith("Vesting time is not now.");
      await expect(egrn.connect(owner).releaseVesting(await egrn.idoAddress())).to.be.revertedWith("Vesting time is not now.");
    });

    it("Should remaining vestings be correct at first", async function () {

      expect(await egrn.connect(owner).getClaimedVestingCountForAddress(await egrn.teamAddress())).to.be.equal(0);
      expect(await egrn.connect(owner).getClaimedVestingCountForAddress(await egrn.advisorAddress())).to.be.equal(0);
      expect(await egrn.connect(owner).getClaimedVestingCountForAddress(await egrn.marketingAddress())).to.be.equal(0);
      expect(await egrn.connect(owner).getClaimedVestingCountForAddress(await egrn.privateSale1Address())).to.be.equal(0);
      expect(await egrn.connect(owner).getClaimedVestingCountForAddress(await egrn.privateSale2Address())).to.be.equal(0);
      expect(await egrn.connect(owner).getClaimedVestingCountForAddress(await egrn.idoAddress())).to.be.equal(0);
      expect(await egrn.connect(owner).getClaimedVestingCountForAddress(await egrn.reserveAddress())).to.be.equal(0);
      expect(await egrn.connect(owner).getClaimedVestingCountForAddress(await egrn.stakingAddress())).to.be.equal(0);
      expect(await egrn.connect(owner).getClaimedVestingCountForAddress(await egrn.liquidityAddress())).to.be.equal(0);

    });

    it("Should set first vesting time cliffs correctly", async function () {
      const teamCliff = 12;
      const advisorCliff = 12;
      const marketingCliff = 1;
      const privateSale1Cliff = 9;
      const privateSale2Cliff = 8;
      const idoCliff = 1;
  
      await checkFirstVestingTime(egrn, egrn.teamAddress(), teamCliff);
      await checkFirstVestingTime(egrn, egrn.advisorAddress(), advisorCliff);
      await checkFirstVestingTime(egrn, egrn.marketingAddress(), marketingCliff);
      await checkFirstVestingTime(egrn, egrn.privateSale1Address(), privateSale1Cliff);
      await checkFirstVestingTime(egrn, egrn.privateSale2Address(), privateSale2Cliff);
      await checkFirstVestingTime(egrn, egrn.idoAddress(), idoCliff);
    });
  
    async function checkFirstVestingTime(egrn, vestingAddressGetter, cliffInMonths) {
      const timestamp = (await egrn.vestings(await vestingAddressGetter)).vestingTime;
      const vestingDate = new Date(Number(timestamp.toString()) * 1000);
  
      const expectedVestingDate = new Date();
      expectedVestingDate.setUTCMonth(expectedVestingDate.getUTCMonth() + cliffInMonths);
      expectedVestingDate.setUTCHours(0);
      expectedVestingDate.setUTCMinutes(0);
      expectedVestingDate.setUTCSeconds(0);
  
      expect(vestingDate.getUTCFullYear()).to.equal(expectedVestingDate.getUTCFullYear());
      expect(vestingDate.getUTCMonth() + 1).to.equal(expectedVestingDate.getUTCMonth() + 1);
      expect(vestingDate.getUTCDate()).to.equal(expectedVestingDate.getUTCDate());
      expect(vestingDate.getUTCHours()).to.equal(0);
      expect(vestingDate.getUTCMinutes()).to.equal(0);
      expect(vestingDate.getUTCSeconds()).to.equal(0);
    }
  });
  

});


