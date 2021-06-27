
document.getElementById("capacityUserStorage").innerHTML = "Capacity: "+userStorageSize/1024+"kB"

let config = {
    setCpuRam: function() {
        let value = (+document.getElementById("inputConfigCpuMemory").value)*1024
        if (value<512) {value=512}
        if (value>65536) {value=65536}
        memorySize =  value
        document.getElementById("inputConfigCpuMemory_val").innerText = value/1024
    },
    setVideoRam: function () {
        let value = (+document.getElementById("inputConfigVideoMemory").value)*1024
        if (value<8192) {value=8192}
        if (value>65536) {value=65536}
        vramSize = value
        document.getElementById("inputConfigVideoMemory_val").innerText = value/1024
    },
    setCharMemory: function () {
        let value = (+document.getElementById("inputConfigCharMemory").value)*1024
        if (value<1024) {value=1024}
        if (value>65536) {value=65536}
        charRomSize =  value
        document.getElementById("inputConfigCharMemory_val").innerText = value/1024
    },
    setUserStorage: function () {
        let value = (+document.getElementById("inputConfigUserStorage").value)*1024
        if (value<0) {value=0}
        if (value>65536) {value=65536}
        userStorageSize =  value
        document.getElementById("capacityUserStorage").innerHTML = "Capacity: "+value/1024+"kB"
        document.getElementById("inputConfigUserMemory_val").innerText = value/1024
    },
    setExtRam: function () {
        let value = (+document.getElementById("inputConfigExtRam").value)*1024
        if (value<0) {value=0}
        if (value>327680) {value=327680}
        extMemorySize =  value
        document.getElementById("inputConfigExtMemory_val").innerText = value/1024
    }
}


