let canvas = document.getElementById("screen")
let cvs = canvas.getContext("2d")
let pixelSize = 4
let screenW = 200
let screenH = 100
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


setInterval(drawScreen,100)