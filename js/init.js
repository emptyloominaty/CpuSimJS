/*----------CPU-------------*/
let cpu = {
    bit: 16,
    maxPc:  Math.pow(2, this.bit),
    registers: {},
    init: function() {
        cpu.createRegisters()
    },
    compute: function() {
        let inst = cpu.fetchC()
        cpu.execute(inst)
    },
    fetchC: function() {
        //fetch first byte (opcode)
        let op = memory.data[this.registers.pc]
        let bytes = cpu.decode(op) //1,2,3,4

        let instructionCache = new Array(4).fill(0)
        this.registers.pc++

        // save opcode to [0]
        instructionCache[0] = op
        console.log(op+"- ("+bytes+"B)") //test

        //fetch all bytes
        for (let i = 1; i < bytes; i++) {
            instructionCache[i] = memory.data[this.registers.pc]
            this.registers.pc++
        }

        /*if (this.registers.pc>this.maxPc) {
            this.registers.pc = 0
        }*/

        return instructionCache
    },
    decode: function(op) {
        return opCodeList[op].bytes
    },
    execute: function(inst) {
        switch (inst[0]) {
            case 0: {//NOP
                control.debug.push({text:"No Operation"})
                break
            }
            case 1: { //ADD
                this.registers["r" + inst[3]] = (this.registers["r" + inst[1]] + this.registers["r" + inst[2]])
                control.debug.push({text:"  r"+inst[2]+"("+this.registers["r" + inst[2]]+") +" +" r"+inst[1]+"("+this.registers["r" + inst[1]]+") = "+"r" + inst[3]+"("+this.registers["r" + inst[3]]+")"})
                break
            }
            case 2: { //SUB
                this.registers["r" + inst[3]] = (this.registers["r" + inst[1]] - this.registers["r" + inst[2]])
                control.debug.push({text:" r"+inst[2]+"("+this.registers["r" + inst[2]]+") -" +" r"+inst[1]+"("+this.registers["r" + inst[1]]+") = "+"r" + inst[3]+"("+this.registers["r" + inst[3]]+")"})
                break
            }
            case 3: { //LD
                let memoryAddress = functions.convert8to16(inst[2],inst[3])
                let byte1 = memory.data[memoryAddress]
                let byte2 = memory.data[memoryAddress+1]
                this.registers["r"+inst[1]] = functions.convert8to16(byte1,byte2)
                control.debug.push({text:"Loaded data from mem"+memoryAddress+" to r"+inst[1]})
                break
            }
            case 4: {//ST
                let memoryAddress = functions.convert8to16(inst[2], inst[3])
                let bytes = functions.convert16to8(this.registers["r" + inst[1]])
                memory.data[memoryAddress] = bytes[0]
                memory.data[memoryAddress+1] = bytes[1]
                control.debug.push({text:"Stored data from r"+inst[1]+" to mem"+ memoryAddress})
                break
            }
            case 255: { //Stop
                clearInterval(run)
                control.debug.push({text:"Cpu Stopped"})
                control.printDebug()
                break
            }
        }
    },
    createRegisters: function() {
        this.registers = {r1:0, r2:0, r3:0, r4:0, r5:0, r6:0, r7:0, r8:0, r9:0 ,r10:0, r11:0, r12:0, r13:0, r14:0, pc:0, flags:{N:0,O:0,Z:0,C:0}}
    },
}

/*----------MEMORY-------------*/
let memory = {
    memorySize:65536,
    data: 0,
    init: function() {
        this.data = new Array(this.memorySize).fill(0)
    }
}

/*------------------------*/
let control = {
    reset: function(){
        cpu.init() //reset registers
        memory.init() //reset ram
    },
    debug: [],
    printDebug: function() {
        let loop = Object.keys(this.debug).length
        for (let i = 0; i<loop; i++) {
            console.log(this.debug[i].text) //TODO: print to html not console
        }
    },
    printRegisters: function() {
            console.log(cpu.registers) //TODO: print to html not console
    }
}

/*----------Op Codes List-------------*/
let opCodeList = {
    0: {bytes:1,name:"No Operation"},
    1: {bytes:4,name:"Add"},
    2: {bytes:4,name:"Sub"},
    3: {bytes:4,name:"Load"},
    4: {bytes:4,name:"Store"},
    255: {bytes:1,name:"Stop"},
}

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


}
//config
let clockHz = 5

//main
cpu.init()
memory.init()
control.reset() //test

//----------------------------------------------------------------------TEST ONLY
memory.data[50]=5
memory.data[52]=3
memory.data[54]=10
memory.data[56]=-5
memory.data[58]=-3

//load a
memory.data[0]=3
memory.data[1]=0
memory.data[2]=50
memory.data[3]=0

//load b
memory.data[4]=3
memory.data[5]=1
memory.data[6]=52
memory.data[7]=0

//add  r3=r1+r2
memory.data[8]=1
memory.data[9]=0
memory.data[10]=1
memory.data[11]=2

//store c
memory.data[12]=4
memory.data[13]=2
memory.data[14]=24
memory.data[15]=0

//sub r3=r1-r2
memory.data[8]=1
memory.data[9]=0
memory.data[10]=1
memory.data[11]=2

memory.data[16]=255

//----------------------------------------------------------------------TEST ONLY

let clock = 1 / clockHz * 1000
let run = setInterval(cpu.compute, clock)

//console log tests
console.log(memory.data)
control.printRegisters()
