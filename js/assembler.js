let assembler = {
    functions: functions,
    assembly: function() {
        control.reset() //remove all memory data + cpu reset
        let code = document.getElementById("codeEditor").value
        code = code.replace(/;.*?;/g, ""); //comments
        code = code.split("\n")
        code = code.filter(function(e){return e});

        let vars = {} //16-bit variables
        let functions = {}
        let instructions = []

        //very smart
        let opListAssembler = {}
        for (let i = 0; i<Object.keys(opCodeList).length; i++) {
            opListAssembler[opCodeList[i].name]={bytes:opCodeList[i].bytes, cycles:opCodeList[i].cycles, code:i}
        }

        let org = false
        let orgAddress = 0
        let orgBytes = 0
        let inOrg = 0

        let bytes = 0
        let inst = 0
        for(let i = 0; i<code.length; i++) {
            let line = code[i].split(" ")
            line  = line.filter(function(e){return e})
            const regex = /<.*?>/g // <Function>
            let found = line[0].match(regex) || false

            org = (line[0]===".ORG") || (line[0]===".org") || false
            if (org===true) {
                orgBytes = 0
                inOrg = 1
                orgAddress = Number(line[1].replace(/\$/g, '0x'))
                continue
            }

            /*-------------------Variables---------------------------- */
            if (line[0]==="var" || line[0]==="VAR") {
                line[2] = line[2].replace(/\$/g, '0x')
                vars[line[1]] = {name:line[1], value: this.functions.intToUint(Number(line[2]),16), bytes:2, memAddress:0}
            } else if (line[0]==="avar" || line[0]==="AVAR") {
                line[3] = line[3].replace(/\$/g, '0x')
                line[2] = line[2].replace(/\$/g, '0x')
                vars[line[1]] = {name:line[1], value: this.functions.intToUint(Number(line[2]),16), bytes:2, memAddress:Number(line[3])}
            } else if (line[0]==="var8" || line[0]==="VAR8") {
                line[2] = line[2].replace(/\$/g, '0x')
                vars[line[1]] = {name:line[1], value: this.functions.intToUint(Number(line[2]),8), bytes:1, memAddress:0}
            } else if (line[0]==="avar8" || line[0]==="AVAR8") {
                line[3] = line[3].replace(/\$/g, '0x')
                line[2] = line[2].replace(/\$/g, '0x')
                vars[line[1]] = {name:line[1], value: this.functions.intToUint(Number(line[2]),8), bytes:1, memAddress:Number(line[3])}
            } else if (line[0]==="var32" || line[0]==="VAR32") {
                line[2] = line[2].replace(/\$/g, '0x')
                vars[line[1]] = {name:line[1], value: this.functions.intToUint(Number(line[2]),32), bytes:4, memAddress:0}
            } else if (line[0]==="avar32" || line[0]==="AVAR32") {
                line[3] = line[3].replace(/\$/g, '0x')
                line[2] = line[2].replace(/\$/g, '0x')
                vars[line[1]] = {name:line[1], value: this.functions.intToUint(Number(line[2]),32), bytes:4, memAddress:Number(line[3])}
            }
            /*-------------------Functions---------------------------- */
            else if (found[0]) {
                let fnc = line[0].replace('<','')
                fnc = fnc.replace('>','')
                if (inOrg===0) {
                    functions[fnc] = {name:fnc,line:i, memAddress:(stackSize+1)+bytes}
                } else {
                    functions[fnc] = {name:fnc,line:i, memAddress:(+orgAddress+ +orgBytes)}
                }
            }
            /*-------------------Instructions---------------------------- */
            else if (line[0]!=="" || line[0]!==" ") {
                if (line[2]!==undefined) {
                    line[2] = line[2].replace(/\$/g, '0x')
                }
                if (line[3]!==undefined) {
                    line[3] = line[3].replace(/\$/g, '0x')
                }
                if (inOrg===0) {
                    instructions[inst] = {name:line[0],bytes:opListAssembler[line[0]].bytes, line:i, memAddress:(stackSize+1)+bytes, val1:line[1]||0, val2:line[2]||0, val3:line[3]||0, val4:line[4]||0, val5:line[5]||0}
                    bytes+=opListAssembler[line[0]].bytes
                } else {
                    instructions[inst] = {name:line[0],bytes:opListAssembler[line[0]].bytes, line:i, memAddress:(+orgAddress+ +orgBytes), val1:line[1]||0, val2:line[2]||0, val3:line[3]||0, val4:line[4]||0, val5:line[5]||0}
                    orgBytes+=opListAssembler[line[0]].bytes
                }
                inst++
            }
        } //loop end

        //calc vars addresses
        let varsByte = 0
        let varsAddress = (stackSize+1)+bytes
        for (const key of Object.keys(vars)) {
            if (vars[key].memAddress===0) {
                vars[key].memAddress = (varsAddress + varsByte)
                varsByte+= vars[key].bytes
            }
            //write var to memory
            if (vars[key].bytes===2) {
                let varbytes = this.functions.convert16to8(vars[key].value)
                memRom.data[vars[key].memAddress] = varbytes[0]
                memRom.data[vars[key].memAddress + 1] = varbytes[1]
            } else if (vars[key].bytes===1) {
                memRom.data[vars[key].memAddress] = vars[key].value
            } else if (vars[key].bytes===4) {
                let varwords =  this.functions.convert32to16(vars[key].value)
                let varbytes1 = this.functions.convert16to8(varwords[0])
                let varbytes2 = this.functions.convert16to8(varwords[1])
                memRom.data[vars[key].memAddress] = varbytes1[0]
                memRom.data[vars[key].memAddress + 1] = varbytes1[1]
                memRom.data[vars[key].memAddress + 2] = varbytes2[0]
                memRom.data[vars[key].memAddress + 3] = varbytes2[1]
            }
        }

        let removeRfromCode = function(value) { //registers r1 => 1
            const regex2 = /\b([R-R-r-r]{1}[0-9]{1,2})/gm
            let found = value.match(regex2) || false
            if (found) {
                found = found[0].replace(/r.*?/g, "")
            }
            return found
        }
        let findRinCode = function(value) {
            const regex2 = /\b([R-R-r-r]{1}[0-9]{1,2})/gm
            let found = value.match(regex2) || false

            if (found!==false) { found=true}
            return found
        }

        //write instructions to memory
        for (let i = 0; i<instructions.length; i++) {
            let memAddress = instructions[i].memAddress
            let instBytes = instructions[i].bytes
            let opC = instructions[i].name.toLowerCase()
            let name = instructions[i].name.toUpperCase()
            let opCode = opListAssembler[name].code
            if (opC==="ldi" || opC==="ldi8" ||  opC==="addi" || opC==="subi" || opC==="muli" || opC==="divi" ) {
                memRom.data[memAddress] = opCode
                memRom.data[memAddress + 1] = removeRfromCode(instructions[i].val1)
                if (opC==="ldi8") {
                    memRom.data[memAddress + 2] = instructions[i].val2
                } else {
                    let valueI = this.functions.convert16to8(instructions[i].val2)
                    memRom.data[memAddress + 2] = valueI[0]
                    memRom.data[memAddress + 3] = valueI[1]
                }
            } else if (opC==="ldx" || opC==="stx"|| opC==="ldx8" || opC==="stx8" ) {
                memRom.data[memAddress] = opCode
                memRom.data[memAddress + 1] = removeRfromCode(instructions[i].val1)
                let valueI = 0
                if (typeof instructions[i].val2 === 'string' && instructions[i].val2.startsWith("0x")) {
                    valueI = this.functions.convert24to8(instructions[i].val2)
                } else {
                    valueI = vars[instructions[i].val2].memAddress
                    valueI = this.functions.convert24to8(valueI)
                }
                memRom.data[memAddress + 2] = valueI[0]
                memRom.data[memAddress + 3] = valueI[1]
                memRom.data[memAddress + 4] = valueI[2]
            } else if ( opC==="strx" || opC==="ldrx" || opC==="strx8" || opC==="ldrx8") {
                memRom.data[memAddress] = opCode
                memRom.data[memAddress + 1] = removeRfromCode(instructions[i].val1)
                memRom.data[memAddress + 2] = removeRfromCode(instructions[i].val2)
            } else {
                for(let j=0; j<instBytes; j++) {
                    //-----------------------------------------------------------------------OPCODE
                    if (j === 0) {
                        memRom.data[memAddress + j] = opCode
                        //-----------------------------------------------------------------------REG
                    } else if (findRinCode(String(instructions[i]["val" + j]))) {
                        memRom.data[memAddress + j] = removeRfromCode(instructions[i]["val" + j])
                        //-----------------------------------------------------------------------LOAD/STORE HEX
                    } else if (typeof instructions[i]["val" + j] === 'string' && instructions[i]["val" + j].startsWith("0x")) {
                        instructions[i]["val" + j] = this.functions.hexToDec(instructions[i]["val" + j])
                        let memVar = instructions[i]["val" + j]
                        memVar = this.functions.convert16to8(memVar)
                        memRom.data[memAddress + j] = memVar[0]
                        j++
                        memRom.data[memAddress + j] = memVar[1]
                        //-----------------------------------------------------------------------STAIP/INT
                    } else if (!isNaN(instructions[i]["val" + j])) {
                        memRom.data[memAddress + j] = instructions[i]["val" + j]
                        //-----------------------------------------------------------------------MEM ADDRESS
                    } else if (opC !== "jsr" && opC !== "jg" && opC !== "jng" && opC !== "jl" && opC !== "jnl" && opC !== "je" && opC !== "jne" && opC !== "jmp") {
                        let memVar = vars[instructions[i]["val" + j]].memAddress
                        memVar = this.functions.convert16to8(memVar)
                        memRom.data[memAddress + j] = memVar[0]
                        j++
                        memRom.data[memAddress + j] = memVar[1]
                        //-----------------------------------------------------------------------FUNCTIONS (JUMPS)
                    } else {
                        let jumpAddress = functions[instructions[i]["val" + j]].memAddress
                        jumpAddress = this.functions.convert16to8(jumpAddress)
                        memRom.data[(memAddress + j)] = jumpAddress[0]
                        j++
                        memRom.data[(memAddress + j)] = jumpAddress[1]
                    }
                }
            }
        }
        console.log(instructions)
        console.log(functions)
        console.log(vars)

        let textVars = ""
        //HTML
        let variablesAddresses = document.getElementById("variablesAddresses")
        for (const key of Object.keys(vars)) {
                textVars += vars[key].name +" : "+ vars[key].memAddress +" ($"+ this.functions.decimalToHex(vars[key].memAddress,4) +  ") <br>"
        }
        variablesAddresses.innerHTML = textVars

        let textFunctions = ""
        //HTML
        let functionsAddresses = document.getElementById("functionsAddresses")
        for (const key of Object.keys(functions)) {
            textFunctions += functions[key].name +" : "+ functions[key].memAddress +" ($"+ this.functions.decimalToHex(functions[key].memAddress,4) + ") <br>"
        }
        functionsAddresses.innerHTML = textFunctions

    }
}

//test code
document.getElementById("codeEditor").value =
    "var a 1\n" +
    "var b 1\n" +
    "var c 0\n" +
    "avar d 10 $0a00\n" +

    "\n" +
    "LD r0 a\n" +
    "LD r1 b\n" +
    "ADD r0 r1 r2 \n" +
    "ST r2 c\n" +
    "JSR infiniteLoopKekw\n" +
    "STOP\n" +
    "\n" +
    "<infiniteLoopKekw>\n" +
    "INC r2\n" +
    "JMP infiniteLoopKekw\n" +
    "\n" +
    "\n"



document.getElementById("cpuLoading").innerHTML = ""