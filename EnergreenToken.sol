
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract MyToken is ERC20,ERC20Burnable, Ownable , ReentrancyGuard {
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
    address public reserveAddress = 0x01DD3a8ef7F2E6eb3721CA797b0C3bF47463843d ;
    address public teamAddress = 0x01DD3a8ef7F2E6eb3721CA797b0C3bF47463843d ;
    address public advisorAddress = 0x01DD3a8ef7F2E6eb3721CA797b0C3bF47463843d ;

    uint256 public startDate;
    uint256 public releaseInterval = 30 days;

    struct Vesting {
        uint256 start;
        uint256 period;
        uint256 amount;
    }

    mapping(address => Vesting[]) public vestings;
    mapping(address => bool) public blacklist;

    constructor( ) ERC20("MyToken", "MTK") {


        startDate = block.timestamp;

        _mint(address(this), TOTAL_SUPPLY);

        _transfer(address(this), stakingAddress, INITIAL_STAKING);
        _transfer(address(this), liquidityAddress, INITIAL_LIQUIDITY);
        _transfer(address(this), idoAddress, INITIAL_IDO);
        _transfer(address(this), privateSale1Address, INITIAL_PRIVATE_SALE_1);
        _transfer(address(this), privateSale2Address, INITIAL_PRIVATE_SALE_2);


        vestings[marketingAddress].push(Vesting({start: startDate + releaseInterval, period: 100, amount: 350000 * (10 ** 18)}));
        vestings[reserveAddress].push(Vesting({start: startDate + releaseInterval, period: 100, amount: 150000 * (10 ** 18)}));
        vestings[privateSale1Address].push(Vesting({start: startDate + 10 * releaseInterval, period: 12, amount: 55416 * (10 ** 18)}));
        vestings[privateSale2Address].push(Vesting({start: startDate + 9 * releaseInterval, period: 12, amount: 63333 * (10 ** 18)}));
        vestings[idoAddress].push(Vesting({start: startDate + 2 * releaseInterval, period: 12, amount: 80000 * (10 ** 18)}));
        vestings[teamAddress].push(Vesting({start: startDate + 13 * releaseInterval, period: 72, amount: 300000 * (10 ** 18)}));
        vestings[advisorAddress].push(Vesting({start: startDate + 7 * releaseInterval, period: 30, amount: 270833 * (10 ** 18)}));
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
        uint256 currentMonth = (block.timestamp - currentVestingDate) / (30 days) + 1;
        uint256 currentYear = startDate / (365 days);

        uint256 daysInMonth = getDaysInMonth(currentMonth, currentYear);
        uint256 nextVestingDate = currentVestingDate + daysInMonth * 1 days;

        return nextVestingDate;
    }




   function releaseVestedTokens(address beneficiary) public onlyOwner {
        uint256 totalAmount = 0;
        uint256 length = vestings[beneficiary].length;

        for (uint256 i = 0; i < length; i++) {
            Vesting storage vesting = vestings[beneficiary][i];

            while (block.timestamp >= getNextVestingDate(vesting.start)) {
                uint256 toRelease = vesting.amount;

                if (vesting.period == 0) {
                    break;
                }

                totalAmount += toRelease;
                vesting.start = getNextVestingDate(vesting.start);
                vesting.period -= 1;
            }
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
        uint256 index,
        uint256 start,
        uint256 period,
        uint256 amount
    ) public onlyOwner {
        require(index < vestings[beneficiary].length, "Invalid index");

        vestings[beneficiary][index].start = start;
        vestings[beneficiary][index].period = period;
        vestings[beneficiary][index].amount = amount;
    }

    function addVesting(
        address beneficiary,
        uint256 start,
        uint256 period,
        uint256 amount
    ) public onlyOwner {
        vestings[beneficiary].push(Vesting({start: start, period: period, amount: amount}));
    }

    function removeVesting(address beneficiary, uint256 index) public onlyOwner {
        require(index < vestings[beneficiary].length, "Invalid index");

        uint256 lastIndex = vestings[beneficiary].length - 1;

        if (index != lastIndex) {
            vestings[beneficiary][index] = vestings[beneficiary][lastIndex];
        }

        vestings[beneficiary].pop();
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

