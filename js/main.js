//config
let HTMLRefreshRate = 16 //ms
let clockHz = 25 //hz
let memorySize = 65536 //bytes


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
    registers: {r0:0,r1:0, r2:0, r3:0, r4:0, r5:0, r6:0, r7:0, r8:0, r9:0 ,r10:0, r11:0, r12:0, r13:0, r14:0, r15:0, sp:0, pc:256, flags:{N:false,O:false,Z:false,C:false}},
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
    el_btnToggleCpu: document.getElementById("btnToggleCpu"),
    el_setCpuClock: document.getElementById("setCpuClock"),
    startCpu: function() {
        cpuThread = new Worker('js/cpu.js')
        this.status="Executing"
        this.el_btnToggleCpu.innerText = "Stop"
        control.updateHTML() //update screen
        cpuThread.postMessage({data:"start",clock:clock, memory:memRom.data})
        cpuThread.postMessage('Hello World');

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
                    control.updateHTML() //update screen
                    break
                }
                case "stop": {
                    control.stopCpu()
                }
            }
        }, false);


    },
    stopCpu: function() {
        cpuThread.terminate()
        this.status="Stopped"
        this.el_btnToggleCpu.innerText = "Start"
        control.updateHTML() //update screen
        cpuThread="undefined"
    },
    toggleCpu: function() {
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
    updateHTML: function() {
        if ((this.timeA-this.timeD)>16) {

            this.el_cpuStatus.innerHTML = this.status
            let clock = Math.round(1 / this.timeC* 1000)
            if (clock=="Infinity") { clock=0 }
            this.el_clockSpeed.innerHTML = clock
            this.timeD = Date.now()
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
    },

}



//main
control.reset() //test
control.updateHTML() //update screen
let cpuFirstInfo = "EMP 1 16bit CPU"
let cpuSecondInfo = "Clock:"+clockHz+"hz Ram:"+(memorySize/1024)+"kB"
control.updateHTMLStart()
let clock = 1 / clockHz * 1000



