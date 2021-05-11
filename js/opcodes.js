/*----------Op Codes List-------------*/
let opCodeList = {
    0: {bytes:1,name:"STOP",cycles:1},
    1: {bytes:4,name:"ADD",cycles:5},   //Add
    2: {bytes:4,name:"SUB",cycles:5},   //Subtract
    3: {bytes:4,name:"LD",cycles:6},    //Load
    4: {bytes:4,name:"ST",cycles:6},    //Store
    5: {bytes:4,name:"LDI",cycles:4},   //Load Immediate
    6: {bytes:3,name:"JMP",cycles:4},   //Jump
    7: {bytes:3,name:"JSR",cycles:6},   //Jump to Subroutine
    8: {bytes:1,name:"RFS",cycles:6},   //Return From Subroutine
    9: {bytes:2,name:"INC",cycles:3},   //Increment by 1
    10: {bytes:2,name:"DEC",cycles:3},  //Decrement by 1
    11: {bytes:4,name:"ADC",cycles:5},  //Add with Carry
    12: {bytes:4,name:"SUC",cycles:5},  //TODO:Subtract with Carry
    13: {bytes:2,name:"ROL",cycles:3},  //Rotate Left
    14: {bytes:2,name:"ROR",cycles:3},  //Rotate Right
    15: {bytes:2,name:"SLL",cycles:3},  //Shift Logical Left
    16: {bytes:2,name:"SLR",cycles:3},  //Shift Logical Right
    17: {bytes:3,name:"TRR",cycles:4},  //Transfer Register to Register 1->2
    18: {bytes:1,name:"TRS",cycles:2},  //Transfer Register(r15) to Stack Pointer
    19: {bytes:1,name:"TSR",cycles:2},  //Transfer Stack pointer to Register(r15)
    20: {bytes:2,name:"PSH",cycles:4},  //Push to stack
    21: {bytes:2,name:"POP",cycles:4},  //Pop from stack
    22: {bytes:4,name:"AND",cycles:5},  //Logical AND
    23: {bytes:4,name:"OR",cycles:5},   //Logical OR
    24: {bytes:4,name:"XOR",cycles:5},  //Logical XOR
    25: {bytes:5,name:"JG",cycles:7},   //Conditional Jump if greater
    26: {bytes:5,name:"JL",cycles:7},   //Conditional Jump if less
    27: {bytes:5,name:"JNG",cycles:7},  //Conditional Jump if not greater
    28: {bytes:5,name:"JNL",cycles:7},  //Conditional Jump if not less
    29: {bytes:5,name:"JE",cycles:7},   //Conditional Jump if equal
    30: {bytes:5,name:"JNE",cycles:7},  //Conditional Jump if not equal
    31: {bytes:4,name:"MUL",cycles:25}, //Multiply
    32: {bytes:4,name:"DIV",cycles:35}, //Divide
    33: {bytes:1,name:"TRP",cycles:2},  //Transfer Register(r14) to Program Counter
    34: {bytes:1,name:"TPR",cycles:2},  //Transfer Program Counter to Register(r14)
    35: {bytes:3,name:"AD2",cycles:4},  //Add but A=A+B
    36: {bytes:3,name:"SU2",cycles:4},  //Sub but A=A-B
    37: {bytes:1,name:"NOP",cycles:1},  //No operation
    38: {bytes:2,name:"SAR",cycles:3},  //Shift Arithmetic Right
    39: {bytes:2,name:"NOT",cycles:3},  //Logical NOT
    40: {bytes:3,name:"STR",cycles:5},  //Store to Address stored in Register
    41: {bytes:3,name:"LDR",cycles:5},  //Load from Address stored in Register
    42: {bytes:4,name:"ADDI",cycles:5}, //Add Immediate r0 = r0 + value
    43: {bytes:4,name:"SUBI",cycles:5}, //Subtract Immediate
    44: {bytes:4,name:"MULI",cycles:25},//Multiply Immediate
    45: {bytes:4,name:"DIVI",cycles:35},//Divide Immediate
    46: {bytes:2,name:"INT",cycles:8},  //Interrupt
    47: {bytes:1,name:"RFI",cycles:8},  //Return from Interrupt
    48: {bytes:5,name:"LDS",cycles:8},  //Load (24bit address)
    49: {bytes:5,name:"STS",cycles:8},  //Store (24bit address)
    50: {bytes:1,name:"TCR",cycles:2},  //Transfer Carry Flag to Register(r13)
    51: {bytes:1,name:"TRC",cycles:2},  //Transfer Register(r13) to Carry Flag
    52: {bytes:1,name:"SEI",cycles:2},  //TODO:Enable Interrupts
    53: {bytes:1,name:"SDI",cycles:2},  //TODO:Disable Interrupts
    54: {bytes:4,name:"LD8",cycles:5},  //TODO:Load 1byte
    55: {bytes:4,name:"ST8",cycles:5},  //TODO:Store 1byte
    56: {bytes:5,name:"LDS8",cycles:6}, //TODO:Load 1byte (24bit address)
    57: {bytes:5,name:"STS8",cycles:6}, //TODO:Store 1byte (24bit address)
    58: {bytes:3,name:"STRS",cycles:5}, //TODO:Store to Address saved in Register (24bit address)
    59: {bytes:3,name:"LDRS",cycles:5}, //TODO:Load from Address saved in Register (24bit address)
    60: {bytes:3,name:"STRS8",cycles:5},//TODO:Store to Address saved in Register (24bit address) 1byte
    61: {bytes:3,name:"LDRS8",cycles:5},//TODO:Load from Address saved in Register (24bit address) 1byte
    62: {bytes:4,name:"STAIP",cycles:5},//TODO:Store address to Interrupt Pointer

}
