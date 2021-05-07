let assembler = {
    assembly: function() {
        let code = document.getElementById("codeEditor").value
        code = code.replace(/;.*?;/g, ""); //comments
        code = code.split("\n")
        code = code.filter(function(e){return e});
        console.log(code)

        let vars = {}
        let functions = {}
        let instructions = {}

        //very smart
        let opListAssembler = {}
        for (let i = 0; i<Object.keys(opCodeList).length; i++) {
            opListAssembler[opCodeList[i].name]={bytes:opCodeList[i].bytes, cycles:opCodeList[i].cycles}
        }

        let numberOfVars = 0
        let bytes = 0

        let inst = 0
        for(let i = 0; i<code.length; i++) {
            let line = code[i].split(" ")
            line  = line.filter(function(e){return e});
            console.log(line)
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
                instructions[inst] = {name:line[0], line:i, memAddress:256+bytes, val1:line[1]||0, val2:line[2]||0, val3:line[3]||0, val4:line[4]||0}
                bytes+=opListAssembler[line[0]].bytes
                inst++
            }

            console.log(line)
        } //loop end

        //calc vars addresses
        let varsAddress = 256+bytes
        for (const key of Object.keys(vars)) {
            vars[key].memAddress = (varsAddress + vars[key].address)
        }

        console.log(instructions)
        console.log(functions)
        console.log(vars)


    }


}
