/*----------CPU-------------*/
let cpu = {
    bit: 16,
    maxPc:  Math.pow(2, this.bit),
    registers: 0,
    init: function() {
        this.createRegisters()
    },
    createRegisters: function() {
        this.registers = {a:0, b:0, c:0, d:0, e:0, f:0, g:0, h:0, i:0 ,j:0, k:0, l:0, m:0, n:0, pc:0, flags:{N:0,O:0,Z:0,C:0}}
    },
    compute: function() {
        let inst = this.fetch()
        this.execute(inst)
    },
    fetch: function() {
        let op = memory.data[this.registers.pc]
        let bytes = this.decode(op) //1,2,3,4
        let instructionCache = new Array(4).fill(0)
        this.registers.pc++

        // save opcode to 0
        instructionCache[0] = op

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
    decode: function() {

    },
    execute: function(inst) {
        //swtich-case idk
    }
}

/*----------MEMORY-------------*/
let memory = {
    memorySize:65536, //max 65536 addresses (16bit)
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
    }
}

/*----------Op Codes List-------------*/
let opCode = {
    0: {bytes:1,name:"No Operation"},
    1: {bytes:4,name:"Add"},
}

//main
cpu.init()
memory.init()
control.reset() //test
cpu.compute()

//console log tests
console.log(memory.data)