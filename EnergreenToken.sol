
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract MyToken is ERC20,ERC20Burnable, Ownable , ReentrancyGuard {

    using SafeMath for uint256;

    uint256 private constant TOTAL_SUPPLY = 200000000 * (10 ** 18);

    uint256 private constant INITIAL_STAKING = 110000000 * (10 ** 18);
    uint256 private constant INITIAL_LIQUIDITY = 3000000 * (10 ** 18);
    uint256 private constant INITIAL_IDO = 80000 * (10 ** 18);
    uint256 private constant INITIAL_PRIVATE_SALE_1 = 35000 * (10 ** 18);
    uint256 private constant INITIAL_PRIVATE_SALE_2 = 40000 * (10 ** 18);

    address public stakingAddress = 0x01DD3a8ef7F2E6eb3721CA797b0C3bF47463843d ;
    address public liquidityAddress = 0x01DD3a8ef7F2E6eb3721CA797b0C3bF47463843d ;
    address public idoAddress = 0x01DD3a8ef7F2E6eb3721CA797b0C3bF47463843d ;
    address public privateSale1Address = 0x01DD3a8ef7F2E6eb3721CA797b0C3bF47463843d ;
    address public privateSale2Address = 0x01DD3a8ef7F2E6eb3721CA797b0C3bF47463843d ;
    address public marketingAddress = 0x01DD3a8ef7F2E6eb3721CA797b0C3bF47463843d ;
    address public reserveAddress = 0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2 ;
    address public teamAddress = 0x01DD3a8ef7F2E6eb3721CA797b0C3bF47463843d ;
    address public advisorAddress = 0x01DD3a8ef7F2E6eb3721CA797b0C3bF47463843d ;

    uint256 public startDate;
    uint256 public releaseInterval = 30 days;

    struct Vesting {
        uint256 start;
        uint256 period;
        uint256 amount;
    }

    mapping(address => Vesting[]) public vestingler;

    mapping(address => Vesting) public vestings; //neew
    mapping(address => bool) public blacklist;

    constructor( ) ERC20("MyToken", "MTK") {


        startDate = block.timestamp;

        _mint(address(this), TOTAL_SUPPLY);

        _transfer(address(this), stakingAddress, INITIAL_STAKING);
        _transfer(address(this), liquidityAddress, INITIAL_LIQUIDITY);
        _transfer(address(this), idoAddress, INITIAL_IDO);
        _transfer(address(this), privateSale1Address, INITIAL_PRIVATE_SALE_1);
        _transfer(address(this), privateSale2Address, INITIAL_PRIVATE_SALE_2);



        //neew

        vestings[marketingAddress] = Vesting({
            start: startDate + releaseInterval, 
            period: 100, 
            amount: 350000 * (10 ** 18)
        });

        vestings[reserveAddress] = Vesting({
            start: startDate + releaseInterval, 
            period: 100, 
            amount: 150000 * (10 ** 18)
        });

        vestings[privateSale1Address] = Vesting({
            start: startDate + 10 * releaseInterval, 
            period: 12, 
            amount: 55416 * (10 ** 18)
        });

        vestings[privateSale2Address] = Vesting({
            start: startDate + 9 * releaseInterval, 
            period: 12, 
            amount: 63333 * (10 ** 18)
        });

        vestings[idoAddress] = Vesting({
            start: startDate + 2 * releaseInterval, 
            period: 12, 
            amount: 80000 * (10 ** 18)
        });

        vestings[teamAddress] = Vesting({
            start: startDate + 13 * releaseInterval, 
            period: 72, 
            amount: 300000 * (10 ** 18)
        });

        vestings[advisorAddress] = Vesting({
            start: startDate + 7 * releaseInterval, 
            period: 30, 
            amount: 270833 * (10 ** 18)
        });

    }


    function getDaysInMonth(uint256 month, uint256 year) public pure returns (uint256) {
        if (month == 2) {
            if ((year % 4 == 0 && year % 100 != 0) || year % 400 == 0) {
                return 29;
            } else {
                return 28;
            }
        } else if (month == 4 || month == 6 || month == 9 || month == 11) {
            return 30;
        } else {
            return 31;
        }
    }

function getNextVestingDate(uint256 currentVestingDate) public view returns (uint256) {
    uint256 currentMonth = (block.timestamp.sub(currentVestingDate)).div(30 days).add(1);
    uint256 currentYear = startDate.div(365 days);

    uint256 daysInMonth = getDaysInMonth(currentMonth, currentYear);
    uint256 nextVestingDate = currentVestingDate.add(daysInMonth.mul(1 days));

    return nextVestingDate;
}

function getMonthAndYear(uint256 currentVestingDate) public view returns (uint256) {
    uint256 currentMonth = (block.timestamp.sub(currentVestingDate)).div(30 days).add(1);
    uint256 currentYear = startDate.div(365 days);

    uint256 daysInMonth = getDaysInMonth(currentMonth, currentYear);
    uint256 nextVestingDate = currentVestingDate.add(daysInMonth.mul(1 days));

    return nextVestingDate;
}

// TRIAL

    function getVestingsCount(address _user) public view returns (Vesting memory) {

    return vestings[_user] ;

    }


  function releaseVestedTokens(address beneficiary) public onlyOwner nonReentrant {
        uint256 totalAmount = 0;

            Vesting storage vesting = vestings[beneficiary];

            while (block.timestamp >= getNextVestingDate(vesting.start)) {
                uint256 toRelease = vesting.amount;
                if (vesting.period == 0) {
                    break;
                }

                totalAmount += toRelease;
                vesting.start = getNextVestingDate(vesting.start);
                vesting.period -= 1;
            }


        require(totalAmount > 0, "No vested tokens to release");
        _transfer(address(this), beneficiary, totalAmount);
    }






//Release vesting changers


    function setReleaseInterval(uint256 interval) public onlyOwner {
        releaseInterval = interval;
    }

    function updateVesting(
        address beneficiary,
        uint256 start,
        uint256 period,
        uint256 amount
    ) public onlyOwner {


        vestings[beneficiary].start = start;
        vestings[beneficiary].period = period;
        vestings[beneficiary].amount = amount;
    }

    function addVesting(
        address beneficiary,
        uint256 start,
        uint256 period,
        uint256 amount
    ) public onlyOwner {

        vestings[beneficiary] = Vesting({start: start, period: period, amount: amount});
    }

    function removeVesting(address beneficiary) public onlyOwner {


        delete vestings[beneficiary];
    }



// Blacklist related
  function addToBlacklist(address user) public onlyOwner {
        blacklist[user] = true;
    }

    function removeFromBlacklist(address user) public onlyOwner {
        blacklist[user] = false;
    }

    function _beforeTokenTransfer(address from, address to, uint256 amount) internal override {
        require(!blacklist[from], "Token transfer not allowed: source address is blacklisted");
        require(!blacklist[to], "Token transfer not allowed: destination address is blacklisted");       
        super._beforeTokenTransfer(from, to, amount);
    }

}

