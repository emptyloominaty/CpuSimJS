let assembler = {
    assembly: function() {
        let code = document.getElementById("codeEditor").value
        code = code.replace(/(\r\n|\n|\r)/gm, "");
        code = code.split(";")

        let vars = {}
        let functions = {}
        let instructions = {}

        let inst = 0
        for(let i = 0; i<code.length; i++) {
            let line = code[i].split(" ")

            const regex = /<\w?\w?\w?\w?\w?\w?\w?\w?\w?\w?\w?\w?\w?\w?\w?>/g   //<Function> <Kekw>
            let found = line[0].match(regex) || false

            /*----------------------------------------------- */
            if (line[0]==="var" || line[0]==="VAR") {
                vars[line[1]] = {name:line[1], value:line[2], address:i*2, memAddress:0}
            }
            /*----------------------------------------------- */
            else if (found[0]) {
                let fnc = line[0].replace('<','');
                fnc = fnc.replace('>','');

                functions[fnc] = {name:fnc, memAddress:0}

            }
            /*----------------------------------------------- */
            else if (line[0]!=="" || line[0]!==" ") {
                inst++
                instructions[inst] = {name:line[0], val1:line[1]||0, val2:line[2]||0, val3:line[3]||0, val4:line[4]||0}
            }

            console.log(line)
        }

        let numberOfVars =  Object.keys(vars).length;
        let numberOfInstructions = Object.keys(instructions).length;

        //get all instruction bytes
        //calc vars addresses
        //calc functions addresses
        //calc instruction addreses

        //opCodeList (with names????)

        console.log(numberOfVars)


    }


}

