importScripts('opcodes.js')
importScripts('functions.js')
importScripts('characters.js')
importScripts('config.js')

let run
let clock = 25
let stop = 0
let loop
let clockType = 0 //0=low 1=high 2=max
let interruptHw = 0
let interruptType = 0
let interruptCycles = 0


let cpu = {
    timeA: 0,
    timeB: 0,
    timeC: 0,
    timeD: 0,
    timeE: 0,
    timeF: 0,
    timeG: 0,
    timeH: 0,
    ping: 0,
    cyclesPerSec: 0,
    clockReal: 0,
    bit: 16,
    maxPc:  (Math.pow(2, 16)-1),
    cpuData: {op:0,decoded:0,bytes:0,cycles:0,instructionCache:0,inst:0,phase:0,bytesLeft:0,fetchI:1,cyclesI:0},
    registers: {},
    init: function() {
        cpu.createRegisters()
    },
    compute: function() {
        cpu.timeA = performance.now()
        cpu.timeC = (cpu.timeA-cpu.timeB)
        cpu.timeB = performance.now()

        let phase = cpu.cpuData.phase
        switch (phase) {
            case 0: { //FETCH OPCODE
                if (interruptHw === 0 || cpu.registers.flags.ID === 1 || cpu.registers.flags.ID === true || cpu.registers.flags.I === 1 || cpu.registers.flags.I === true) {
                    cpu.fetchStart()
                } else {
                    if (interruptCycles===0) {
                        cpu.cpuData.op = 46
                        cpu.cpuData.instructionCache = new Array(5).fill(0)
                        cpu.cpuData.instructionCache[0] = 46
                        cpu.cpuData.instructionCache[1] = interruptType
                    }
                    interruptCycles++
                    if (interruptCycles>5) {
                        cpu.cpuData.phase = 3
                        interruptHw = 0
                        interruptCycles = 0
                    }
                }
                break
            }
            case 1: { //FETCH OTHER BYTES
                cpu.fetchBytes()
                break
            }
            case 2: { //EXECUTE1
                if (cpu.cpuData.cyclesI>0) {
                    cpu.cpuData.cyclesI--
                }
                if (cpu.cpuData.cyclesI<=0) {
                    cpu.cpuData.phase++
                }
                break
            }
            case 3: { //EXECUTE2
                //postMessage({data:"debug",log:"OP: "+opCodeList[cpu.cpuData.op].name+"  PC:"+cpu.registers.pc+" SP:"+cpu.registers.sp+" -- "+cpu.cpuData.instructionCache[1]+" | "+cpu.cpuData.instructionCache[2]+" | "+cpu.cpuData.instructionCache[3]+" | "+cpu.cpuData.instructionCache[4]})
                //console.log("OP: "+cpu.cpuData.op+"  PC:"+cpu.registers.pc+" SP:"+cpu.registers.sp+" -- "+cpu.cpuData.instructionCache[1]+" | "+cpu.cpuData.instructionCache[2]+" | "+cpu.cpuData.instructionCache[3]+" | "+cpu.cpuData.instructionCache[4]) //test
                cpu.execute(cpu.cpuData.instructionCache)
                break
            }
        }

        if (cpu.registers.pc>cpu.maxPc) {
            cpu.registers.pc = 256
        }

        cpu.cyclesPerSec++
        if (((cpu.timeA-cpu.timeE)>16)) { //62.5
            if (((cpu.timeA-cpu.timeF)>1000)) { //1
                cpu.clockReal = cpu.cyclesPerSec
                cpu.cyclesPerSec=0
                cpu.timeF=performance.now()
            }
            if (((cpu.timeA-cpu.timeG)>cpuBreakTime)) {
                cpu.timeG=performance.now()
                /*---Break----*/
                if (clockType>0) {
                    stop=2
                    loop = setTimeout(function () {
                        stop=0
                        setInterval2(clock)
                    } ,0)
                }
                if (((cpu.timeA-cpu.timeH)>cpuSendMemoryTime)) { //5
                    cpu.timeH=performance.now()
                    cpu.sendMemoryToMainThread()
                }
            }

            cpu.sendDataToMainThread()
            cpu.timeE = performance.now()
        }
    },
    fetchStart: function() {
        //fetch first byte (opcode)
        cpu.cpuData.op = memory.data[cpu.registers.pc]
        cpu.cpuData.decoded = cpu.decode(cpu.cpuData.op)
        cpu.cpuData.bytes = cpu.cpuData.decoded[0]
        cpu.cpuData.cycles = cpu.cpuData.decoded[1]
        cpu.cpuData.bytesLeft = cpu.cpuData.bytes
        cpu.cpuData.cyclesI = (cpu.cpuData.cycles-cpu.cpuData.bytes)-1

        cpu.cpuData.instructionCache = new Array(5).fill(0)
        cpu.registers.pc++

        // save opcode to [0]
        cpu.cpuData.instructionCache[0] = cpu.cpuData.op

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
            case 0: { //STOP
                postMessage({data:"stop"})
                stop = 1
                cpu.timeC=cpu.timeA
                cpu.sendMemoryToMainThread()
                cpu.sendDataToMainThread()
                close()
                break
            }
            case 1: { //ADD
                let output = (this.registers["r" + inst[1]] + this.registers["r" + inst[2]])
                this.registers["r" + inst[3]] = output
                this.setFlags(this.registers["r" + inst[3]])
                if(this.registers.flags.C===true) {
                    this.registers["r" + inst[3]]=(this.registers["r" + inst[3]]-65536)
                }
                break
            }
            case 2: { //SUB
                let output = (this.registers["r" + inst[1]] - this.registers["r" + inst[2]])
                output = functions.intToUint(output,16)
                this.registers["r" + inst[3]] = output
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
                this.registers["r"+inst[1]] = functions.convert8to16(inst[2],inst[3])
                break
            }
            case 6: { //JMP
                this.registers.pc = functions.convert8to16(inst[1],inst[2])
                break
            }
            case 7: { //JSR
                let value = functions.convert8to16(inst[1],inst[2])
                let pcBytes = functions.convert16to8(this.registers.pc)
                memory.data[this.registers.sp] = pcBytes[0]
                this.registers.sp++
                memory.data[this.registers.sp] = pcBytes[1]
                this.registers.sp++
                this.registers.pc = value
                cpu.checkStack()
                break
            }
            case 8: { //RFS
                this.registers.pc = functions.convert8to16(memory.data[this.registers.sp-2],memory.data[this.registers.sp-1])
                this.registers.sp-=2
                cpu.checkStack()
                break
            }
            case 9: { //INC
                let output = (this.registers["r" + inst[1]] + 1)
                this.setFlags(this.registers["r" + inst[1]])
                if (output>65535) {output=0}
                this.registers["r" + inst[1]] = output
                break
            }
            case 10: { //DEC
                let output = (this.registers["r" + inst[1]] - 1)
                this.setFlags(this.registers["r" + inst[1]])
                if (output<0) {output=65535}
                this.registers["r" + inst[1]] = output
                break
            }
            case 11: { //ADC
                let output = 0
                if (this.registers.flags.C) {
                    output =  (this.registers["r" + inst[1]] + this.registers["r" + inst[2]])+1
                } else {
                    output =  (this.registers["r" + inst[1]] + this.registers["r" + inst[2]])
                }
                this.registers["r" + inst[3]] = output
                cpu.setFlags(this.registers["r" + inst[3]])
                if(this.registers.flags.C===true) {
                    this.registers["r" + inst[3]]=(this.registers["r" + inst[3]]-65536)
                }
                break
            }
            /*
          TODO:12
          */
            case 13: { //ROL
                this.registers["r" + inst[1]] = rolInt16(this.registers["r" + inst[1]],1)
                this.setFlags(this.registers["r" + inst[1]])
                break
            }
            case 14: { //ROR
                this.registers["r" + inst[1]] = rorInt16(this.registers["r" + inst[1]],1)
                this.setFlags(this.registers["r" + inst[1]])
                break
            }
            case 15: { //SLL
                this.registers["r" + inst[1]] = (this.registers["r" + inst[1]] << 1)
                this.setFlags(this.registers["r" + inst[1]])
                break
            }
            case 16: { //SLR
                this.registers["r" + inst[1]] = (this.registers["r" + inst[1]] >>> 1)
                this.setFlags(this.registers["r" + inst[1]])
                break
            }
            case 17: { //TRR
                this.registers["r" + inst[2]] = +this.registers["r" + inst[1]]
                this.setFlags(this.registers["r" + inst[1]])
                break
            }
            case 18: { //TRS
                this.registers["sp"] = +this.registers["r15"]
                break
            }
            case 19: { //TSR
                this.registers["r15"] = +this.registers["sp"]
                break
            }
            case 20: { //PSH
                let stackBytes = functions.convert16to8(this.registers["r" + inst[1]])
                memory.data[this.registers.sp] = stackBytes[0]
                this.registers.sp++
                memory.data[this.registers.sp] = stackBytes[1]
                this.registers.sp++
                cpu.checkStack()
                break
            }
            case 21: { //POP
                this.registers["r" + inst[1]] = functions.convert8to16(memory.data[this.registers.sp-2],memory.data[this.registers.sp-1])
                this.registers.sp-=2
                cpu.checkStack()
                break
            }
            case 22: { //AND
                let output = (this.registers["r" + inst[1]] & this.registers["r" + inst[2]])
                this.registers["r" + inst[3]] = output
                this.setFlags(this.registers["r" + inst[3]])
                break
            }
            case 23: { //OR
                let output = (this.registers["r" + inst[1]] | this.registers["r" + inst[2]])
                this.registers["r" + inst[3]] = output
                this.setFlags(this.registers["r" + inst[3]])
                break
            }
            case 24: { //XOR
                let output = (this.registers["r" + inst[1]] ^ this.registers["r" + inst[2]])
                this.registers["r" + inst[3]] = output
                this.setFlags(this.registers["r" + inst[3]])
                break
            }
            case 25: { //JG
                if (this.registers["r" + inst[1]] > this.registers["r" + inst[2]]) {
                    this.registers.pc = functions.convert8to16(inst[3],inst[4])
                }
                break
            }
            case 26: { //JL
                if (this.registers["r" + inst[1]] < this.registers["r" + inst[2]]) {
                    this.registers.pc = functions.convert8to16(inst[3],inst[4])
                }
                break
            }
            case 27: { //JNG
                if (this.registers["r" + inst[1]] <= this.registers["r" + inst[2]]) {
                    this.registers.pc = functions.convert8to16(inst[3],inst[4])
                }
                break
            }
            case 28: { //JNL
                if (this.registers["r" + inst[1]] >= this.registers["r" + inst[2]]) {
                    this.registers.pc = functions.convert8to16(inst[3],inst[4])
                }
                break
            }
            case 29: { //JE
                if (this.registers["r" + inst[1]] === this.registers["r" + inst[2]]) {
                    this.registers.pc = functions.convert8to16(inst[3],inst[4])
                }
                break
            }
            case 30: { //JNE
                if (this.registers["r" + inst[1]] !== this.registers["r" + inst[2]]) {
                    this.registers.pc = functions.convert8to16(inst[3],inst[4])
                }
                break
            }
            case 31: { //MUL
                let output = (this.registers["r" + inst[1]] * this.registers["r" + inst[2]])
                this.setFlags(output)
                if(this.registers.flags.C===true) {
                    output=(output-65536)
                }
                if(this.registers.flags.O===true) {
                    output = 65535
                }
                this.registers["r" + inst[3]] = functions.intToUint(output)
                break
            }
            case 32: { //DIV
                let output = 0
                if ( this.registers["r" + inst[2]]===0) {
                    output = 0
                } else {
                    output = (this.registers["r" + inst[1]] / this.registers["r" + inst[2]])
                }
                output = Math.floor(output)
                this.registers["r" + inst[3]] = output
                this.setFlags(this.registers["r" + inst[3]])
                break
            }
            case 33: { //TRP
                this.registers["pc"] = this.registers["r14"]
                break
            }
            case 34: { //TPR
                this.registers["r14"] = this.registers["pc"]
                break
            }
            case 35: { //AD2
                let output = (this.registers["r" + inst[1]] + this.registers["r" + inst[2]])
                this.registers["r" + inst[1]] = output
                this.setFlags(this.registers["r" + inst[1]])
                if(this.registers.flags.C===true) {
                    this.registers["r" + inst[1]]=(this.registers["r" + inst[1]]-65536)
                }
                break
            }
            case 36: { //SU2
                let output = (this.registers["r" + inst[1]] - this.registers["r" + inst[2]])
                output = functions.intToUint(output,16)
                this.registers["r" + inst[1]] = output
                this.setFlags(this.registers["r" + inst[1]])
                break
            }
            case 37: {//NOP
                break
            }
            case 38: { //SAR
                this.registers["r" + inst[1]] = (this.registers["r" + inst[1]] >> 1)
                this.setFlags(this.registers["r" + inst[1]])
                break
            }
            case 39: { //NOT
                let output = (~ this.registers["r" + inst[1]])
                this.registers["r" + inst[1]] = output
                this.setFlags(this.registers["r" + inst[1]])
                break
            }
            case 40: {//STR
                let memoryAddress = convertTo16Unsigned(this.registers["r"+inst[2]])
                let bytes = functions.convert16to8(this.registers["r" + inst[1]])
                memory.data[memoryAddress] = +bytes[0]
                memory.data[memoryAddress+1] = +bytes[1]
                break
            }
            case 41: { //LDR
                let memoryAddress = convertTo16Unsigned(this.registers["r"+inst[2]])
                let byte1 = memory.data[memoryAddress]
                let byte2 = memory.data[memoryAddress+1]
                this.registers["r"+inst[1]] = functions.convert8to16(byte1,byte2)
                break
            }
            case 42: { //ADDI
                let output = (this.registers["r" + inst[1]] + (functions.convert8to16(inst[2],inst[3])))
                this.registers["r" + inst[1]] = output
                this.setFlags(this.registers["r" + inst[1]])
                if(this.registers.flags.C===true) {
                    this.registers["r" + inst[1]]=(this.registers["r" + inst[1]]-65536)
                }
                break
            }
            case 43: { //SUBI
                let output = (this.registers["r" + inst[1]] - (functions.convert8to16(inst[2],inst[3])))
                output = functions.intToUint(output,16)
                this.registers["r" + inst[1]] = output
                this.setFlags(this.registers["r" + inst[1]])
                break
            }
            case 44: { //MULI
                let output = (this.registers["r" + inst[1]] * (functions.convert8to16(inst[2],inst[3])))
                this.setFlags(output)
                if(this.registers.flags.C===true) {
                    output=(output-65536)
                }
                this.registers["r" + inst[1]] = functions.intToUint(output)
                break
            }
            case 45: { //DIVI
                let b = functions.convert8to16(inst[2],inst[3])
                let output = 0
                if ( b===0) {
                    output = 0
                } else {
                    output = (this.registers["r" + inst[1]] / (b))
                }
                this.registers["r" + inst[1]] = output
                this.registers["r" + inst[1]] = (this.registers["r" + inst[1]] % (b)) //remainder
                this.setFlags(this.registers["r" + inst[1]])
                break
            }
            case 46: { //INT
                if ((this.registers.flags.ID===false || this.registers.flags.ID===0) && (this.registers.flags.I===false || this.registers.flags.I===0)) {
                    let pcBytes = functions.convert16to8(this.registers.pc)
                    let flags = this.registers.flags
                    let flagBytes = functions.convert8bitsto1byte([flags.N, flags.O, flags.C, flags.Z, flags.I, flags.ID, 0, 0])
                    memory.data[this.registers.sp] = pcBytes[0]
                    this.registers.sp++
                    memory.data[this.registers.sp] = pcBytes[1]
                    this.registers.sp++
                    memory.data[this.registers.sp] = flagBytes
                    this.registers.sp++
                    cpu.checkStack()
                    this.registers.pc = this.registers["ip" + inst[1]]
                    this.registers.flags.I=true
                }
                break
            }
            case 47: { //RFI
                let flags = functions.convert1byteto8bits(memory.data[this.registers.sp-1])
                this.registers.flags = {N:flags[0],O:flags[1],Z:flags[2],C:flags[3],I:flags[4],ID:flags[5]}
                this.registers.sp-=1
                this.registers.pc = functions.convert8to16(memory.data[this.registers.sp-2],memory.data[this.registers.sp-1])
                this.registers.sp-=2
                cpu.checkStack()
                this.registers.flags.I=false
                break
            }
            case 48: { //LDX
                let memoryAddress = functions.convert8to24(inst[2], inst[3], inst[4])
                let byte1 = memory.data[memoryAddress]
                let byte2 = memory.data[memoryAddress+1]
                this.registers["r"+inst[1]] = functions.convert8to16(byte1,byte2)
                break
            }
            case 49: {//STX
                let memoryAddress = functions.convert8to24(inst[2], inst[3], inst[4])
                let bytes = functions.convert16to8(this.registers["r" + inst[1]])
                memory.data[memoryAddress] = bytes[0]
                memory.data[memoryAddress+1] = bytes[1]
                break
            }
            case 50: {//TCR
                this.registers.r13= +this.registers.flags.C
                break
            }
            case 51: {//TCR
                this.registers.flags.C = +this.registers.r13
                break
            }
            case 52: {//SEI
                this.registers.flags.ID = 0
                break
            }
            case 53: {//SDI
                this.registers.flags.ID = 1
                break
            }
            case 54: { //LD8
                let memoryAddress = functions.convert8to16(inst[2],inst[3])
                this.registers["r"+inst[1]] = +memory.data[memoryAddress]
                break
            }
            case 55: {//ST8
                let memoryAddress = functions.convert8to16(inst[2], inst[3])
                let val = +this.registers["r" + inst[1]]
                val = val & 0xff
                memory.data[memoryAddress] = val
                break
            }
            case 56: { //LDX8
                let memoryAddress = functions.convert8to24(inst[2],inst[3], inst[4])
                this.registers["r"+inst[1]] = +memory.data[memoryAddress]
                break
            }
            case 57: {//STX8
                let memoryAddress = functions.convert8to24(inst[2], inst[3], inst[4])
                let val = +this.registers["r" + inst[1]]
                val = val & 0xff
                memory.data[memoryAddress] = val
                break
            }
            case 58: {//STRX
                let memoryAddress = functions.convert16to32(this.registers["r"+inst[2]],this.registers["r"+((+inst[2])+1)])
                let bytes = functions.convert16to8(this.registers["r" + inst[1]])
                memory.data[memoryAddress] = bytes[0]
                memory.data[memoryAddress+1] = bytes[1]
                break
            }
            case 59: { //LDRX
                let memoryAddress = functions.convert16to32(this.registers["r"+inst[2]],this.registers["r"+((+inst[2])+1)])
                let byte1 = memory.data[memoryAddress]
                let byte2 = memory.data[memoryAddress+1]
                this.registers["r"+inst[1]] = functions.convert8to16(byte1,byte2)
                break
            }
            case 60: {//STRX8
                let memoryAddress = functions.convert16to32(this.registers["r"+inst[2]],this.registers["r"+((+inst[2])+1)])
                let val = +this.registers["r" + inst[1]]
                val = val & 0xff
                memory.data[memoryAddress] = val
                break
            }
            case 61: { //LDRX8
                let memoryAddress = functions.convert16to32(this.registers["r"+inst[2]],this.registers["r"+((+inst[2])+1)])
                let byte1 = memory.data[memoryAddress]
                this.registers["r"+inst[1]] = +byte1
                break
            }
            case 62: {//STAIP
                this.registers["ip"+inst[1]] = functions.convert8to16(inst[2],inst[3])
                break
            }
            case 63: {//STR8
                let memoryAddress = +this.registers["r"+inst[2]]
                let val = +this.registers["r" + inst[1]]
                val = val & 0xff
                memory.data[memoryAddress] = val
                break
            }
            case 64: { //LDR8
                let memoryAddress = convertTo16Unsigned(this.registers["r"+inst[2]])
                let byte1 = memory.data[memoryAddress]
                this.registers["r"+inst[1]] = +byte1
                break
            }
            case 65: { //JC
                if (this.registers.flags.C == true) {
                    this.registers.pc = functions.convert8to16(inst[1],inst[2])
                }
                break
            }
            case 66: { //JNC
                if (this.registers.flags.C == false) {
                    this.registers.pc = functions.convert8to16(inst[1],inst[2])
                }
                break
            }
            case 67: { //LDI8
                this.registers["r"+inst[1]] = +inst[2]
                break
            }

            case 68: { //CBT8
                let array = functions.convert1byteto8bits(this.registers["r"+inst[1]])
                this.registers["r"+((+inst[1]))] = array[0]
                this.registers["r"+((+inst[1])+1)] = array[1]
                this.registers["r"+((+inst[1])+2)] = array[2]
                this.registers["r"+((+inst[1])+3)] = array[3]
                this.registers["r"+((+inst[1])+4)] = array[4]
                this.registers["r"+((+inst[1])+5)] = array[5]
                this.registers["r"+((+inst[1])+6)] = array[6]
                this.registers["r"+((+inst[1])+7)] = array[7]
                break
            }
            case 69: { //C8TB
                let array = [0,0,0,0,0,0,0,0]
                array[0] = this.registers["r"+((+inst[1]))]
                array[1] = this.registers["r"+((+inst[1])+1)]
                array[2] = this.registers["r"+((+inst[1])+2)]
                array[3] = this.registers["r"+((+inst[1])+3)]
                array[4] = this.registers["r"+((+inst[1])+4)]
                array[5] = this.registers["r"+((+inst[1])+5)]
                array[6] = this.registers["r"+((+inst[1])+6)]
                array[7] = this.registers["r"+((+inst[1])+7)]
                this.registers["r"+((+inst[1]))] =  functions.convert8bitsto1byte(array)
                break
            }
            case 70: { //DIVR
                let output = 0
                if ( this.registers["r" + inst[2]]===0) {
                    output = 0
                } else {
                    output = (this.registers["r" + inst[1]] % this.registers["r" + inst[2]]) //remainder
                }
                output = Math.floor(output)
                this.registers["r" + inst[3]] = output
                this.setFlags(this.registers["r" + inst[3]])
                break
            }



        }
        //reset cpu phase after execute
        cpu.cpuData.phase=0
    },
    setFlags: function(input) {
        this.registers.flags.Z = (input===0)
        this.registers.flags.N = (input<0)
        this.registers.flags.C = (input>65535)
        this.registers.flags.O = (input>131071)
    },
    createRegisters: function() {
        this.registers = {r0:0,r1:0, r2:0, r3:0, r4:0, r5:0, r6:0, r7:0, r8:0, r9:0 ,r10:0, r11:0, r12:0, r13:0, r14:0, r15:0, sp:0, pc:stackSize+1,
            flags:{N:false,O:false,Z:false,C:false,I:false,ID:false},ip0:0,ip1:0,ip2:0,ip3:0,ip4:0,ip5:0,ip6:0,ip7:0,ip8:0,ip9:0,ip10:0,ip11:0,ip12:0,ip13:0,ip14:0,ip15:0,}
    },
    sendDataToMainThread: function() {
        cpu.ping = 1 - cpu.ping
        let postMsgData = {data:"data", registers:this.registers, timeA:this.timeA, timeB:this.timeB, timeC:this.timeC, timeD:this.timeD, cpuData:this.cpuData, clockReal:cpu.clockReal}
        postMsgData = JSON.parse(JSON.stringify(postMsgData))
        postMessage(postMsgData)
    },
    sendMemoryToMainThread: function() {
        let postMsgData = {data:"memory", memory: memory.data}
        postMessage(postMsgData)
    },
    checkStack: function() {
       if(cpu.registers.sp>stackSize) {
           cpu.registers.sp=0
       }
        if(cpu.registers.sp<0) {
            cpu.registers.sp=stackSize
        }
    }
}

/*----------MEMORY-------------*/
let memory = {
    data: [],
    init: function() {
        this.data = genMemory()
    }
}

//?????????????????????????????????help
let setInterval2 = function (time) {
    let timeA = 0
    let timeB = 0
    let timeC = 0
    let timeDelta = 0
    let loop=0
    if (clockType===1) {
        while (0 === stop) {
            timeA = 0
            timeB = performance.now()
            timeDelta = 0
            cpu.compute()

            while (timeDelta < time) {
                timeA = performance.now()
                timeDelta = timeA - timeB
            }
        }
    } else if (clockType===2){
        while(0===stop) {
            cpu.compute()
        }
    }
}



self.addEventListener('message', function(e) {
    switch(e.data.data) {
        case "start": {
            memory.data = e.data.memory
            clock = e.data.clock
            if (clock>5) { //200hz
                clockType=0
                console.log("low clock")
                run = setInterval(cpu.compute,clock)
            } else if (clock<0.0005){
                clockType=2
                console.log("max clock")
                setInterval2(clock)
            } else {
                clockType=1
                console.log("high clock")
                setInterval2(clock)
            }

            break
        }
        case "reset": {
            cpu.init()
            memory.init()
            break
        }
        case "input": {
            memory.data[e.data.address] = e.data.val
            break
        }
        case "interrupt": {
            interruptHw = 1
            interruptType = e.data.ip
            break
        }
    }
}, false)






cpu.init()
memory.init()
//run = setInterval(cpu.compute,clock)


