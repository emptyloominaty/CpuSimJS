//config
let clockHz = 25

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


/*----------CPU-------------*/
let cpu = {
    //TEST start
    timeA: 0,
    timeB: 0,
    timeC: 0,
    timeD: 0,
    //TEST end
    bit: 16,
    status: "Off",
    maxPc:  Math.pow(2, this.bit),
    cpuData: {op:0,decoded:0,bytes:0,cycles:0,InstructionCache:0,inst:0,phase:0,bytesLeft:0,fetchI:1,cyclesI:0},
    registers: {},
    init: function() {
        cpu.createRegisters()
    },
    compute: function() {
        cpu.timeA = Date.now()
        cpu.timeC = (cpu.timeA-cpu.timeB)
        cpu.timeB = Date.now()

        let phase = cpu.cpuData.phase
        if (phase===0) {
            cpu.fetchStart()
        } else if (phase===1) {
            cpu.fetchBytes()
        } else if (phase===2) {
            if (cpu.cpuData.cyclesI>0) {
                cpu.cpuData.cyclesI--
            }
            if (cpu.cpuData.cyclesI===0) {
                cpu.cpuData.phase++
            }
        } else if (phase===3) {
            let inst = cpu.cpuData.instructionCache
            cpu.execute(inst)
        }
        //update screen
        control.updateHTML()
    },
    fetchStart: function() {
           //fetch first byte (opcode)
        cpu.cpuData.op = memory.data[cpu.registers.pc]
        cpu.cpuData.decoded = cpu.decode(cpu.cpuData.op)
        cpu.cpuData.bytes = cpu.cpuData.decoded[0]
        cpu.cpuData.cycles = cpu.cpuData.decoded[1]
        cpu.cpuData.bytesLeft = cpu.cpuData.bytes
        cpu.cpuData.cyclesI = cpu.cpuData.cycles-cpu.cpuData.bytes

        cpu.cpuData.instructionCache = new Array(5).fill(0)
        cpu.registers.pc++

        // save opcode to [0]
        cpu.cpuData.instructionCache[0] = cpu.cpuData.op
        console.log("OP: "+cpu.cpuData.op+"  PC:"+cpu.registers.pc+" SP:"+cpu.registers.sp) //test

        cpu.cpuData.phase++
    },
    fetchBytes: function() {
        //fetch all bytes
        if(cpu.cpuData.bytesLeft>1) {
            cpu.cpuData.instructionCache[cpu.cpuData.fetchI] = memory.data[cpu.registers.pc]
            cpu.registers.pc++
            cpu.cpuData.fetchI++
            cpu.cpuData.bytesLeft--
        } else {
            cpu.cpuData.phase++
            cpu.cpuData.fetchI=1
        }
        if (cpu.registers.pc>cpu.maxPc) {
            cpu.registers.pc = 256
        }
    },
    decode: function(op) {
        if(opCodeList[op]) {
            return [opCodeList[op].bytes, opCodeList[op].cycles]
        } else {
            return [1, 1]
        }
    },
    execute: function(inst) {
        switch (inst[0]) {
            case 0: {//NOP
                break
            }
            case 1: { //ADD
                this.registers["r" + inst[3]] = (this.registers["r" + inst[1]] + this.registers["r" + inst[2]])
                this.setFlags(this.registers["r" + inst[3]])
                if(this.registers.flags.C===true) {
                    this.registers["r" + inst[3]]=(this.registers["r" + inst[3]]-32768)
                }
                break
            }
            case 2: { //SUB
                this.registers["r" + inst[3]] = (this.registers["r" + inst[1]] - this.registers["r" + inst[2]])
                this.setFlags(this.registers["r" + inst[3]])
                break
            }
            case 3: { //LD
                let memoryAddress = functions.convert8to16(inst[2],inst[3])
                let byte1 = memory.data[memoryAddress]
                let byte2 = memory.data[memoryAddress+1]
                this.registers["r"+inst[1]] = functions.convert8to16(byte1,byte2)
                break
            }
            case 4: {//ST
                let memoryAddress = functions.convert8to16(inst[2], inst[3])
                let bytes = functions.convert16to8(this.registers["r" + inst[1]])
                memory.data[memoryAddress] = bytes[0]
                memory.data[memoryAddress+1] = bytes[1]
                break
            }
            case 5: { //LDI
                let value = functions.convert8to16(inst[2],inst[3])
                this.registers["r"+inst[1]] = value
                break
            }
            case 6: { //JMP
                let value = functions.convert8to16(inst[1],inst[2])
                this.registers.pc = value
                break
            }
            case 7: { //JSR
                let value = functions.convert8to16(inst[1],inst[2])
                let pcBytes = functions.convert16to8(this.registers.pc)
                memory.data[this.registers.sp] = pcBytes[0] //low
                this.registers.sp++
                memory.data[this.registers.sp] = pcBytes[1] //high
                this.registers.sp++
                this.registers.pc = value
                break
            }
            case 8: { //RFS
                this.registers.pc = functions.convert8to16(memory.data[this.registers.sp-2],memory.data[this.registers.sp-1])
                this.registers.sp-=2
                break
            }
            case 9: { //INC
                this.registers["r" + inst[1]] = (this.registers["r" + inst[1]] + 1)
                break
            }
            case 10: { //DEC
                this.registers["r" + inst[1]] = (this.registers["r" + inst[1]] - 1)
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
                break
            }
            case 15: { //SHL
                this.registers["r" + inst[1]] = (this.registers["r" + inst[1]] << 1)
                this.setFlags(this.registers["r" + inst[1]])
                break
            }
            case 16: { //SHR
                this.registers["r" + inst[1]] = (this.registers["r" + inst[1]] >> 1)
                this.setFlags(this.registers["r" + inst[1]])
                break
            }


            case 37: { //STOP
                control.stopCpu()
                cpu.timeC=cpu.timeA
                break
            }
        }
        //reset cpu phase after execute
        cpu.cpuData.phase=0
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
    el_cpuStatus: document.getElementById("cpuStatus"),
    el_programCounter: document.getElementById("programCounter"),
    el_stackPointer: document.getElementById("stackPointer"),
    el_clockSpeed: document.getElementById("clockRealSpeed"),
    el_cpuInfoFirst: document.getElementById("cpuFirst"),
    el_cpuInfoSecond: document.getElementById("cpuSecond"),
    el_regs: functions.regElements(),
    el_regPc: document.getElementById("regpc"),
    el_regSp: document.getElementById("regsp"),
    el_aluOpcode: document.getElementById("aluOpcode"),
    el_aluName: document.getElementById("aluName"),
    el_aluReg1: document.getElementById("aluReg1"),
    el_aluReg2: document.getElementById("aluReg2"),
    el_aluReg3: document.getElementById("aluReg3"),
    el_allMem: document.getElementById("memAllValues"),
    el_memUsage: document.getElementById("memUsage"),
    el_memVal: document.getElementById("memVal"),
    el_memValHex: document.getElementById("memValHex"),
    el_btnToggleCpu: document.getElementById("btnToggleCpu"),
    el_setCpuClock: document.getElementById("setCpuClock"),
    startCpu: function() {
        cpu.init()
        run = setInterval(cpu.compute, clock)
        cpu.status="Executing"
        this.el_btnToggleCpu.innerText = "Stop"
        control.updateHTML() //update screen
    },
    stopCpu: function() {
        clearInterval(run)
        cpu.status="Stopped"
        this.el_btnToggleCpu.innerText = "Start"
        control.updateHTML() //update screen
    },
    toggleCpu: function() {
        clockHz = this.el_setCpuClock.value
        clock = 1 / clockHz * 1000
        cpuSecondInfo = "Clock:"+clockHz+"hz Ram:"+(memory.memorySize/1024)+"kB"
        control.updateHTMLStart()
      if (cpu.status==="Executing")  {
          this.stopCpu()
      } else {
          this.startCpu()
      }

    },
    reset: function(){
        cpu.init() //reset registers
        memory.init() //reset ram
    },
    printRegisters: function() {
            console.log(cpu.registers)
    },
    updateHTML: function() {
        if ((cpu.timeA-cpu.timeD)>16) {
            this.el_cpuStatus.innerHTML = cpu.status
            let clock = Math.round(1 / cpu.timeC* 1000)
            if (clock=="Infinity") { clock=0 }
            this.el_clockSpeed.innerHTML = clock
            cpu.timeD = Date.now()
            control.updateHTMLRegisters()
            control.updateHTMLAlu()
        }
    },
    updateHTMLStart: function() {
        this.el_cpuInfoFirst.innerHTML = cpuFirstInfo
        this.el_cpuInfoSecond.innerHTML = cpuSecondInfo
    },
    updateHTMLRegisters: function() {
        for (let i = 0; i<16; i++) {
            this.el_regs[i].innerHTML=cpu.registers["r"+i]
        }
        this.el_regPc.innerHTML = cpu.registers.pc
        this.el_regSp.innerHTML = cpu.registers.sp
    },
    updateHTMLAlu: function() {
        this.el_aluOpcode.innerHTML = cpu.cpuData.instructionCache[0]
        this.el_aluName.innerHTML = opCodeList[cpu.cpuData.instructionCache[0]].name
        this.el_aluReg1.innerHTML = cpu.cpuData.instructionCache[1]
        this.el_aluReg2.innerHTML = cpu.cpuData.instructionCache[2]
        this.el_aluReg3.innerHTML = cpu.cpuData.instructionCache[3]
    },
    getAllMemoryValues: function() {
        let text = ""
        for (let i=0; i<memory.memorySize; i++) {
            if (memory.data[i]!==0) {
                text+="<span>"+functions.decimalToHex(memory.data[i],2)+" </span>"
            } else {
                text+="<span style='color:#ba9999'>"+functions.decimalToHex(memory.data[i],2)+" </span>"
            }
        }
        this.el_allMem.innerHTML = text
    },
    clearMemoryValuesHTML: function(){
        this.el_allMem.innerHTML = ""
    },
    getMemoryUsage: function() {
        let memorySize = memory.memorySize
        for (let i=0; i<memory.memorySize; i++) {
            if (memory.data[i]!==0) {
                memorySize--
            }
        }
        this.el_memUsage.innerHTML = (memory.memorySize-memorySize) +"/"+ memory.memorySize
    },
    getMemoryValue: function() {
        let getValue = functions.hexToDec(document.getElementById("input_GetMemVal").value)
        document.getElementById("input_GetMemVal").value = "0x"
        this.el_memVal.innerHTML = memory.data[getValue]
        this.el_memValHex.innerHTML = "0x"+functions.decimalToHex(memory.data[getValue],2)
    },

}

/*----------Op Codes List-------------*/
let opCodeList = {
    0: {bytes:1,name:"NOP",cycles:1},   //No operation
    1: {bytes:4,name:"ADD",cycles:5},   //Add
    2: {bytes:4,name:"SUB",cycles:5},   //Subtract
    3: {bytes:4,name:"LD",cycles:5},    //Load
    4: {bytes:4,name:"ST",cycles:5},    //Store
    5: {bytes:4,name:"LDI",cycles:4},   //Load Immediate
    6: {bytes:3,name:"JMP",cycles:4},   //Jump
    7: {bytes:3,name:"JSR",cycles:6},   //Jump to Subroutine
    8: {bytes:1,name:"RFS",cycles:6},   //Return From Subroutine
    9: {bytes:2,name:"INC",cycles:3},   //Increment by 1
    10: {bytes:2,name:"DEC",cycles:3},  //Decrement by 1
    11: {bytes:4,name:"ADC",cycles:5},  //Add with Carry //TODO:FIX?
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

    31: {bytes:4,name:"MUL",cycles:12},  //TODO:Multiply
    32: {bytes:4,name:"DIV",cycles:35},  //TODO:Divide

    33: {bytes:1,name:"TRP",cycles:2},  //TODO:Transfer Register(r14) to Program Counter
    34: {bytes:1,name:"TPR",cycles:2},  //TODO:Transfer Program Counter to Register(r14)

    35: {bytes:3,name:"AD2",cycles:4},  //TODO:Add but A=A+B
    36: {bytes:3,name:"SU2",cycles:4},  //TODO:Sub but A=A-B

    37: {bytes:1,name:"STOP",cycles:1},
}


//main
control.reset() //test
control.updateHTML() //update screen
let cpuFirstInfo = "EMP 1 "+ cpu.bit+"bit CPU"
let cpuSecondInfo = "Clock:"+clockHz+"hz Ram:"+(memory.memorySize/1024)+"kB"
control.updateHTMLStart()
let clock = 1 / clockHz * 1000
let run //Interval

//control.startCpu() //only for debugging?

//----------------------------------------------------------------------TEST ONLY
memory.data[300]=5  //(44,1)
memory.data[301]=0  //(45,1)
memory.data[302]=48  //(46,1)
memory.data[303]=1 //(47,1)
memory.data[304]=127 //(48,1)
memory.data[305]=1 //(49,1)
memory.data[306]=120 //(50,1)
memory.data[307]=0 //(51,1)
memory.data[308]=3 //(52,1)
memory.data[309]=0 //(53,1)

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

//JSR
memory.data[336]=7
memory.data[337]=84 //340
memory.data[338]=1

//inc
memory.data[340]=9
memory.data[341]=0

//RFS
memory.data[342]=8

//RFS
memory.data[339]=8

//stop
memory.data[283]=37

//----------------------------------------------------------------------TEST ONLY

//console log tests
console.log(memory.data)
control.printRegisters()

