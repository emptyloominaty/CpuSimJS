/*----------Op Codes List-------------*/
let opCodeList = {
    0: {bytes:1,name:"NOP",cycles:1},   //No operation
    1: {bytes:4,name:"ADD",cycles:5},   //Add
    2: {bytes:4,name:"SUB",cycles:5},   //Subtract
    3: {bytes:4,name:"LD",cycles:5},    //Load
    4: {bytes:4,name:"ST",cycles:5},    //Store
    5: {bytes:4,name:"LDI",cycles:4},   //Load Immediate
    6: {bytes:3,name:"JMP",cycles:4},   //Jump
    7: {bytes:3,name:"JSR",cycles:6},   //Jump to Subroutine
    8: {bytes:1,name:"RFS",cycles:6},   //Return From Subroutine
    9: {bytes:2,name:"INC",cycles:3},   //Increment by 1
    10: {bytes:2,name:"DEC",cycles:3},  //Decrement by 1
    11: {bytes:4,name:"ADC",cycles:5},  //Add with Carry //TODO:FIX?
    12: {bytes:4,name:"SUC",cycles:5},  //TODO:Subtract with Carry
    13: {bytes:2,name:"ROL",cycles:3},  //TODO:Rotate Left
    14: {bytes:2,name:"ROR",cycles:3},  //TODO:Rotate Right
    15: {bytes:2,name:"SHL",cycles:3},  //Shift Left
    16: {bytes:2,name:"SHR",cycles:3},  //Shift Right
    17: {bytes:3,name:"TR",cycles:4},   //TODO:Transfer Register to Register
    18: {bytes:1,name:"TRS",cycles:2},  //TODO:Transfer Register(r15) to Stack Pointer
    19: {bytes:1,name:"TSR",cycles:2},  //TODO:Transfer Stack pointer to Register(r15)
    20: {bytes:2,name:"PSH",cycles:4},  //TODO:Push to stack
    21: {bytes:2,name:"POP",cycles:4},  //TODO:Pop from stack
    22: {bytes:4,name:"AND",cycles:5},  //TODO:Logical AND
    23: {bytes:4,name:"OR",cycles:5},   //TODO:Logical OR
    24: {bytes:4,name:"XOR",cycles:5},  //TODO:Logical XOR

    25: {bytes:3,name:"JG",cycles:5},    //TODO:Conditional Jump if greater
    26: {bytes:3,name:"JL",cycles:5},    //TODO:Conditional Jump if less
    27: {bytes:3,name:"JNG",cycles:5},   //TODO:Conditional Jump if not greater
    28: {bytes:3,name:"JNL",cycles:5},   //TODO:Conditional Jump if not less
    29: {bytes:3,name:"JE",cycles:5},    //TODO:Conditional Jump if equal
    30: {bytes:3,name:"JNE",cycles:5},   //TODO:Conditional Jump if not equal

    31: {bytes:4,name:"MUL",cycles:12},  //TODO:Multiply
    32: {bytes:4,name:"DIV",cycles:35},  //TODO:Divide

    33: {bytes:1,name:"TRP",cycles:2},  //TODO:Transfer Register(r14) to Program Counter
    34: {bytes:1,name:"TPR",cycles:2},  //TODO:Transfer Program Counter to Register(r14)

    35: {bytes:3,name:"AD2",cycles:4},  //TODO:Add but A=A+B
    36: {bytes:3,name:"SU2",cycles:4},  //TODO:Sub but A=A-B

    37: {bytes:1,name:"STOP",cycles:1},
}
