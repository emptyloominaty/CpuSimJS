//config
const HTMLRefreshRate = 16 //ms
let clockHz = 25 //hz
const stackSize = 255 //(255=256) //dont change

//TODO
const bit = 16
const maxVal = (Math.pow(2, 16))
const maxVal2 = (Math.pow(2, 16)-1)

//--------------------------------------------------MEMORY--------------------------------------------------------------
//----------CPU RAM (00)
let memorySize = 65536 //bytes   (Cpu Ram)

//----------GPU RAM (01)
let vramSize = 65536
const vramStart =           0x010000
let gpuDisplayMode =      0x010000 //1byte
let gpuStartFrameBuffer = 0x010001 //address stored in mem (2bytes)
let gpuEndtFrameBuffer =  0x010003 //address stored in mem (2bytes)
let gpuStartColorCache =  0x010005 //address stored in mem (2bytes)
let gpuEndColorCache =    0x010007 //address stored in mem (2bytes)

//----------Character ROM (02)
let charRomSize = 4096 //512 characters (5x8)
const charRomStart =        0x020000  
const charRomEnd =          0x021000

//----------I/O Ports  (0A)
const keyboardInput =       0x0A0000 //1byte

//----------Game/App Drive  (03)
const gameAppDriveSize = 32768
const gameAppDriveStart =   0x0B8000

//----------User Storage (04)
let userStorageSize = 65536
const userStorageStart =    0x0C0000




//--------------------------------------------------MEMORY--------------------------------------------------------------

//generater memory
let genMemory = function() {
    let data = []
    //RAM
    data = new Uint8Array(memorySize).fill(0)
    //KEYBOARD
    data[keyboardInput] = 0
    //VRAM
    for (let i = 0; i<vramSize; i++) {
        data[vramStart+i] = 0
    }
    //FRAME BUFFER ????????
    data[gpuStartFrameBuffer] = 0x00
    data[gpuStartFrameBuffer+1] = 0x09
    data[gpuEndtFrameBuffer] = 0x4E
    data[gpuEndtFrameBuffer+1] = 0x29
    //CHARACTER ROM
    let charSize = 8
    let charCount = charRomSize/charSize
    let charGeneratedData = genCharacters(charCount)

    for (let i = 0; i<charCount; i++) {
        for (let a = 0; a<charSize; a++) {
            let b = (i*8)+a
            data[charRomStart + b] = charGeneratedData[i][a]
        }
    }
    return data
}


let cpuFirstInfo = "EMP 1 16bit CPU"
let cpuSecondInfo = "Clock:"+clockHz+"hz Ram:"+(memorySize/1024)+"kB"
