//worker
let cpuThread="undefined"

//rom
let memRom = {
    data: [],
    init: function() {
        this.data = new Array(memorySize).fill(0)
    }
}

let control = {
    status:"Stopped",
    timeA: 0,
    timeB: 0,
    timeC: 0,
    timeD: 0,
    clockReal: 0,
    registers: {r0:0,r1:0, r2:0, r3:0, r4:0, r5:0, r6:0, r7:0, r8:0, r9:0 ,r10:0, r11:0, r12:0, r13:0, r14:0, r15:0, sp:0, pc:256, flags:{N:false,O:false,Z:false,C:false,I:false,ID:false}},
    memory: [],
    cpuData: {op:0,decoded:0,bytes:0,cycles:0,instructionCache:[0,0,0,0,0],inst:0,phase:0,bytesLeft:0,fetchI:1,cyclesI:0},
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
    el_memVal2: document.getElementById("memVal2"),
    el_memValHex2: document.getElementById("memValHex2"),
    el_memVal4: document.getElementById("memVal4"),
    el_memValHex4: document.getElementById("memValHex4"),
    el_btnToggleCpu: document.getElementById("btnToggleCpu"),
    el_setCpuClock: document.getElementById("setCpuClock"),
    startCpu: function() {
        cpuThread = new Worker('js/cpu.js')
        this.status="Executing"
        this.el_btnToggleCpu.innerText = "Stop"
        control.updateHTML() //update screen
        cpuThread.postMessage({data:"start",clock:clock, memory:memRom.data})

        cpuThread.addEventListener('message', function(e) {
            //console.log('Worker said: ', e.data);
            switch (e.data.data) {
                case "data": {
                    control.registers = e.data.registers
                    control.timeA = e.data.timeA
                    control.timeB = e.data.timeB
                    control.timeC = e.data.timeC
                    control.timeD = e.data.timeD
                    control.cpuData = e.data.cpuData
                    control.memory = e.data.memory
                    control.clockReal = e.data.clockReal
                    control.updateHTML() //update screen
                    break
                }
                case "stop": {
                    control.status = "Stopped"
                    control.el_btnToggleCpu.innerText = "Start"
                    control.updateHTML(1) //update screen
                    control.stopCpu()
                }
            }
        }, false);


    },
    stopCpu: function() {
        cpuThread.terminate()
        control.status="Stopped"
        this.el_btnToggleCpu.innerText = "Start"
        control.updateHTML(1) //update screen
        cpuThread="undefined"
    },
    toggleCpu: function() {
        //console.log(performance.now())
        clockHz = this.el_setCpuClock.value
        clock = 1 / clockHz * 1000
        cpuSecondInfo = "Clock:"+clockHz+"hz Ram:"+(memorySize/1024)+"kB"
        control.updateHTMLStart()
        if (this.status==="Executing")  {
            this.stopCpu()
        } else {
            this.startCpu()
        }

    },
    reset: function(){
        if(cpuThread!=="undefined") {
            cpuThread.postMessage({data:"reset"})
        }
        memRom.init() //reset rom
    },
    printRegisters: function() {
        console.log(this.registers)
    },
    updateHTML: function(forced=0) {
        if (((this.timeA-this.timeD)>HTMLRefreshRate) || forced === 1) {
            this.el_cpuStatus.innerHTML = this.status
            let clock =  this.clockReal //Math.round(1 / this.timeC* 1000)
            if (clock=="Infinity") { clock=0 }
            if (clock<1000) { clock = clock+"Hz"}
            if (clock>=1000 && clock<1000000) { clock = (Math.round((clock/1000)*10)/10)+"kHz"}
            if (clock>=1000000) { clock = (Math.round((clock/1000000)*10)/10)+"MHz"}
            this.el_clockSpeed.innerHTML = clock
            this.timeD = performance.now()
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
            this.el_regs[i].innerHTML=this.registers["r"+i]
        }
        this.el_regPc.innerHTML = this.registers.pc
        this.el_regSp.innerHTML = this.registers.sp
    },
    updateHTMLAlu: function() {
        this.el_aluOpcode.innerHTML = this.cpuData.instructionCache[0]
        this.el_aluName.innerHTML = opCodeList[this.cpuData.instructionCache[0]].name
        this.el_aluReg1.innerHTML = this.cpuData.instructionCache[1]
        this.el_aluReg2.innerHTML = this.cpuData.instructionCache[2]
        this.el_aluReg3.innerHTML = this.cpuData.instructionCache[3]
    },
    getAllMemoryValues: function() {
        let text = ""
        for (let i=0; i<memorySize; i++) {
            if (control.memory[i]!==0) {
                text+="<span>"+functions.decimalToHex(control.memory[i],2)+" </span>"
            } else {
                text+="<span style='color:#ba9999'>"+functions.decimalToHex(control.memory[i],2)+" </span>"
            }
        }
        this.el_allMem.innerHTML = text
    },
    clearMemoryValuesHTML: function(){
        this.el_allMem.innerHTML = ""
    },
    getMemoryUsage: function() {
        let memoryNotFree = memorySize
        for (let i=0; i<memorySize; i++) {
            if (control.memory[i]!==0) {
                memoryNotFree--
            }
        }
        this.el_memUsage.innerHTML = (memorySize-memoryNotFree) +"/"+ memorySize
    },
    getMemoryValue: function() {
        let getValue = functions.hexToDec(document.getElementById("input_GetMemVal").value)
        document.getElementById("input_GetMemVal").value = "0x"
        this.el_memVal.innerHTML = control.memory[getValue]
        this.el_memValHex.innerHTML = "0x"+functions.decimalToHex(control.memory[getValue],2)

        let bytes2 = [control.memory[getValue],control.memory[getValue+1]]
        this.el_memValHex2.innerHTML = "0x"+convertTo16Signed(functions.decimalToHex(bytes2[0],2)+functions.decimalToHex(bytes2[1],2))
        this.el_memVal2.innerHTML = functions.convert8to16(bytes2[0],bytes2[1])

        let bytes4 = [control.memory[getValue],control.memory[getValue+1],control.memory[getValue+2],control.memory[getValue+3]]
        this.el_memValHex4.innerHTML = "0x"+functions.decimalToHex(bytes4[0],2)+functions.decimalToHex(bytes4[1],2)+functions.decimalToHex(bytes4[2],2)+functions.decimalToHex(bytes4[3],2)
        let hiByte = functions.convert8to16(bytes4[0],bytes4[1])
        let loByte = functions.convert8to16(bytes4[2],bytes4[3])
        this.el_memVal4.innerHTML = loByte+(hiByte*32768)
    },

}



//main
control.reset() //test
control.updateHTML() //update screen
control.updateHTMLStart()
let clock = 1 / clockHz * 1000



