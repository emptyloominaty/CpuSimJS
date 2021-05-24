//config
const HTMLRefreshRate = 16 //ms
let clockHz = 25 //hz
const stackSize = 255 //(255=256) //dont change
let cpuFirstInfo = "EMP 1 16bit CPU"
let colorMode = 1

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
let gpuColorMode =          0x010000 //1byte     0=2colors  1=256colors
let gpuStartFrameBuffer =   0x010001 //address stored in mem (2bytes)
let gpuEndtFrameBuffer =    0x010003 //NO WHY?
let gpuScreenWidth =        0x010005 //2bytes
let gpuScreenHeight =       0x010007 //2bytes

//----------Character ROM (02)
let charRomSize = 2048 //256 characters (5x8)
const charRomStart =        0x020000

//----------User Storage (03)
let userStorageSize = 64
const userStorageStart =    0x0C0000

//----------Extended memory(04-09)
let extMemorySize = 0
const extMemoryStart =    0x0D0000

//----------I/O Ports  (0A)
const keyboardInput =       0x0A0000 //1byte
//--------------------------------------------------MEMORY--------------------------------------------------------------

//generater memory
let genMemory = function() {
    let data = new Uint8Array(16711680)
    //RAM
    for (let i = 0; i<memorySize; i++) {
        data[i] = 0
    }
    //KEYBOARD
    data[keyboardInput] = 0
    //VRAM
    for (let i = 0; i<vramSize; i++) {
        data[vramStart+i] = 0
    }
    //FRAME BUFFER
    data[gpuColorMode] = colorMode
    data[gpuStartFrameBuffer] = 0x00
    data[gpuStartFrameBuffer+1] = 0x09
    data[gpuEndtFrameBuffer] = 0x4E //NO WHY?
    data[gpuEndtFrameBuffer+1] = 0x29  //NO WHY?
    data[gpuScreenWidth]= 1  //320
    data[gpuScreenWidth+1]= 64
    data[gpuScreenHeight]= 0 //20
    data[gpuScreenHeight+1]= 200
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
    //USER STORAGE
    for (let i = 0; i<userStorageSize; i++) {
        data[userStorageStart+i] = 0
    }
    //EXT RAM (DATA)
    for (let i = 0; i<extMemorySize; i++) {
        data[extMemoryStart+i] = 0
    }


    return data
}

