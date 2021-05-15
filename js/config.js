//config
const HTMLRefreshRate = 16 //ms
let clockHz = 25 //hz
const memorySize = 65536 //bytes   (Cpu Ram)
const stackSize = 255 //(255=256) //dont change
let cpuFirstInfo = "EMP 1 16bit CPU"
let cpuSecondInfo = "Clock:"+clockHz+"hz Ram:"+(memorySize/1024)+"kB"


const keyboardInput = 0x0A0000
const FrameBufferStart = 0x010000
const FrameBufferEnd = 0x01FFFF


//TODO
const bit = 16
const maxVal = (Math.pow(2, 16))
const maxVal2 = (Math.pow(2, 16)-1)
