/*----------functions-------------*/
let convertTo16Signed = function(data) {
    if(data > 32767) {data = data - 65536}
    if(data < -32768) {data = data + 65536}
    return data
}


let functions = {
    convert8to16: function (byteA, byteB) {
        let result = (((byteA & 0xFF) << 8) | (byteB & 0xFF))
        let sign = byteA & (1 << 7)
        let x = (((byteA & 0xFF) << 8) | (byteB & 0xFF))
        if (sign) {
            result = 0xFFFF0000 | x
        }
        return result
    },
    convert16to8: function (firstNumber) {
        let high = ((firstNumber >> 8) & 0xff)
        let low = firstNumber & 0xff
        return [high, low]
    },
    convert24to8: function (value) {
        let bytes = []
        bytes[0] = value & 0xff
        bytes[1] = (value >> 8) & 0xff
        bytes[2] = (value >> 16) & 0xff
        return bytes
    },
    convert8to24: function (byte1, byte2, byte3) {
        let ret = (byte3) << 16
        ret |= (byte2) << 8
        ret |= byte1
        return ret
    },
    convert8bitsto1byte: function (bytesArray) {
        let ret
        ret = (bytesArray[7]) << 7
        ret |= (bytesArray[6]) << 6
        ret |= (bytesArray[5]) << 5
        ret |= (bytesArray[4]) << 4
        ret |= (bytesArray[3]) << 3
        ret |= (bytesArray[2]) << 2
        ret |= (bytesArray[1]) << 1
        ret |= bytesArray[0]
        return ret
    },
    convert1byteto8bits: function (value) {
        let bytes =[]
        bytes[0] = value & 0x01
        bytes[1] = (value >> 1) & 0x01
        bytes[2] = (value >> 2) & 0x01
        bytes[3] = (value >> 3) & 0x01
        bytes[4] = (value >> 4) & 0x01
        bytes[5] = (value >> 5) & 0x01
        bytes[6] = (value >> 6) & 0x01
        bytes[7] = (value >> 7) & 0x01
        return bytes
    },
    decimalToHex: function(d, padding) {
        let hex = Number(d).toString(16);
        padding = typeof (padding) === "undefined" || padding === null ? padding = 2 : padding
        while (hex.length < padding) {
            hex = "0" + hex
        }
        //return "0x"+hex;
        return hex
    },
    hexToDec: function(hex) {
        return Number(hex)
    },
    regElements: function() {
        let el_reg =  new Array(16).fill(0)
        for (let i = 0; i<16; i++) {
            el_reg[i] = document.getElementById("reg"+i)
        }
        return el_reg
    }
}


const bitwiseRotation = bitWidth => {
    const bitMask = (2 ** bitWidth) - 1
    const maskedRotation = (rotation) => rotation & (bitWidth - 1)
    return {
        ror: (value, r) => {
            const rotation = maskedRotation(r)
            let data = (value >>> rotation) |
                ((value << (bitWidth - rotation)) & bitMask)
            data = convertTo16Signed(data)
            return (
                data
            )
        },
        rol: (value, r) => {
            const rotation = maskedRotation(r)
            let data =     ((value << rotation) & bitMask) |
                (value >>> (bitWidth - rotation))
            data = convertTo16Signed(data)
            return (
                data
            )
        },
    }
}

//const { ror: rorInt8, rol: rolInt8 } = bitwiseRotation(8);
const { ror: rorInt16, rol: rolInt16 } = bitwiseRotation(16)





