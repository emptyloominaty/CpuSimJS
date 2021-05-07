/*----------functions-------------*/
let functions = {
    convert8to16 : function(byteB,byteA) {
        let result = (((byteA & 0xFF) << 8) | (byteB & 0xFF))
        let sign = byteA & (1 << 7)
        let x = (((byteA & 0xFF) << 8) | (byteB & 0xFF))
        if (sign) {
            result = 0xFFFF0000 | x
        }
        return result
    },
    convert16to8 : function(firstNumber) {
        let high = ((firstNumber >> 8) & 0xff)
        let low = firstNumber & 0xff
        return [low,high]
    },
    decimalToHex: function(d, padding) {
        let hex = Number(d).toString(16);
        padding = typeof (padding) === "undefined" || padding === null ? padding = 2 : padding;
        while (hex.length < padding) {
            hex = "0" + hex;
        }
        //return "0x"+hex;
        return hex;
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