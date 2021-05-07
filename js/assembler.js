//TODO: FIX LDI

let assembler = {
    functions: functions,
    assembly: function() {
        memory.init() //remove all memory data
        let code = document.getElementById("codeEditor").value
        code = code.replace(/;.*?;/g, ""); //comments
        code = code.split("\n")
        code = code.filter(function(e){return e});

        let vars = {}
        let functions = {}
        let instructions = []

        //very smart
        let opListAssembler = {}
        for (let i = 0; i<Object.keys(opCodeList).length; i++) {
            opListAssembler[opCodeList[i].name]={bytes:opCodeList[i].bytes, cycles:opCodeList[i].cycles, code:i}
        }

        let numberOfVars = 0
        let bytes = 0

        let inst = 0
        for(let i = 0; i<code.length; i++) {
            let line = code[i].split(" ")
            line  = line.filter(function(e){return e});
            const regex = /<.*?>/g // <Function>
            let found = line[0].match(regex) || false

            /*-------------------Variables---------------------------- */
            if (line[0]==="var" || line[0]==="VAR") {
                vars[line[1]] = {name:line[1], value:line[2], address:i*2, memAddress:0}
                numberOfVars++
            }
            /*-------------------Functions---------------------------- */
            else if (found[0]) {
                let fnc = line[0].replace('<','');
                fnc = fnc.replace('>','');
                functions[fnc] = {name:fnc,line:i, memAddress:256+bytes}
            }
            /*-------------------Instructions---------------------------- */
            else if (line[0]!=="" || line[0]!==" ") {
                instructions[inst] = {name:line[0],bytes:opListAssembler[line[0]].bytes, line:i, memAddress:256+bytes, val1:line[1]||0, val2:line[2]||0, val3:line[3]||0, val4:line[4]||0}
                bytes+=opListAssembler[line[0]].bytes
                inst++
            }

        } //loop end

        //calc vars addresses
        let varsAddress = 256+bytes
        for (const key of Object.keys(vars)) {
            vars[key].memAddress = (varsAddress + vars[key].address)
            //write var to memory
            memory.data[vars[key].memAddress] = vars[key].value
        }

        //write instructions to memory
        for (let i = 0; i<instructions.length; i++) {
            let memAddress = instructions[i].memAddress
            let instBytes = instructions[i].bytes
            let opC = instructions[i].name.toLowerCase()
            let name = instructions[i].name.toUpperCase()
            let opCode = opListAssembler[name].code

            for (let j = 0; j<instBytes; j++)
                if (j===0) { //op
                    memory.data[memAddress+j] =  opCode
                    console.log(memory.data[memAddress+j])
                } else if (!isNaN(instructions[i]["val"+j])){ //reg
                    memory.data[memAddress+j] =  instructions[i]["val"+j]
                } else if (opC!=="jsr" && opC!=="jg" && opC!=="jng" && opC!=="jl" && opC!=="jnl" && opC!=="je" && opC!=="jne" && opC!=="jmp") { //mem
                    let memVar = vars[instructions[i]["val"+j]].memAddress
                    memVar = this.functions.convert16to8(memVar)
                    memory.data[memAddress+j] =  memVar[0]
                    j++
                    memory.data[memAddress+j] =  memVar[1]
                } else {  //function (jumps)
                    let jumpAddress = functions[instructions[i]["val"+j]].memAddress
                    jumpAddress = this.functions.convert16to8(jumpAddress)
                    memory.data[memAddress+j] = jumpAddress[0]
                    j++
                    memory.data[memAddress+j] = jumpAddress[1]
                }



        }
        console.log(instructions)
        console.log(functions)
        console.log(vars)
    }
}

//test code
document.getElementById("codeEditor").value = "var a 1\n" +
    "var b 1\n" +
    "var c 0\n" +
    "\n" +
    "LD 0 a\n" +
    "LD 1 b\n" +
    "ADD 0 1 2 \n" +
    "ST 2 c\n" +
    "JSR infiniteLoopKekw\n" +
    "STOP\n" +
    "\n" +
    "<infiniteLoopKekw>\n" +
    "INC 2\n" +
    "JMP infiniteLoopKekw\n" +
    "\n" +
    "\n"




