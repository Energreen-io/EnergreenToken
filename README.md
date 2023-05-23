# Energreen Token

**Contract Addresses**

Energreen Token Mainnet: 0xDB8d6D3AC21e4efE3675BBB18514010AC9C5558F
Energreen Token Mainnet Owner: 0xC85ac831488679D52eF3598d04B4f8f73cBa27Fa

Energreen Token Sepolia: 0xDB8d6D3AC21e4efE3675BBB18514010AC9C5558F
Energreen Token Sepolia Owner: 0xC85ac831488679D52eF3598d04B4f8f73cBa27Fa

Energreen Claim PrivateSale1 Sepolia: 0x63A01A2714F2cea4152B0883706E248473FE85CC
Energreen Claim PrivateSale1 Sepolia Signer: 0xc06A04CE9ffE8903a7B6D3271D82B184040BE426

Energreen Claim PrivateSale2 Sepolia: 0x13894aB24ACa4b3b0489eef0e818E1230546FE0a
Energreen Claim PrivateSale2 Sepolia Signer: 0xc06A04CE9ffE8903a7B6D3271D82B184040BE426

Energreen Claim PublicSale Sepolia: 0x0553CeB6248a5dd5592B735DfCA56c6cF93e8967
Energreen Claim PublicSale Sepolia Signer: 0xBA1B7d014BDae0d07Fe79227F56c19bb607C9486

-------------------------------------- SEPOLIA TEST CLAIMS ----------------------------------------------

Test Token Contract: 0x52E13212e0B41Bd68736f36a052bC9890927374c

Test Claims Signer: 0x1a50Fd6fE04c9e66Eed3d5a373551Bcd74eC5549
Test Token Holder : 0xe1882D82dc770A41e6F15B0b688C6C839953FD06

Test Private 1 Claim Contract: 0xB1F8C1eC669f34d06Ac0a808f012082c30B7F9c2
Test Private 2 Claim Contract: 0xfFBdD3a2713C56a6E98f59E564aad7C784E1d6A6
Test Public Claim Contract: 0xaC9f4fd3Fde70511BC93d361338e5E206b41E44C

**Energreen Token (ENGRN)** is an ERC20 token built for the Ethereum network. It has a total supply of **200,000,000 ENGRN**, and it includes vesting schedules for various addresses. This token is used to facilitate transactions on the Energreen platform.

## Tokenomics
Token Name: **Energreen Token**
Token Symbol: **ENGRN**
Total Supply: **200,000,000 ENGRN**
The token distribution is as follows:

- Staking Address: 55% (110,000,000 ENGRN)
- Liquidity Address: 1.5% (3,000,000 ENGRN)
- IDO Address: 0.04% (80,000 ENGRN)
- Private Sale 1 Address: 0.0175% (35,000 ENGRN)
- Private Sale 2 Address: 0.02% (40,000 ENGRN)
- Marketing Address: 0.175% (350,000 ENGRN) - 100% vested for 1 year with monthly releases
- Reserve Address: 0.125% (250,000 ENGRN) - 100% vested for 1 year with monthly releases
- Team Address: 0.15% (300,000 ENGRN) - 100% vested for 13 months with quarterly releases
- Advisor Address: 0.135% (270,833.333333333333333 ENGRN) - 100% vested for 7.5 months with monthly releases

## Vesting Schedule

The vesting schedules for the Marketing, Reserve, Private Sale 1, Private Sale 2, IDO, Team, and Advisor addresses are implemented in the contract. The vesting period and release schedule for each address can be found in the constructor function of the contract.

Vested tokens are released monthly or quarterly, depending on the vesting schedule for the specific address. The `releaseVesting` function can be called by the contract owner to release the vested tokens for a specific address.

## Blacklist
The contract includes a blacklist feature, which allows the contract owner to add or remove addresses from the blacklist. Token transfers are not allowed from or to blacklisted addresses.

To add an address to the blacklist, call the `addToBlacklist` function with the address as the parameter. To remove an address from the blacklist, call the `removeFromBlacklist` function with the address as the parameter.

## Security
The contract uses the Ownable and ReentrancyGuard contracts from the OpenZeppelin library to ensure secure ownership and prevent reentrancy attacks.

## License
This contract is licensed under the MIT license.

## Functions
### constructor
#### Parameters
None
#### Description
The constructor function is the first function that is executed when the contract is initialized. The name and symbol of the token are set, and the total token supply is created. Token allocations are made for staking, liquidity, private sale, and other addresses. Adjustments required for vesting are also made.

## releaseVesting
#### Parameters
address vestingAddress: Address of the vesting to be resolved
#### Description
The function releases the tokens held in the vesting account for the given address. It can only be called by the contract owner. If the vesting period has expired and not all tokens have been released, the released tokens are transferred from the vesting account to the address's balance.

# Contract Functions

This contract contains the following functions:

## `getNextVestingMonth`

### Parameters

- `uint256 _addingMonth`: Specifies how many months (from now) you want to reach the target date. For example, if you want to reach the target date 2 months from now, set this parameter to 2.
- `uint256 _currentTimestamp`: Specifies the date from which you need to start the calculation. You need to provide a date in UNIX timestamp format.

### Description

This function calculates how many months it will take to reach the target date for the given timestamp. It is used for vesting dates.

## `timestampToDate`

### Parameters

- `uint256 timestamp`: A date in UNIX timestamp format.

### Description

This function returns a date in the year, month, and day format, given a date in UNIX timestamp format.

## `timestampFromDate`

### Parameters

- `uint year`: Year
- `uint month`: Month
- `uint day`: Day

### Description

This function returns a date in UNIX timestamp format given the year, month, and day.

## `getTotalRemainingVestingForAddress`

### Parameters

- `address _address`: The address for which you want to get the total remaining tokens.

### Description

This function returns the total remaining tokens for a specific address. This amount is calculated by multiplying the remaining periods of the calculated periodic amounts.

## `addToBlacklist`

### Parameters

- `address user`: The address you want to add to the blacklist.

### Description

This function adds the specified address to the blacklist.

## `removeFromBlacklist`

### Parameters

- `address user`: The address you want to remove from the blacklist.

### Description

This function removes the specified address from the blacklist.

## `_beforeTokenTransfer`

### Parameters

- `address from`: The address from which the tokens are being transferred.
- `address to`: The address to which the tokens are being transferred.
- `uint256 amount`: The amount of tokens being transferred.

### Description

This function is an internal function that is called before a token transfer. It checks whether the sender or the recipient is blacklisted. If so, it will prevent the transfer from taking place.

## Modifiers

This contract includes the following modifiers:

### `onlyOwner`

#### Description

This modifier is used to restrict a function to be executed by only the contract owner. If anyone other than the contract owner tries to execute the function, the transaction will be reverted.

### `nonReentrant`

#### Description

This modifier is used to prevent reentrancy attacks. If a function is marked with the `nonReentrant` modifier, then no other function can be executed until the first function completes. This helps to prevent an attacker from calling the same function multiple times before the previous call has completed.
