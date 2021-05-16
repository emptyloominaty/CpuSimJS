//config
const HTMLRefreshRate = 16 //ms
let clockHz = 25 //hz
const memorySize = 65536 //bytes   (Cpu Ram)
const stackSize = 255 //(255=256) //dont change
let cpuFirstInfo = "EMP 1 16bit CPU"
let cpuSecondInfo = "Clock:"+clockHz+"hz Ram:"+(memorySize/1024)+"kB"

//input
const keyboardInput =       0x0A0000 //1byte

//gpu
const vramSize = 65536
const vramStart =           0x010000
const vramEnd =             0x01FFFF
const gpuDisplayMode =      0x010000 //1byte
const gpuStartFrameBuffer = 0x010001 //address stored in mem (2bytes)
const gpuEndtFrameBuffer =  0x010003 //address stored in mem (2bytes)
const gpuStartColorCache =  0x010005 //address stored in mem (2bytes)
const gpuEndColorCache =    0x010007 //address stored in mem (2bytes)

//character ROM
const charRomSize = 4096 //102 characters (5x8)
const charRomStart =        0x020000
const charRomEnd =          0x021000

//TODO
const bit = 16
const maxVal = (Math.pow(2, 16))
const maxVal2 = (Math.pow(2, 16)-1)

//generater memory
let genMemory = function() {
    let data = []
    //RAM
    data = new Array(memorySize).fill(0)
    //KEYBOARD
    data[keyboardInput] = 0
    //VRAM
    for (let i = 0; i<vramSize; i++) {
        data[vramStart+i] = 0
    }
    //FRAME BUFFER
    data[gpuStartFrameBuffer] = 0x010009
    data[gpuEndtFrameBuffer] = 0x014E29
    //TODO:character ROM

    return data
}



let genCharacters = function() {



}