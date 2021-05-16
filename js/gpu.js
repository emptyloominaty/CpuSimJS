let canvas = document.getElementById("screen")
let pixelSize = 4
let screenW = 200
let screenH = 100
let color = "#000000"

let drawPixel = function(x,y,color) {
    let x1 = x*pixelSize
    let y1 = y*pixelSize
    let pxl = canvas.getContext("2d")
    pxl.fillStyle = color
    pxl.fillRect(x1, y1, pixelSize, pixelSize)
}

let drawScreen = function() {
    let pxCount = 0
    for (let y = 0; y<screenH; y++) {
        for (let x = 0; x<screenW; x++) {
            if (control.memory[(control.memory[gpuStartFrameBuffer]+pxCount)]===0 || control.memory[(control.memory[gpuStartFrameBuffer]+pxCount)]===undefined) {
                color = "#000000"
            } else {
                color = "#FFFFFF"
            }
            drawPixel(x,y,color)
            pxCount++
        }
    }
}




