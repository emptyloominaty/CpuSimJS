
document.getElementById("capacityUserStorage").innerHTML = "Capacity: "+userStorageSize/1024+"kB"

let config = {
    setCpuRam: function() {
        let value = (+document.getElementById("inputConfigCpuMemory").value)*1024
        if (value<512) {value=512}
        if (value>65536) {value=65536}
        memorySize =  value
    },
    setVideoRam: function () {
        let value = (+document.getElementById("inputConfigVideoMemory").value)*1024
        if (value<8192) {value=8192}
        if (value>65536) {value=65536}
        vramSize = value
    },
    setCharMemory: function () {
        let value = (+document.getElementById("inputConfigCharMemory").value)*1024
        if (value<1024) {value=1024}
        if (value>65536) {value=65536}
        vramSize =  value
    },
    setUserStorage: function () {
        let value = (+document.getElementById("inputConfigUserStorage").value)*1024
        if (value<0) {value=0}
        if (value>65536) {value=65536}
        userStorageSize =  value
        document.getElementById("capacityUserStorage").innerHTML = "Capacity: "+value/1024+"kB"
    },
    setExtRam: function () {
        let value = (+document.getElementById("inputConfigExtRam").value)*1024
        if (value<0) {value=0}
        if (value>327680) {value=327680}
        extMemorySize =  value
    }
}


