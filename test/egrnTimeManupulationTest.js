const { expect } = require("chai");
const { ethers } = require ('hardhat') ;
const provider = ethers.provider ; 

const Egrn = require("../artifacts/contracts/EnergreenToken.sol/EnergreenToken.json");
let egrn = new ethers.Contract("0x89247E846f9c79b39139b5c570dDa851EBB10578", Egrn.abi, provider); // mumbai deployed contract address


let owner, reserve, team, advisor, listing, staking, community, privateSale1, privateSale2, publicSale;
let Owner  = "0xf8cE5D043aF80991d296d0Bd2b8F04B0c31D73De" ; // mumbai owner address
let Reserve = "0x66D9Bb5cC0D8B32C62C46Dfb7376031A497afe70" ;
let Team  = "0x7F4C6325b0690d98138229C1b2938886ffe10A65" ;
let Advisor = "0x9c137226d0D4c191F4A680F646dFEb381e7Acee4" ;
let Listing = "0x656F4EAc864393d61362e24434f8Ad2987543aC3"   ; 
let Staking = "0xe1C9E85A91f97090f27bE358D03E4Ad28f8F242A"  ;
let Community = "0x3aca898549cC4863beC8D95362Ecc4030a6ad346" ;  
let PrivateSale1 = "0xFaC7c87D1777662909b7Bf7e4E7bc0922423229c" ;
let PrivateSale2 = "0x14530Dd3325CE7D035d231210CC4b2bF5b0ebE88" ;
let PublicSale = "0x34EcE43178f23F908164651aB673ffbfc26b0b22" ;

async function getBlockTimestamp() {
    let block_number, block, block_timestamp;

    block_number = await provider.getBlockNumber();;
    block = await provider.getBlock(block_number);
    block_timestamp = block.timestamp;

    return block_timestamp;
}

/*
await network.provider.send("evm_setAutomine", [false]);

let initialTimestamp = await getBlockTimestamp();
await provider.send('evm_setNextBlockTimestamp', [initialTimestamp + 2]);
await provider.send('evm_mine');

*/

async function increaseTime(value) {
    await provider.send('evm_increaseTime', [value]);
    await provider.send('evm_mine');
}

async function requestAccount(_account) {

    await hre.network.provider.request({
        method: "hardhat_impersonateAccount",
        params: [_account],
    });

};

async function signerGetting(_account) {

    return await ethers.getSigner(_account);

};


describe ("EgrnTimeManupulationTest", function () {

    before (async function () {
        await requestAccount(Owner);
        owner = await signerGetting(Owner);
        await requestAccount(Reserve);
        reserve = await signerGetting(Reserve);
        await requestAccount(Team);
        team = await signerGetting(Team);
        await requestAccount(Advisor);
        advisor = await signerGetting(Advisor);
        await requestAccount(Listing);
        listing = await signerGetting(Listing);
        await requestAccount(Staking);
        staking = await signerGetting(Staking);
        await requestAccount(Community);
        community = await signerGetting(Community);
        await requestAccount(PrivateSale1);
        privateSale1 = await signerGetting(PrivateSale1);
        await requestAccount(PrivateSale2);
        privateSale2 = await signerGetting(PrivateSale2);
        await requestAccount(PublicSale);
        publicSale = await signerGetting(PublicSale);
    });

    it ("should request correct accounts", async function () {

        expect(await owner.getAddress()).to.equal(Owner);
        expect(await reserve.getAddress()).to.equal(Reserve);
        expect(await team.getAddress()).to.equal(Team);
        expect(await advisor.getAddress()).to.equal(Advisor);
        expect(await listing.getAddress()).to.equal(Listing);
        expect(await staking.getAddress()).to.equal(Staking);
        expect(await community.getAddress()).to.equal(Community);
        expect(await privateSale1.getAddress()).to.equal(PrivateSale1);
        expect(await privateSale2.getAddress()).to.equal(PrivateSale2);
        expect(await publicSale.getAddress()).to.equal(PublicSale);

    });

    it ("Should addresses match with the deployed contract", async function () {
        expect(await egrn.owner()).to.equal(owner.address);
        expect(await egrn.reserveAddress()).to.equal(reserve.address);
        expect(await egrn.teamAddress()).to.equal(team.address);
        expect(await egrn.advisorAddress()).to.equal(advisor.address);
        expect(await egrn.liquidityAddress()).to.equal(listing.address);
        expect(await egrn.stakingAddress()).to.equal(staking.address);
        expect(await egrn.marketingAddress()).to.equal(community.address);
        expect(await egrn.privateSale1Address()).to.equal(privateSale1.address);
        expect(await egrn.privateSale2Address()).to.equal(privateSale2.address);
        expect(await egrn.idoAddress()).to.equal(publicSale.address);
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
        console.log("Team vesting and original wanted difference:", difference.toString() , " wei");
  
        let egrnAdvisorVesting = await egrn.vestings(await egrn.advisorAddress());
        expect(egrnAdvisorVesting.amount.mul(egrnAdvisorVesting.period) ).to.below(ethers.utils.parseEther("6499213"));
        difference = ethers.utils.parseEther("6499213").sub(egrnAdvisorVesting.amount.mul(egrnAdvisorVesting.period) );
        console.log("Advisor vesting and original wanted difference:", difference.toString() , " wei");
  
        let egrnLiquidityVesting = await egrn.vestings(await egrn.liquidityAddress());
        expect(egrnLiquidityVesting.amount.mul(egrnLiquidityVesting.period) ).to.equal(0);
        console.log("Liquidity doesn't have vesting") ;
  
        let egrnStakingVesting = await egrn.vestings(await egrn.stakingAddress());
        expect(egrnStakingVesting.amount.mul(egrnStakingVesting.period) ).to.equal(0);
        console.log("Staking doesn't have vesting") ;
  
        let egrnMarketingVesting = await egrn.vestings(await egrn.marketingAddress());
        expect(egrnMarketingVesting.amount.mul(egrnMarketingVesting.period) ).to.below(ethers.utils.parseEther("33000000")); // 33M
        difference = ethers.utils.parseEther("33000000").sub(egrnMarketingVesting.amount.mul(egrnMarketingVesting.period) );
        console.log("Marketing vesting and original wanted difference:", difference.toString() , " wei " , ethers.utils.formatEther(difference) , " ether conversion");
  
        let egrnPrivateSale1Vesting = await egrn.vestings(await egrn.privateSale1Address());
        expect(egrnPrivateSale1Vesting.amount.mul(egrnPrivateSale1Vesting.period) ).to.below(ethers.utils.parseEther("665747.65")); // 665,747.65 K
        difference = ethers.utils.parseEther("665747.65").sub(egrnPrivateSale1Vesting.amount.mul(egrnPrivateSale1Vesting.period) );
        console.log("PrivateSale1 vesting and original wanted difference:", difference.toString() , " wei " , ethers.utils.formatEther(difference) , " ether conversion");
  
        let egrnPrivateSale2Vesting = await egrn.vestings(await egrn.privateSale2Address());
        expect(egrnPrivateSale2Vesting.amount.mul(egrnPrivateSale2Vesting.period) ).to.below(ethers.utils.parseEther("760000")); // 760K
        difference = ethers.utils.parseEther("760000").sub(egrnPrivateSale2Vesting.amount.mul(egrnPrivateSale2Vesting.period) );
        console.log("PrivateSale2 vesting and original wanted difference:", difference.toString() , "  wei " , ethers.utils.formatEther(difference) , " ether conversion");
  
        let egrnIDOAddressVesting = await egrn.vestings(await egrn.idoAddress());
        expect(egrnIDOAddressVesting.amount.mul(egrnIDOAddressVesting.period) ).to.equal(ethers.utils.parseEther("920000")); // 920K
        difference = ethers.utils.parseEther("920000").sub(egrnIDOAddressVesting.amount.mul(egrnIDOAddressVesting.period) );
        console.log("IDO vesting and original wanted difference:", difference.toString() , " wei " , ethers.utils.formatEther(difference) , " ether conversion");
  
    });

    it("Should set the total other accounts initial supply correctly", async function () {
        let contractEgrnBalance = await egrn.balanceOf(egrn.address);
        let totalSupply = await egrn.totalSupply();
        let otherAccountsBalance = totalSupply.sub(contractEgrnBalance);
        console.log("TGE accounts balance:", ethers.utils.formatEther(otherAccountsBalance) );
        expect(otherAccountsBalance).to.equal(ethers.utils.parseEther("138155039.35")); // 138,155,039.35
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

        async function getNextVestingTime( _account) {
          const timestamp = (await egrn.vestings(await _account)).vestingTime;
          const vestingDate = new Date(Number(timestamp.toString()) * 1000);
          return vestingDate;
        }

        async function release(_account , vestingNumber) {
                
            let firstBalance = await egrn.balanceOf(_account);

            for (let i = 0; i < vestingNumber ; i++) {
              let oldVestingDate = await getNextVestingTime(_account);
              const balanceBefore = await egrn.balanceOf(_account);

              if (i == vestingNumber - 1 ) {
                  let lastVesting = await egrn.vestings(_account);
                  lastVesting = await lastVesting.vestingTime;
                  let lastVestingDate = new Date(Number(lastVesting.toString()) * 1000);
                  console.log("Last vesting date is --> ", lastVestingDate.toUTCString()  , " Last vesting timestamp is --> ", lastVesting.toString()); 
                }

              await egrn.connect(owner).releaseVesting(_account);
              const balanceAfter = await egrn.balanceOf(_account);
              expect(balanceAfter).to.be.above(balanceBefore);
              let newVestingDate = await getNextVestingTime(_account);

              if (_account != publicSale.address) {
                oldVestingDate.setUTCMonth(oldVestingDate.getUTCMonth() + 1);
                expect(newVestingDate.getUTCMonth()).to.equal(oldVestingDate.getUTCMonth());
                expect(newVestingDate.getUTCDate()).to.equal(oldVestingDate.getUTCDate());
                expect(newVestingDate.getUTCHours()).to.equal(0);
                expect(newVestingDate.getUTCMinutes()).to.equal(0);
                expect(newVestingDate.getUTCSeconds()).to.equal(0);
              } else if (_account == publicSale.address) {
                oldVestingDate.setUTCDate(oldVestingDate.getUTCDate() + 7);
                expect(newVestingDate.getUTCDate()).to.equal(oldVestingDate.getUTCDate());
                expect(newVestingDate.getUTCHours()).to.equal(0);
                expect(newVestingDate.getUTCMinutes()).to.equal(0);
                expect(newVestingDate.getUTCSeconds()).to.equal(0);
              }
            }

            let lastBalance = await egrn.balanceOf(_account);
            return [firstBalance, lastBalance] ;
        }


        it("Should the blockchain timestamp 100 years increases", async function () {


            await increaseTime( 100 * 365 * 24 * 60 * 60); // 100 years later

            //expect block.timestamp year to be 100 years later
            const block = await ethers.provider.getBlock();
            const blockDate = new Date(Number(block.timestamp.toString()) * 1000);
            expect(blockDate.getUTCFullYear()).to.equal(2123);
           
    
        });

        it("Should the team vestings are correct 100 years later", async function () {
            
            let balances = await release(team.address, 96); 
            console.log("Teeam balance before vestings --> ", ethers.utils.formatEther(balances[0]), " Team balance after vestings --> ", ethers.utils.formatEther(balances[1]),"\n");
            expect(balances[1]).to.be.lte(ethers.utils.parseEther("20000000"));
        
        });

        it("Should the advisor vestings are correct 100 years later", async function () {

            let balances = await release(advisor.address, 48);
            console.log("Advisor balance before vestings --> ", ethers.utils.formatEther(balances[0]), " Advisor balance after vestings --> ", ethers.utils.formatEther(balances[1]),"\n");
            expect(balances[1]).to.be.lte(ethers.utils.parseEther("6499213"));

        });

        it("Should the marketing vestings are correct 100 years later", async function () {
                
            let balances = await release(community.address, 133);
            console.log("Marketing balance before vestings --> ", ethers.utils.formatEther(balances[0]), " Marketing balance after vestings --> ", ethers.utils.formatEther(balances[1]),"\n");
            expect(balances[1]).to.be.lte(ethers.utils.parseEther("33000000"));
    
        });

        it("Should the privateSale1 vestings are correct 100 years later", async function () {
                
            let balances = await release(privateSale1.address, 13);
            console.log("PrivateSale1 balance before vestings --> ", ethers.utils.formatEther(balances[0]), " PrivateSale1 balance after vestings --> ", ethers.utils.formatEther(balances[1]),"\n");
            expect(balances[1]).to.be.lte(ethers.utils.parseEther("700787"));
            
        });

        it("Should the privateSale2 vestings are correct 100 years later", async function () {
                    
            let balances = await release(privateSale2.address, 13);
            console.log("PrivateSale2 balance before vestings --> ", ethers.utils.formatEther(balances[0]), " PrivateSale2 balance after vestings --> ", ethers.utils.formatEther(balances[1]),"\n");
            expect(balances[1]).to.be.lte(ethers.utils.parseEther("800000"));
                
        });

        it("Should the ido vestings are correct 100 years later", async function () {
                        
            let balances = await release(publicSale.address, 200);
            console.log("Ido balance before vestings --> ", ethers.utils.formatEther(balances[0]), " Ido balance after vestings --> ", ethers.utils.formatEther(balances[1]),"\n");
            expect(balances[1]).to.be.lte(ethers.utils.parseEther("1000000"));
                    
        });

        it("Should the reserve vestings are correct 100 years later", async function () {
                                
            let balances = await release(reserve.address, 0);
            console.log("Reserve balance before vestings --> ", ethers.utils.formatEther(balances[0]), " Reserve balance after vestings --> ", ethers.utils.formatEther(balances[1]),"\n");
            expect(balances[1]).to.be.lte(ethers.utils.parseEther("75000000"));
                            
        });

        it("Should the staking vestings are correct 100 years later", async function () {
                                        
            let balances = await release(staking.address, 0);
            console.log("Staking balance before vestings --> ", ethers.utils.formatEther(balances[0]), " Staking balance after vestings --> ", ethers.utils.formatEther(balances[1]),"\n");
            expect(balances[1]).to.be.lte(ethers.utils.parseEther("75000000"));
                                    
        });

        it("Should the liquidity vestings are correct 100 years later", async function () {
                                                    
            let balances = await release(listing.address, 0);
            console.log("Liquidity balance before vestings --> ", ethers.utils.formatEther(balances[0]), " Liquidity balance after vestings --> ", ethers.utils.formatEther(balances[1]),"\n");
            expect(balances[1]).to.be.lte(ethers.utils.parseEther("75000000"));
                                                
        });

        it("Should the contract has still some egrn balance", async function () {
                                                        
            let balance = await egrn.balanceOf(egrn.address);
            console.log("Egrn balance of the contract 100 years later--> ", ethers.utils.formatEther(balance),"\n");
            expect(balance).to.be.gt(0); 
        
        });

        it("Should the vesting addresses don't have any vesting left", async function () {

            expect((await egrn.vestings(team.address)).period).to.be.equal(0);
            expect((await egrn.vestings(advisor.address)).period).to.be.equal(0);
            expect((await egrn.vestings(community.address)).period).to.be.equal(0);
            expect((await egrn.vestings(privateSale1.address)).period).to.be.equal(0);
            expect((await egrn.vestings(privateSale2.address)).period).to.be.equal(0);
            expect((await egrn.vestings(publicSale.address)).period).to.be.equal(0);
            expect((await egrn.vestings(reserve.address)).period).to.be.equal(0);
            expect((await egrn.vestings(staking.address)).period).to.be.equal(0);
            expect((await egrn.vestings(listing.address)).period).to.be.equal(0);
        });
    });
});