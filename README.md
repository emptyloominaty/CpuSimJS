# CpuSimJS

## CPU
* Architecture: **EMP 1 16Bit**
* **Load–store** architecture
* Registers: 
    - 16 Registers (**r0-r15**)  <br/>
    - Program Counter, Stack Pointer, Flags <br/>
    - 16 Interrupt Pointers 
* IPC: **0.17** Avg
* Max Memory: **64**kB (**16**MB)
* Stack: **0x0000 - 0x00FF**
* Clock: 1Hz - **2MHz**

### Instructions
```
0 - STOP                        ()  
1 - ADD r(r) r(r) r(r)	        (Add)               
2 - SUB r(r) r(r) r(r)	        (Subtract)
3 - LD 	r(r) (mem)	        (Load)
4 - ST 	r(r) (mem)	        (Store)
5 - LDI r(r) (value)	        (Load Immediate)
6 - JMP (function)	        (Jump)
7 - JSR (function)	        (Jump to Subroutine)
8 - RFS 		        (Return From Subroutine)
9 - INC r(r)		        (Increment by 1)
10 - DEC r(r)		        (Decrement by 1)
11 - ADC r(r) r(r) r(r)	        (Add with Carry)
13 - ROL r(r)		        (Rotate Left)
14 - ROR r(r)		        (Rotate Right)
15 - SLL r(r)		        (Shift Logical Left)
16 - SLR r(r)		        (Shift Logical Right)
17 - TRR r(r) r(r)              (Transfer Register to Register)
18 - TRS                        (Transfer Register(r15) to Stack Pointer)
19 - TSR                        (Transfer Stack pointer to Register(r15))
20 - PSH r(r)                   (Push to Stack)
21 - POP r(r)                   (Pop from Stack)
22 - AND r(r) r(r) r(r)         (Logical AND)
23 - OR r(r) r(r) r(r)          (Logical OR)
24 - XOR r(r) r(r) r(r)         (Logical XOR)
25 - JG (function) r(r) r(r)    (Conditional Jump if Greater) 
26 - JL (function) r(r) r(r)    (Conditional Jump if Less) 
27 - JNG (function) r(r) r(r)   (Conditional Jump if Not Greater) 
28 - JNL (function) r(r) r(r)   (Conditional Jump if Not Less)
29 - JE (function) r(r) r(r)    (Conditional Jump if Equal) 
30 - JNE (function) r(r) r(r)   (Conditional Jump if Not Equal)
31 - MUL r(r) r(r) r(r)	        (Multiply)
32 - DIV r(r) r(r) r(r)	        (Divide)
33 - TRP                        (Transfer Register(r14) to Program Counter)
34 - TPR                        (Transfer Program Counter to Register(r14))
35 - AD2 r(r) r(r)              (Add A=A+B)
36 - SU2 r(r) r(r)              (Subtract A=A-B)
37 - NOP 		        (No operation)     
38 - SAR r(r)		        (Shift Arithmetic Right)
39 - NOT r(r)                   (Logical NOT)
40 - STR r(r) r(r)              (Store to Address stored in Register)
41 - LDR r(r) r(r)              (Load from Address stored in Register)
42 - ADDI r(r) (value)          (Add Immediate) (r0=r0+val)
43 - SUBI r(r) (value)          (Subtract Immediate)
44 - MULI r(r) (value)          (Multiply Immediate)
45 - DIVI r(r) (value)          (Divide Immediate)
46 - INT                        (Software Interrupt)
47 - RFI                        (Return from Interrupt)
48 - LDS r(r) (mem)             (Load from 24bit address)
49 - STS r(r) (mem)             (Store from 24bit address)
```
