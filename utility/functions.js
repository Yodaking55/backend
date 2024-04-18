//All dependencies
const Web3 = require("web3");
const TronWeb = require('tronweb');

const calculateBonus = (amount) => {
    amount = Number(amount);
    if (amount >= 100 && amount < 500) {
        return 1; // 1%bonus
    } else if (amount >= 500 && amount < 2000) {
        return 2; //2% bonus
    } else if (amount >= 2000 && amount < 10000) {
        return 3; //3% bonus
    } else if (amount >= 10000 && amount < 20000) {
        return 5; //5% bonus
    } else if (amount >= 20000) {
        return 10; //10% bonus
    } else {
        return 0;
    }
}
module.exports = {
    calculateBonus: (amount) => {
        amount = Number(amount);
        if (amount >= 100 && amount < 500) {
            return 1; // 1%bonus
        } else if (amount >= 500 && amount < 2000) {
            return 2; //2% bonus
        } else if (amount >= 2000 && amount < 10000) {
            return 3; //3% bonus
        } else if (amount >= 10000 && amount < 20000) {
            return 5; //5% bonus
        } else if (amount >= 20000) {
            return 10; //10% bonus
        } else {
            return 0;
        }
    },

    ValidateAddress: (address, type) => {
        let checkAddress = address;
        if ((checkAddress).length != 42) {
            return { status: false, message: "WALLET_ADDRESS_NOT_VALIDATE" };
        }
        //Convert address to checksum address
        checkAddress = Web3.utils.toChecksumAddress(checkAddress);

        //Check wallet address valid or not
        const checkWalletAddress = Web3.utils.isAddress(checkAddress);
        if (!checkWalletAddress) {
            return { status: false, message: "WALLET_ADDRESS_NOT_VALIDATE" };
        }

        return { status: true, address: checkAddress };
    },
    convertTronToEthAddress: (tronAddress) => {

        // Remove the prefix (41) from the Tron address
        const removedPrefixAddress = TronWeb.address.fromHex(tronAddress);

        // Convert the Tron contract address to hex
        const hexAddress = TronWeb.address.toHex(removedPrefixAddress);
        const ethereumAddress = '0x' + hexAddress.slice(2)

        return ethereumAddress;
    },
    ValidateEmail: (email) => {
        var validRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

        if (email.match(validRegex)) return true;
        else return false;
    },
    getUserDetailSum: async (myBalance, initObj, type = "") => {
        return myBalance.reduce((a, b, currentIndex) => {
            if (b.length > 0) {
                if (b[6] == "Public sale") {
                    let bonusPercentage = calculateBonus(BigInt(b[0]))
                    if (bonusPercentage > 0) {
                        // console.log("BigInt((BigInt(b[1]) * bonusPercentage) / 100)",BigInt(BigInt(b[1]) * BigInt(bonusPercentage)) / BigInt(100) )
                        return ({ total: (BigInt(a.total) + BigInt(b[0])), totalBonus: (BigInt(a.totalBonus) + BigInt(BigInt(b[1]) * BigInt(bonusPercentage)) / BigInt(100)), totalReferral: (BigInt(a.totalReferral)), totalICB: (BigInt(a.totalICB) + BigInt(b[1])), data: [...a.data, [(b[0].toString()), (b[1].toString()), (b[2].toString()), (b[3].toString()), (b[4].toString()), (b[5].toString()), (b[6])]] })
                    } else {
                        return ({ total: (BigInt(a.total) + BigInt(b[0])), totalBonus: (BigInt(a.totalBonus)), totalReferral: (BigInt(a.totalReferral)), totalICB: (BigInt(a.totalICB) + BigInt(b[1])), data: [...a.data, [(b[0].toString()), (b[1].toString()), (b[2].toString()), (b[3].toString()), (b[4].toString()), (b[5].toString()), (b[6])]] })
                    }
                } else if (b[6] == "Referral") {
                    return ({ total: (BigInt(a.total) + BigInt(b[0])), totalBonus: (BigInt(a.totalBonus)), totalReferral: (BigInt(a.totalReferral) + BigInt(b[1])), totalICB: (BigInt(a.totalICB) + BigInt(b[1])), data: [...a.data, [(b[0].toString()), (b[1].toString()), (b[2].toString()), (b[3].toString()), (b[4].toString()), (b[5].toString()), (b[6])]] })
                } else {
                    return ({ total: (BigInt(a.total) + BigInt(b[0])), totalBonus: (BigInt(a.totalBonus)), totalReferral: (BigInt(a.totalReferral)), totalICB: (BigInt(a.totalICB) + BigInt(b[1])), data: [...a.data, [(b[0].toString()), (b[1].toString()), (b[2].toString()), (b[3].toString()), (b[4].toString()), (b[5].toString()), (b[6])]] })
                }


            } else {
                return a
            }
        }, initObj)
    },
    hexAddressToBase58: async (hexAddress, tronWeb) => {
        const HEX_PREFIX = "41";
        let retval = hexAddress;
        try {
            if (hexAddress.startsWith("0x")) {
                hexAddress = HEX_PREFIX + hexAddress.substring(2);
            }
            let bArr = tronWeb.utils["code"].hexStr2byteArray(hexAddress);
            retval = tronWeb.utils["crypto"].getBase58CheckAddress(bArr);
        } catch (e) {
            //Handle
            // console.log("e", e)
            // return false;
        }
        return retval;
    },
    icbPackageFunc: async (userIcbAmounts, total) => {
        let package = 0; totalAmount = 0;
        if ((userIcbAmounts) <= 5000000) {
            package = 1000;
            totalAmount = BigInt(BigInt(total) + BigInt(1000))
        } else if ((userIcbAmounts) <= 27777777) {
            package = 5000;
            totalAmount = BigInt(BigInt(total) + BigInt(5000))
        } else if ((userIcbAmounts) <= 66666666) {
            package = 10000;
            totalAmount = BigInt(BigInt(total) + BigInt(10000))
        } else {
            package = 30000;
            totalAmount = BigInt(BigInt(total) + BigInt(30000))
        }
        return ({
            package,
            totalAmount
        })
    },
    characterString: async (length = 12, includeUppercase = true, includeNumbers = true, includeSymbols = true) => {
        const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
        const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const numberChars = '0123456789';
        const symbolChars = '!@#$%^&*()-=_+[]{}|;:,.<>?/';

        let allChars = lowercaseChars;

        if (includeUppercase) {
            allChars += uppercaseChars;
        }

        if (includeNumbers) {
            allChars += numberChars;
        }

        if (includeSymbols) {
            allChars += symbolChars;
        }

        let password = '';

        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * allChars.length);
            password += allChars.charAt(randomIndex);
        }

        return password;
    },
    generateOTP: async (codelength) => {
        return Math.floor(Math.random() * (Math.pow(10, (codelength - 1)) * 9)) + Math.pow(10, (codelength - 1));
    },
    generateReferralCode: async (length) => {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const charactersLength = characters.length;
        let code = '';
        for (let i = 0; i < length; i++) {
            code += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return code;
    }
};