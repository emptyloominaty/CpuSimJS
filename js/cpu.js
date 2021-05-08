importScripts('opcodes.js');
importScripts('functions.js');

let run
let memorySize = 65536 //bytes
let clock = 200

let cpu = {
    timeA: 0,
    timeB: 0,
    timeC: 0,
    timeD: 0,

    bit: 16,
    maxPc:  Math.pow(2, this.bit),
    cpuData: {op:0,decoded:0,bytes:0,cycles:0,instructionCache:0,inst:0,phase:0,bytesLeft:0,fetchI:1,cyclesI:0},
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
        //console.log("OP: "+cpu.cpuData.op+"  PC:"+cpu.registers.pc+" SP:"+cpu.registers.sp+" | | | "+cpu.cpuData.instructionCache[1]+" | "+cpu.cpuData.instructionCache[2]+" | "+cpu.cpuData.instructionCache[3]) //test

        cpu.sendDataToMainThread()
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
                memory.data[this.registers.sp] = pcBytes[0]
                this.registers.sp++
                memory.data[this.registers.sp] = pcBytes[1]
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
                output = convertTo16Signed(output)
                this.registers["r" + inst[3]] = output
                cpu.setFlags(this.registers["r" + inst[3]])
                if(this.registers.flags.C===true) {
                    this.registers["r" + inst[3]]=(this.registers["r" + inst[3]]-32768)
                }
                break
            }
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
                this.registers["r" + inst[2]] = this.registers["r" + inst[1]]
                    this.setFlags(this.registers["r" + inst[1]])
                break
            }
            case 18: { //TRS
                this.registers["sp"] = this.registers["r15"]
                break
            }
            case 19: { //TSR
                this.registers["r15"] = this.registers["sp"]
                break
            }
            case 20: { //PSH
                let stackBytes = functions.convert16to8(this.registers["r" + inst[1]])
                memory.data[this.registers.sp] = stackBytes[0]
                this.registers.sp++
                memory.data[this.registers.sp] = stackBytes[1]
                this.registers.sp++
                break
            }
            case 21: { //POP
                this.registers["r" + inst[1]] = functions.convert8to16(memory.data[this.registers.sp-2],memory.data[this.registers.sp-1])
                this.registers.sp-=2
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





            case 33: { //TRP
                this.registers["pc"] = this.registers["r14"]
                break
            }
            case 34: { //TPR
                this.registers["r14"] = this.registers["pc"]
                break
            }


            case 37: { //STOP
                postMessage("stop")
                cpu.timeC=cpu.timeA
                cpu.sendDataToMainThread()
                close()
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
    sendDataToMainThread: function() {
        let postMsgData = {data:"data", registers:this.registers, memory: memory.data, timeA:this.timeA, timeB:this.timeB, timeC:this.timeC, timeD:this.timeD, cpuData:this.cpuData}
        postMsgData = JSON.parse(JSON.stringify(postMsgData))
        postMessage(postMsgData)
    }
}

/*----------MEMORY-------------*/
let memory = {
    data: [],
    init: function() {
        this.data = new Array(memorySize).fill(0)
    }
}


self.addEventListener('message', function(e) {
    switch(e.data.data) {
        case "start": {
            memory.data = e.data.memory
            clock = e.data.clock
            run = setInterval(cpu.compute,clock)
            break
        }
        case "reset": {
            cpu.init()
            memory.init()
            break
        }
    }

    self.postMessage(e.data);
}, false);


cpu.init()
memory.init()
//run = setInterval(cpu.compute,clock)