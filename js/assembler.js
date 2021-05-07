let assembler = {
    assembly: function() {
        let code = document.getElementById("codeEditor").value
        code = code.replace(/(\r\n|\n|\r)/gm, "");
        code = code.split(";")
        code = code.filter(function(e){return e});

        let vars = {}
        let functions = {}
        let instructions = {}
        console.log(code)
        let inst = 0
        for(let i = 0; i<code.length; i++) {
            let line = code[i].split(" ")
            line  = line.filter(function(e){return e});

            const regex = /<.*?>/g // <Function>
            let found = line[0].match(regex) || false

            /*-------------------Variables---------------------------- */
            if (line[0]==="var" || line[0]==="VAR") {
                vars[line[1]] = {name:line[1], value:line[2], address:i*2, memAddress:0}
            }
            /*-------------------Functions---------------------------- */
            else if (found[0]) {
                let fnc = line[0].replace('<','');
                fnc = fnc.replace('>','');

                functions[fnc] = {name:fnc,line:i, memAddress:0}

            }
            /*----------------------------------------------- */
            else if (line[0]!=="" || line[0]!==" ") {
                instructions[inst] = {name:line[0], val1:line[1]||0, val2:line[2]||0, val3:line[3]||0, val4:line[4]||0}
                inst++
            }

            console.log(line)
        } //loop end

        let numberOfVars =  Object.keys(vars).length

        //very smart
        let opListAssembler = {}
        for (let i = 0; i<Object.keys(opCodeList).length; i++) {
                opListAssembler[opCodeList[i].name]={bytes:opCodeList[i].bytes, cycles:opCodeList[i].cycles}
        }

        console.log(instructions)

        //get all instruction bytes
        let allInstructionsBytes = 0
        for (let i = 0; i<Object.keys(instructions).length; i++) {
            console.log(instructions[i])
            allInstructionsBytes += opListAssembler[instructions[i].name].bytes
        }

        //calc vars addresses
        let varsAddress = 256+allInstructionsBytes
        for (const key of Object.keys(vars)) {
            vars[key].memAddress = (varsAddress + vars[key].address)
        }

        //calc functions addresses
        for (const key of Object.keys(functions)) {
            functions[key].memAddress = (functions[key].line-numberOfVars) //FIX
        }


        //calc instruction addreses


        console.log(numberOfVars)


    }


}

