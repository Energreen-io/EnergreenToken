// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract EnergreenToken is ERC20,ERC20Burnable, Ownable , ReentrancyGuard {

    uint256 public constant TOTAL_SUPPLY = 200000000 * (10 ** 18);

    uint256 private constant INITIAL_STAKING = 110000000 * (10 ** 18);
    uint256 private constant INITIAL_LIQUIDITY = 3000000 * (10 ** 18);
    uint256 private constant INITIAL_IDO = 80000 * (10 ** 18);
    uint256 private constant INITIAL_PRIVATE_SALE_1 = 35000 * (10 ** 18);
    uint256 private constant INITIAL_PRIVATE_SALE_2 = 40000 * (10 ** 18);

    address public constant stakingAddress = 0x4B20993Bc481177ec7E8f571ceCaE8A9e22C02db ;
    address public constant liquidityAddress = 0x78731D3Ca6b7E34aC0F824c42a7cC18A495cabaB ;
    address public constant idoAddress = 0x617F2E2fD72FD9D5503197092aC168c91465E7f2 ;
    address public constant privateSale1Address = 0x4B20993Bc481177ec7E8f571ceCaE8A9e22C02db ;
    address public constant privateSale2Address = 0x01DD3a8ef7F2E6eb3721CA797b0C3bF47463843d ;
    address public constant marketingAddress = 0x742d35Cc6634C0532925a3b844Bc454e4438f44e ;
    address public constant reserveAddress = 0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B ;
    address public constant teamAddress = 0xE853c56864A2ebe4576a807D26Fdc4A0adA51919 ;
    address public constant advisorAddress = 0x1aE0EA34a72D944a8C7603FfB3eC30a6669E454C ;

    uint256 public startDate;
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
            vestingTime: getNextVestingMonth(1 , startDate) , 
            period: 100, 
            amount: 350000 * (10 ** 18),
            claimed: 0
        });

        vestings[reserveAddress] = Vesting({
            vestingTime: getNextVestingMonth(1 , startDate), 
            period: 100, 
            amount: 250000 * (10 ** 18),
            claimed: 0
        });

        vestings[privateSale1Address] = Vesting({
            vestingTime: getNextVestingMonth(10 , startDate), 
            period: 12, 
            amount: 55416666666666666666666,
            claimed: 0
        });

        vestings[privateSale2Address] = Vesting({
            vestingTime: getNextVestingMonth(9 , startDate), 
            period: 12, 
            amount: 63333333333333333333333,
            claimed: 0
        });

        vestings[idoAddress] = Vesting({
            vestingTime: getNextVestingMonth(2 , startDate), 
            period: 200, 
            amount: 4600 * (10 ** 18),
            claimed: 0
        });

        vestings[teamAddress] = Vesting({
            vestingTime: getNextVestingMonth(13 , startDate), 
            period: 72, 
            amount: 300000 * (10 ** 18),
            claimed: 0
        });

        vestings[advisorAddress] = Vesting({
            vestingTime: getNextVestingMonth(7 , startDate), 
            period: 30, 
            amount: 270833333333333333333333 ,
            claimed: 0
        });

    }

    // VESTING LOCK RELEASE
    function releaseVesting (address vestingAddress) public onlyOwner nonReentrant {

        Vesting memory vesting = vestings[vestingAddress] ;

        require( block.timestamp >= vesting.vestingTime , "Vesting time is not now." ) ;
        require( vesting.period > 0 , "Vesting is over for this address" ) ;

        uint256 nextVestingTime ;

        if (vestingAddress == idoAddress) {
            nextVestingTime = vesting.vestingTime + 1 weeks ; }                 // Adding 1 week for IDO vesting 
        else {
            nextVestingTime = getNextVestingMonth(1 , vesting.vestingTime) ;    // Vesting day is same for every month except IDO sale.
        }

        vesting.vestingTime = nextVestingTime;
        vesting.period -= 1 ;
        vesting.claimed += 1 ;

        vestings[vestingAddress] = vesting ;
        _transfer(address(this), vestingAddress, vesting.amount);

    }

    //Pure functions
    function  getNextVestingMonth (uint256 _addingMonth , uint256 _currentTimestamp) public pure returns (uint256 _timestamp) {
        uint256 currentYear ;
        uint256 currentMonth ;
        uint256 currentDay ;

        (currentYear, currentMonth , currentDay) = timestampToDate(_currentTimestamp) ;
        uint256 nextYear = (_addingMonth / 12 ) + currentYear ;
        uint256 nextMonth = (_addingMonth % 12 ) + currentMonth ;

        if (nextMonth > 12 ) {
            nextYear += 1 ;
            nextMonth = nextMonth % 12 ;
        }

        uint256 nextTimestamp = timestampFromDate(nextYear , nextMonth , currentDay) ;
        return nextTimestamp ;
    }

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

    function getTotalRemainingVestingForAddress (address _address) public view returns (uint256) {
        Vesting memory vesting = vestings[_address] ;
        uint256 remainingPeriod = vesting.period ;
        uint256 periodicAmount = vesting.amount ;
        uint256 remainingVestingAmount = remainingPeriod * periodicAmount ;
        return remainingVestingAmount ;
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

