let canvas = document.getElementById("screen")
let cvs = canvas.getContext("2d")
let pixelSize = 4
let screenW = 320
let screenH = 200
let color = "#000000"

canvas.width = screenW*pixelSize
canvas.height = screenH*pixelSize

let drawPixel = function(x,y,color) {
    let x1 = x*pixelSize
    let y1 = y*pixelSize

    cvs.fillStyle = color
    cvs.fillRect(x1, y1, pixelSize, pixelSize)
}

let drawScreen = function() {
    cvs.clearRect(0, 0, canvas.width, canvas.height)
    let pxCount = 0
    let frameBufferStart = functions.convert8to16(control.memory[gpuStartFrameBuffer],control.memory[gpuStartFrameBuffer+1])
    if (frameBufferStart===undefined) { frameBufferStart=9 }
    for (let y = 0; y<screenH; y++) {
        for (let x = 0; x<screenW; x++) {
            let colorVal = control.memory[65536+(frameBufferStart+pxCount)]  //65536 = 01 + xxxx
            if (colorVal===0 || colorVal===undefined) {
                color = "#000000"
            } else {
                if (colorMode===0) {
                    color = "#FFFFFF"
                } else if (colorMode===1) {
                    let R = ((colorVal & 0xE0) >> 5)
                    let G = ((colorVal & 0x1C) >> 2)
                    let B = (colorVal & 0x03)
                    let RReal = R*36
                    let GReal = G*36
                    let BReal = B*85
                    color = "rgb("+RReal+","+GReal+","+BReal+")"
                    //let RGB = ((R << 5) | (G << 2) | B)  //RGB->8B
                }
            }
            drawPixel(x,y,color)
            pxCount++
        }
    }
}


setInterval(drawScreen,100)