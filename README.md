# CpuSimJS

## CPU
* Architecture: **EMP 1 16 Bit**
* **Load–store** architecture
* Registers: **r0-r15**, Program Counter, Stack Pointer, Flags
* IPC: 0.14 - 1 (**0.22** Avg)
* Memory: **64** kB
* Stack: **0x0000 - 0x00FF**

### Instructions
```
0 - NOP 		        (No operation)     
1 - ADD #(r) #(r) #(r)	        (Add)               
2 - SUB #(r) #(r) #(r)	        (Subtract)
3 - LD 	#(r) (mem)	        (Load)
4 - ST 	#(r) (mem)	        (Store)
5 - LDI #(r) #(value)	        (Load Immediate)
6 - JMP (function)	        (Jump)
7 - JSR (function)	        (Jump to Subroutine)
8 - RFS 		        (Return From Subroutine)
9 - INC #(r)		        (Increment by 1)
10 - DEC #(r)		        (Decrement by 1)
11 - ADC #(r) #(r) #(r)	        (Add with Carry)
13 - ROL #(r)		        (Rotate Left)
14 - ROR #(r)		        (Rotate Right)
15 - SLL #(r)		        (Shift Logical Left)
16 - SLR #(r)		        (Shift Logical Right)
17 - TRR #(r) #(r)              (Transfer Register to Register)
18 - TRS                        (Transfer Register(r15) to Stack Pointer)
19 - TSR                        (Transfer Stack pointer to Register(r15))
20 - PSH #(r)                   (Push to Stack)
21 - POP #(r)                   (Pop from Stack)
22 - AND #(r) #(r) #(r)         (Logical AND)
23 - OR #(r) #(r) #(r)          (Logical OR)
24 - XOR #(r) #(r) #(r)         (Logical XOR)
25 - JG (function) #(r) #(r)    (Conditional Jump if Greater) 
26 - JL (function) #(r) #(r)    (Conditional Jump if Less) 
27 - JNG (function) #(r) #(r)   (Conditional Jump if Not Greater) 
28 - JNL (function) #(r) #(r)   (Conditional Jump if Not Less)
29 - JE (function) #(r) #(r)    (Conditional Jump if Equal) 
30 - JNE (function) #(r) #(r)   (Conditional Jump if Not Equal)

33 - TRP                (Transfer Register(r14) to Program Counter)
34 - TPR                (Transfer Program Counter to Register(r14))

37 - STOP               ()
38 - SAR #(r)		(Shift Arithmetic Right)
39 - NOT #(r)           (Logical NOT)
```
