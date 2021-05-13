importScripts('opcodes.js')
importScripts('functions.js')
importScripts('config.js')
let run
let clock = 25
let stop = 0

let cpu = {
    timeA: 0,
    timeB: 0,
    timeC: 0,
    timeD: 0,
    timeE: 0,
    timeF: 0,
    cyclesPerSec: 0,
    clockReal: 0,
    bit: 16,
    maxPc:  Math.pow(2, 16),
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


        if (cpu.registers.pc>cpu.maxPc) {
            cpu.registers.pc = 256
        }
        //console.log("OP: "+cpu.cpuData.op+"  PC:"+cpu.registers.pc+" SP:"+cpu.registers.sp+" | | | "+cpu.cpuData.instructionCache[1]+" | "+cpu.cpuData.instructionCache[2]+" | "+cpu.cpuData.instructionCache[3]) //test
        cpu.cyclesPerSec++
        if (((cpu.timeA-cpu.timeE)>16)) {
            if (((cpu.timeA-cpu.timeF)>1000)) {
                cpu.clockReal = cpu.cyclesPerSec
                cpu.cyclesPerSec=0
                cpu.timeF=performance.now()
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
        cpu.cpuData.cyclesI = cpu.cpuData.cycles-cpu.cpuData.bytes

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
                postMessage("stop")
                stop = 1
                cpu.timeC=cpu.timeA
                cpu.sendDataToMainThread()
                close()
                break
            }
            case 1: { //ADD
                let output = (this.registers["r" + inst[1]] + this.registers["r" + inst[2]])
                output = convertTo16Signed(output)
                this.registers["r" + inst[3]] = output
                this.setFlags(this.registers["r" + inst[3]])
                if(this.registers.flags.C===true) {
                    this.registers["r" + inst[3]]=(this.registers["r" + inst[3]]-32768)
                }
                break
            }
            case 2: { //SUB
                let output = (this.registers["r" + inst[1]] - this.registers["r" + inst[2]])
                output = convertTo16Signed(output)
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
                output = convertTo16Signed(output)
                this.registers["r" + inst[1]] = output
                this.setFlags(this.registers["r" + inst[1]])
                break
            }
            case 10: { //DEC
                let output = (this.registers["r" + inst[1]] - 1)
                output = convertTo16Signed(output)
                this.registers["r" + inst[1]] = output
                this.setFlags(this.registers["r" + inst[1]])
                break
            }
            case 11: { //ADC
                let output = 0
                if (this.registers.flags.C) {
                    output =  (this.registers["r" + inst[1]] + this.registers["r" + inst[2]])+1
                } else {
                    output =  (this.registers["r" + inst[1]] + this.registers["r" + inst[2]])
                }
                //output = convertTo16Signed(output)
                this.registers["r" + inst[3]] = output
                cpu.setFlags(this.registers["r" + inst[3]])
                if(this.registers.flags.C===true) {
                    this.registers["r" + inst[3]]=(this.registers["r" + inst[3]]-32768)
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
                output = convertTo16Signed(output)
                this.registers["r" + inst[3]] = output
                this.setFlags(this.registers["r" + inst[3]])
                break
            }
            case 23: { //OR
                let output = (this.registers["r" + inst[1]] | this.registers["r" + inst[2]])
                output = convertTo16Signed(output)
                this.registers["r" + inst[3]] = output
                this.setFlags(this.registers["r" + inst[3]])
                break
            }
            case 24: { //XOR
                let output = (this.registers["r" + inst[1]] ^ this.registers["r" + inst[2]])
                output = convertTo16Signed(output)
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
                if (this.registers["r" + inst[1]] >! this.registers["r" + inst[2]]) {
                    this.registers.pc = functions.convert8to16(inst[3],inst[4])
                }
                break
            }
            case 28: { //JNL
                if (this.registers["r" + inst[1]] <! this.registers["r" + inst[2]]) {
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
                output = convertTo16Signed(output)
                this.registers["r" + inst[3]] = output
                this.setFlags(this.registers["r" + inst[3]])
                if(this.registers.flags.C===true) {
                    this.registers["r" + inst[3]]=(this.registers["r" + inst[3]]-32768)
                }
                break
            }
            case 32: { //DIV
                let output = (this.registers["r" + inst[1]] / this.registers["r" + inst[2]])
                output = convertTo16Signed(output)
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
                output = convertTo16Signed(output)
                this.registers["r" + inst[1]] = output
                this.setFlags(this.registers["r" + inst[1]])
                if(this.registers.flags.C===true) {
                    this.registers["r" + inst[1]]=(this.registers["r" + inst[1]]-32768)
                }
                break
            }
            case 36: { //SU2
                let output = (this.registers["r" + inst[1]] - this.registers["r" + inst[2]])
                output = convertTo16Signed(output)
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
                output = convertTo16Signed(output)
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
                output = convertTo16Signed(output)
                this.registers["r" + inst[1]] = output
                this.setFlags(this.registers["r" + inst[1]])
                if(this.registers.flags.C===true) {
                    this.registers["r" + inst[1]]=(this.registers["r" + inst[1]]-32768)
                }
                break
            }
            case 43: { //SUBI
                let output = (this.registers["r" + inst[1]] - (functions.convert8to16(inst[2],inst[3])))
                output = convertTo16Signed(output)
                this.registers["r" + inst[1]] = output
                this.setFlags(this.registers["r" + inst[1]])
                break
            }
            case 44: { //MULI
                let output = (this.registers["r" + inst[1]] * (functions.convert8to16(inst[2],inst[3])))
                output = convertTo16Signed(output)
                this.registers["r" + inst[1]] = output
                this.setFlags(this.registers["r" + inst[1]])
                if(this.registers.flags.C===true) {
                    this.registers["r" + inst[1]]=(this.registers["r" + inst[1]]-32768)
                }
                break
            }
            case 45: { //DIVI
                let output = (this.registers["r" + inst[1]] / (functions.convert8to16(inst[2],inst[3])))
                output = convertTo16Signed(output)
                output = Math.floor(output)
                this.registers["r" + inst[1]] = output
                this.setFlags(this.registers["r" + inst[1]])
                break
            }
            case 46: { //INT
                if (this.registers.flags.ID===0 && this.registers.flags.I===0) {
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
            case 48: { //LDS
                let memoryAddress = functions.convert8to24(inst[2], inst[3], inst[4])
                let byte1 = memory.data[memoryAddress]
                let byte2 = memory.data[memoryAddress+1]
                this.registers["r"+inst[1]] = functions.convert8to16(byte1,byte2)
                break
            }
            case 49: {//STS
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
                if (val>127) { val=127 } //TODO:??
                if (val<-128) { val=-128 }
                memory.data[memoryAddress] = val
                break
            }
            case 56: { //LDS8
                let memoryAddress = functions.convert8to24(inst[2],inst[3], inst[4])
                this.registers["r"+inst[1]] = +memory.data[memoryAddress]
                break
            }
            case 57: {//STS8
                let memoryAddress = functions.convert8to24(inst[2], inst[3], inst[4])
                let val = +this.registers["r" + inst[1]]
                if (val>127) { val=127 } //TODO:??
                if (val<-128) { val=-128 }
                memory.data[memoryAddress] = val
                break
            }
            case 58: {//STRS
                let memoryAddress = functions.convert16to32Signed(this.registers["r"+inst[2]],this.registers["r"+inst[3]])
                let bytes = functions.convert16to8(this.registers["r" + inst[1]])
                memory.data[memoryAddress] = bytes[0]
                memory.data[memoryAddress+1] = bytes[1]
                break
            }
            case 59: { //LDRS
                let memoryAddress = functions.convert16to32Signed(this.registers["r"+inst[2]],this.registers["r"+inst[3]])
                let byte1 = memory.data[memoryAddress]
                let byte2 = memory.data[memoryAddress+1]
                this.registers["r"+inst[1]] = functions.convert8to16(byte1,byte2)
                break
            }
            case 60: {//STRS8
                let memoryAddress = functions.convert16to32Signed(this.registers["r"+inst[2]],this.registers["r"+inst[3]])
                let val = +this.registers["r" + inst[1]]
                if (val>127) { val=127 } //TODO:??
                if (val<-128) { val=-128 }
                memory.data[memoryAddress] = val
                break
            }
            case 61: { //LDRS8
                let memoryAddress = functions.convert16to32Signed(this.registers["r"+inst[2]],this.registers["r"+inst[3]])
                let byte1 = memory.data[memoryAddress]
                this.registers["r"+inst[1]] = +byte1
                break
            }
            case 62: {//STAIP
                let memoryAddress = functions.convert8to16(inst[2],inst[3])
                let byte1 = memory.data[memoryAddress]
                let byte2 = memory.data[memoryAddress+1]
                this.registers["ip"+inst[1]] = functions.convert8to16(byte1,byte2)
                break
            }
            case 63: {//STR8
                let memoryAddress = convertTo16Unsigned(this.registers["r"+inst[2]])
                let val = +this.registers["r" + inst[1]]
                if (val>127) { val=127 } //TODO:??
                if (val<-128) { val=-128 }
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
        }
        //reset cpu phase after execute
        cpu.cpuData.phase=0
    },
    setFlags: function(input) {
        this.registers.flags.Z = (input===0)
        this.registers.flags.N = (input<0)
        this.registers.flags.C = (input>32767)
        this.registers.flags.O = (input>65535)
    },
    createRegisters: function() {
        this.registers = {r0:0,r1:0, r2:0, r3:0, r4:0, r5:0, r6:0, r7:0, r8:0, r9:0 ,r10:0, r11:0, r12:0, r13:0, r14:0, r15:0, sp:0, pc:stackSize+1,
            flags:{N:false,O:false,Z:false,C:false,I:false,ID:false},ip0:0,ip1:0,ip2:0,ip3:0,ip4:0,ip5:0,ip6:0,ip7:0,ip8:0,ip9:0,ip10:0,ip11:0,ip12:0,ip13:0,ip14:0,ip15:0,}
    },
    sendDataToMainThread: function() {
        let postMsgData = {data:"data", registers:this.registers, memory: memory.data, timeA:this.timeA, timeB:this.timeB, timeC:this.timeC, timeD:this.timeD, cpuData:this.cpuData, clockReal:cpu.clockReal}
        postMsgData = JSON.parse(JSON.stringify(postMsgData))
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
        this.data = new Array(memorySize).fill(0)
    }
}

//?????????????????????????????????help
let setInterval2 = function (time) {
    let timeA = 0
    let timeB = 0
    let timeDelta = 0

    while(0===stop) {
        timeA = 0
        timeB = performance.now()
        timeDelta = 0
        cpu.compute()

        while (timeDelta < time) {
            timeA = performance.now()
            timeDelta = timeA - timeB

        }
    }
}

self.addEventListener('message', function(e) {
    switch(e.data.data) {
        case "start": {
            memory.data = e.data.memory
            clock = e.data.clock
            if (clock>5) { //200hz
                console.log("low clock")
                run = setInterval(cpu.compute,clock)
            } else if (clock<0.0005){
                console.log("max clock")
                while(0===stop) {
                    cpu.compute()
                }
            } else {
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
    }
}, false);


cpu.init()
memory.init()
//run = setInterval(cpu.compute,clock)

