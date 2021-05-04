//config
let clockHz = 20

/*----------CPU-------------*/
let cpu = {
    //TEST start
    timeA: 0,
    timeB: 0,
    timeC: 0,
    timeCArray: [clockHz,clockHz,clockHz,clockHz],
    timeD: 0,
    timeI: 0,
    //TEST end
    bit: 16,
    status: "Off",
    maxPc:  Math.pow(2, this.bit),
    cpuData: {op:0,decoded:0,bytes:0,cycles:0,InstructionCache:0,inst:0},
    registers: {},
    init: function() {
        cpu.createRegisters()
    },
    compute: function() {
        cpu.cpuData.inst = cpu.fetchC()
        cpu.execute(cpu.cpuData.inst)
    },
    fetchC: function() {
           //fetch first byte (opcode)
        cpu.cpuData.op = memory.data[this.registers.pc]
        cpu.cpuData.decoded = cpu.decode(cpu.cpuData.op) //1,2,3,4
        cpu.cpuData.bytes = cpu.cpuData.decoded[0]
        cpu.cpuData.cycles = cpu.cpuData.decoded[1]

        //TEST start
        this.timeA = Date.now()
        cpu.timeC = (this.timeA-this.timeB)/cpu.cpuData.cycles
        cpu.timeCArray[cpu.timeI] = cpu.timeC
        cpu.timeI++
        if (cpu.timeI>3) {cpu.timeI=0}
        this.timeB = Date.now()
        //TEST end

        clearInterval(run)
        run = setInterval(cpu.compute, clock*cpu.cpuData.cycles) //TODO?

        cpu.cpuData.instructionCache = new Array(5).fill(0)
        this.registers.pc++

        // save opcode to [0]
        cpu.cpuData.instructionCache[0] = cpu.cpuData.op
        console.log("OP: "+cpu.cpuData.op+"  PC:"+this.registers.pc+" SP:"+this.registers.sp) //test

        //fetch all bytes
        for (let i = 1; i < cpu.cpuData.bytes; i++) {
            cpu.cpuData.instructionCache[i] = memory.data[this.registers.pc]
            this.registers.pc++
        }

        if (this.registers.pc>this.maxPc) {
            this.registers.pc = 256
        }

        return cpu.cpuData.instructionCache
    },
    decode: function(op) {
        return [opCodeList[op].bytes,opCodeList[op].cycles]
    },
    execute: function(inst) {
        switch (inst[0]) {
            case 0: {//NOP
                control.debug.push({text:"No Operation"})
                break
            }
            case 1: { //ADD
                this.registers["r" + inst[3]] = (this.registers["r" + inst[1]] + this.registers["r" + inst[2]])
                this.setFlags(this.registers["r" + inst[3]])
                if(this.registers.flags.C===true) {
                    this.registers["r" + inst[3]]=(this.registers["r" + inst[3]]-32768)
                }
                control.debug.push({text:"  r"+inst[1]+"("+this.registers["r" + inst[1]]+") +" +" r"+inst[2]+"("+this.registers["r" + inst[2]]+") = "+"r" + inst[3]+"("+this.registers["r" + inst[3]]+")"})
                break
            }
            case 2: { //SUB
                this.registers["r" + inst[3]] = (this.registers["r" + inst[1]] - this.registers["r" + inst[2]])
                this.setFlags(this.registers["r" + inst[3]])
                control.debug.push({text:" r"+inst[1]+"("+this.registers["r" + inst[1]]+") -" +" r"+inst[2]+"("+this.registers["r" + inst[2]]+") = "+"r" + inst[3]+"("+this.registers["r" + inst[3]]+")"})
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
            case 5: { //LDV
                let value = functions.convert8to16(inst[2],inst[3])
                this.registers["r"+inst[1]] = value
                control.debug.push({text:"Loaded data "+value+" to r"+inst[1]})
                break
            }
            case 6: { //JMP
                let value = functions.convert8to16(inst[1],inst[2])
                this.registers.pc = value
                control.debug.push({text:"Jumped to "+value})
                break
            }
            case 7: { //JSR
                let value = functions.convert8to16(inst[1],inst[2])
                memory.data[this.registers.sp] = this.registers.pc
                this.registers.sp++
                this.registers.pc = value
                control.debug.push({text:"Jumped to "+value})
                break
            }
            case 8: { //RFS
                this.registers.pc = memory.data[this.registers.sp-1]
                this.registers.sp--
                control.debug.push({text:"Returned"})
                break
            }
            case 9: { //INC
                this.registers["r" + inst[1]] = (this.registers["r" + inst[1]] + 1)
                control.debug.push({text:"  r"+inst[1]+"("+this.registers["r" + inst[1]]+") +1"})
                break
            }
            case 10: { //DEC
                this.registers["r" + inst[1]] = (this.registers["r" + inst[1]] - 1)
                control.debug.push({text:"  r"+inst[1]+"("+this.registers["r" + inst[1]]+") -1"})
                break
            }
            case 11: { //ADC
                if (this.registers.flags.C) {
                    this.registers["r" + inst[3]] = (this.registers["r" + inst[1]] + this.registers["r" + inst[2]])+1
                } else {
                    this.registers["r" + inst[3]] = (this.registers["r" + inst[1]] + this.registers["r" + inst[2]])
                }
                this.setFlags(this.registers["r" + inst[3]])
                if(this.registers.flags.C===true) {
                    this.registers["r" + inst[3]]=(this.registers["r" + inst[3]]-32768)
                }
                control.debug.push({text:"(C)  r"+inst[1]+"("+this.registers["r" + inst[1]]+") +" +" r"+inst[2]+"("+this.registers["r" + inst[2]]+") = "+"r" + inst[3]+"("+this.registers["r" + inst[3]]+")"})
                break
            }
            case 15: { //SHL
                this.registers["r" + inst[1]] = (this.registers["r" + inst[1]] << 1)
                this.setFlags(this.registers["r" + inst[1]])
                control.debug.push({text:"Shifted  r"+inst[1]+" Left"})
                break
            }
            case 16: { //SHR
                this.registers["r" + inst[1]] = (this.registers["r" + inst[1]] >> 1)
                this.setFlags(this.registers["r" + inst[1]])
                control.debug.push({text:"Shifted  r"+inst[1]+" Right"})
                break
            }


            case 255: { //STOP
                clearInterval(run)
                this.status="Stopped"
                this.timeCArray= [0,0,0,0],
                control.debug.push({text:"Cpu Stopped"})
                control.printDebug()
                break
            }
        }
        //update screen
        control.updateHTML()
    },
    setFlags: function(input) {
        this.registers.flags.Z = (input===0)
        this.registers.flags.N = (input<0)
        this.registers.flags.C = (input>32767)
    },
    createRegisters: function() {
        this.registers = {r0:0,r1:0, r2:0, r3:0, r4:0, r5:0, r6:0, r7:0, r8:0, r9:0 ,r10:0, r11:0, r12:0, r13:0, r14:0, r15:0, sp:0, pc:256, flags:{N:false,O:false,Z:false,C:false}}
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
            console.log(this.debug[i].text)
        }
    },
    printRegisters: function() {
            console.log(cpu.registers)
    },
    updateHTML: function() {
        if ((cpu.timeA-cpu.timeD)>16) {
            document.getElementById("cpuStatus").innerHTML = cpu.status
            document.getElementById("programCounter").innerHTML = cpu.registers.pc
            document.getElementById("stackPointer").innerHTML = cpu.registers.sp
            document.getElementById("registersAll").innerHTML = JSON.stringify(cpu.registers)
            let clock = Math.round((1 / ((cpu.timeCArray[0] + cpu.timeCArray[1] + cpu.timeCArray[2] + cpu.timeCArray[3]) / 4)* 1000) * 10) / 10
            if (clock=="Infinity") { clock=0 }
            document.getElementById("clockRealSpeed").innerHTML = clock
            cpu.timeD = Date.now()
        }
    }
}

/*----------Op Codes List-------------*/
let opCodeList = {
    0: {bytes:1,name:"NOP",cycles:1},   //No operation
    1: {bytes:4,name:"ADD",cycles:5},   //Add
    2: {bytes:4,name:"SUB",cycles:5},   //Subtract
    3: {bytes:4,name:"LD",cycles:5},    //Load
    4: {bytes:4,name:"ST",cycles:5},    //Store
    5: {bytes:4,name:"LDV",cycles:4},   //Load Value
    6: {bytes:3,name:"JMP",cycles:4},   //Jump
    7: {bytes:3,name:"JSR",cycles:6},   //Jump to Subroutine
    8: {bytes:1,name:"RFS",cycles:6},   //Return From Subroutine
    9: {bytes:2,name:"INC",cycles:3},   //Increment by 1
    10: {bytes:2,name:"DEC",cycles:3},  //Decrement by 1
    11: {bytes:4,name:"ADC",cycles:5},  //Add with Carry
    12: {bytes:4,name:"SUC",cycles:5},  //TODO:Subtract with Carry
    13: {bytes:2,name:"ROL",cycles:3},  //TODO:Rotate Left
    14: {bytes:2,name:"ROR",cycles:3},  //TODO:Rotate Right
    15: {bytes:2,name:"SHL",cycles:3},  //Shift Left
    16: {bytes:2,name:"SHR",cycles:3},  //Shift Right
    17: {bytes:3,name:"TR",cycles:4},   //TODO:Transfer Register to Register
    18: {bytes:1,name:"TRS",cycles:2},  //TODO:Transfer Register(r15) to Stack Pointer
    19: {bytes:1,name:"TSR",cycles:2},  //TODO:Transfer Stack pointer to Register(r15)
    20: {bytes:2,name:"PSH",cycles:4},  //TODO:Push to stack
    21: {bytes:2,name:"POP",cycles:4},  //TODO:Pop from stack
    22: {bytes:4,name:"AND",cycles:5},  //TODO:Logical AND
    23: {bytes:4,name:"OR",cycles:5},   //TODO:Logical OR
    24: {bytes:4,name:"XOR",cycles:5},  //TODO:Logical XOR

    25: {bytes:3,name:"JG",cycles:5},    //TODO:Conditional Jump if greater
    26: {bytes:3,name:"JL",cycles:5},    //TODO:Conditional Jump if less
    27: {bytes:3,name:"JNG",cycles:5},   //TODO:Conditional Jump if not greater
    28: {bytes:3,name:"JNL",cycles:5},   //TODO:Conditional Jump if not less
    29: {bytes:3,name:"JE",cycles:5},    //TODO:Conditional Jump if equal
    30: {bytes:3,name:"JNE",cycles:5},   //TODO:Conditional Jump if not equal

    31: {bytes:4,name:"MUL",cycles:7},   //TODO:Multiply
    32: {bytes:4,name:"DIV",cycles:35},  //TODO:Divide


    254: {bytes:3,name:"WAIT",cycles:3}, //TODO:Wait (1-65536) Cycles
    255: {bytes:1,name:"STOP",cycles:1},
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

//main
cpu.init()
memory.init()
control.reset() //test
control.updateHTML() //update screen
console.log("EMP 1 "+ cpu.bit+"bit CPU")
console.log("Clock:"+clockHz+"hz Ram:"+(memory.memorySize/1024)+"kB")
//----------------------------------------------------------------------TEST ONLY
memory.data[300]=5  //(44,1)
memory.data[302]=48  //(46,1)
memory.data[303]=117 //(47,1)
memory.data[304]=127 //(48,1)
memory.data[305]=127 //(49,1)
memory.data[306]=120 //(50,1)
memory.data[308]=-3 //(52,1)

//load
memory.data[256]=3
memory.data[257]=0
memory.data[258]=44  //300
memory.data[259]=1

//load
memory.data[260]=3
memory.data[261]=1
memory.data[262]=46 //302
memory.data[263]=1

//add
memory.data[264]=1
memory.data[265]=0
memory.data[266]=1
memory.data[267]=2

//store
memory.data[268]=4
memory.data[269]=2
memory.data[270]=50 //306
memory.data[271]=1

//sub
memory.data[272]=2
memory.data[273]=0
memory.data[274]=1
memory.data[275]=3

//store
memory.data[276]=4
memory.data[277]=3
memory.data[278]=52 //308
memory.data[279]=1

//JSR
memory.data[280]=7
memory.data[281]=54 //310
memory.data[282]=1

//SHL
memory.data[310]=15
memory.data[311]=0

//SHL
memory.data[312]=16
memory.data[313]=0

//load
memory.data[314]=3
memory.data[315]=4
memory.data[316]=48  //300
memory.data[317]=1

//adc
memory.data[318]=11
memory.data[319]=1 
memory.data[320]=4
memory.data[321]=8

//adc
memory.data[322]=11
memory.data[323]=0
memory.data[324]=0
memory.data[325]=7

//store
memory.data[326]=4
memory.data[327]=7
memory.data[328]=94 //350
memory.data[329]=1

//store
memory.data[330]=4
memory.data[331]=8
memory.data[332]=96 //352
memory.data[333]=1

//inc
memory.data[334]=9
memory.data[335]=0

//JMP
memory.data[336]=0x06
memory.data[337]=0x4e //334
memory.data[338]=0x01

//RFS
memory.data[336]=8

//stop
memory.data[283]=255

//----------------------------------------------------------------------TEST ONLY

let clock = 1 / clockHz * 1000
let run = setInterval(cpu.compute, clock)
cpu.status="Executing"

//console log tests
console.log(memory.data)
control.printRegisters()

