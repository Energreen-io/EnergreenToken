
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract EnergreenToken is ERC20,ERC20Burnable, Ownable , ReentrancyGuard {

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
    uint256 public idoReleaseInterval = 14 days;
    
    uint constant SECONDS_PER_DAY = 24 * 60 * 60;
    uint constant SECONDS_PER_HOUR = 60 * 60;
    uint constant SECONDS_PER_MINUTE = 60;
    int constant OFFSET19700101 = 2440588;

    struct Vesting {
        uint256 vestingTime;
        uint256 period;
        uint256 amount;
        uint256 claimed;
    }

    mapping(address => Vesting) public vestings; 
    mapping(address => bool) public blacklist;

    constructor( ) ERC20("ENERGREEN", "ENGRN") {


        startDate = block.timestamp;

        _mint(address(this), TOTAL_SUPPLY);

        _transfer(address(this), stakingAddress, INITIAL_STAKING);
        _transfer(address(this), liquidityAddress, INITIAL_LIQUIDITY);
        _transfer(address(this), idoAddress, INITIAL_IDO);
        _transfer(address(this), privateSale1Address, INITIAL_PRIVATE_SALE_1);
        _transfer(address(this), privateSale2Address, INITIAL_PRIVATE_SALE_2);



        vestings[marketingAddress] = Vesting({
            vestingTime: startDate + releaseInterval, 
            period: 100, 
            amount: 350000 * (10 ** 18),
            claimed: 0
        });

        vestings[reserveAddress] = Vesting({
            vestingTime: startDate + releaseInterval, 
            period: 100, 
            amount: 250000 * (10 ** 18),
            claimed: 0
        });

        vestings[privateSale1Address] = Vesting({
            vestingTime: startDate + 10 * releaseInterval, 
            period: 12, 
            amount: 55416666666666666666666,
            claimed: 0
        });

        vestings[privateSale2Address] = Vesting({
            vestingTime: startDate + 9 * releaseInterval, 
            period: 12, 
            amount: 63333333333333333333333,
            claimed: 0
        });

        vestings[idoAddress] = Vesting({
            vestingTime: startDate + 2 * releaseInterval, 
            period: 12, 
            amount: 80000 * (10 ** 18),
            claimed: 0
        });

        vestings[teamAddress] = Vesting({
            vestingTime: startDate + 13 * releaseInterval, 
            period: 72, 
            amount: 300000 * (10 ** 18),
            claimed: 0
        });

        vestings[advisorAddress] = Vesting({
            vestingTime: startDate + 7 * releaseInterval, 
            period: 30, 
            amount: 270833333333333333333333 ,
            claimed: 0
        });

    }


function getNextVestingDate(uint256 currentVestingDate) public pure returns (uint256 ) {
    uint256 vestingMonth ;
    uint256 vestingYear ;
    (vestingYear, vestingMonth , ) = timestampToDate(currentVestingDate) ; 

    uint256 daysInMonth = getDaysInMonth(vestingMonth, vestingYear);
    uint256 nextVestingDate = timestampFromDate(vestingYear , vestingMonth, daysInMonth);

    return nextVestingDate;
}





function releaseVesting (address vestingAddress) public onlyOwner nonReentrant {


Vesting storage vesting = vestings[vestingAddress] ;

require( block.timestamp >= vesting.vestingTime , "Vesting time is not now." ) ;
require( vesting.period > 0 , "Vesting is over for this address" ) ;



uint256 vestingMonth ;
uint256 vestingYear ;

( vestingYear , vestingMonth , ) = timestampToDate(vesting.vestingTime) ;

if (vestingMonth != 12) {
    vestingMonth += 1;
}
else {
    vestingMonth = 1;
    vestingYear += 1;
} 

uint256 nextVestingTime = timestampFromDate(vestingYear, vestingMonth , 28) ; // Every month has 28. day
nextVestingTime = getNextVestingDate(nextVestingTime);

vesting.vestingTime = nextVestingTime;
vesting.period -= 1 ;
vesting.claimed += 1 ;

_transfer(address(this), vestingAddress, vesting.amount);






} 




  function releaseVestedTokens(address beneficiary) public onlyOwner nonReentrant {
        uint256 totalAmount = 0;

            Vesting storage vesting = vestings[beneficiary];

            while (block.timestamp >= getNextVestingDate(vesting.vestingTime)) {
                uint256 toRelease = vesting.amount;
                if (vesting.period == 0) {
                    break;
                }

                totalAmount += toRelease;
                vesting.vestingTime = getNextVestingDate(vesting.vestingTime);
                vesting.period -= 1;
            }


        require(totalAmount > 0, "No vested tokens to release");
        _transfer(address(this), beneficiary, totalAmount);
    }




//Pure functions
    function _daysToDate(uint _days) internal pure returns (uint year, uint month, uint day) {
        int __days = int(_days);

        int L = __days + 68569 + OFFSET19700101;
        int N = 4 * L / 146097;
        L = L - (146097 * N + 3) / 4;
        int _year = 4000 * (L + 1) / 1461001;
        L = L - 1461 * _year / 4 + 31;
        int _month = 80 * L / 2447;
        int _day = L - 2447 * _month / 80;
        L = _month / 11;
        _month = _month + 2 - 12 * L;
        _year = 100 * (N - 49) + _year + L;

        year = uint(_year);
        month = uint(_month);
        day = uint(_day);
    }

        function _daysFromDate(uint year, uint month, uint day) internal pure returns (uint _days) {
        require(year >= 1970);
        int _year = int(year);
        int _month = int(month);
        int _day = int(day);

        int __days = _day
          - 32075
          + 1461 * (_year + 4800 + (_month - 14) / 12) / 4
          + 367 * (_month - 2 - (_month - 14) / 12 * 12) / 12
          - 3 * ((_year + 4900 + (_month - 14) / 12) / 100) / 4
          - OFFSET19700101;

        _days = uint(__days);
    }


    function timestampToDate(uint timestamp) public pure returns (uint year, uint month, uint day) {
        (year, month, day) = _daysToDate(timestamp / SECONDS_PER_DAY);
    }

    function timestampFromDate(uint year, uint month, uint day) public pure returns (uint timestamp) {
        timestamp = _daysFromDate(year, month, day) * SECONDS_PER_DAY;
    }

    function getDaysInMonth(uint256 month, uint256 year) private pure returns (uint256) {
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

