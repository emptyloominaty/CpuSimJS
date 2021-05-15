# CpuSimJS

## CPU
* Architecture: **EMP 1 16-Bit**
* **Load–store** architecture
* Data Width: **16-bit**
* Address Width: **16-bit / 24-bit**
* Registers: 
    - 16 16-Bit Registers (**r0-r15**)  <br/>
    - 16-Bit Program Counter, 16-Bit Stack Pointer, Flags <br/>
    - 16 Interrupt Pointers 
* IPC: **0.17** Avg
* Max Memory: **64**kB (**16**MB)
* Stack: **0x0000 - 0x00FF**
* Data Types:
    - **8-bit** Unsigned Integer
    - **8-bit** Signed Integer
    - **16-bit** Unsigned Integer
    - **16-bit** Signed Integer
    - **32-bit**? Unsigned Integer
    - **32-bit**? Signed Integer
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
25 - JG r(r) r(r) (function)    (Conditional Jump if Greater) 
26 - JL r(r) r(r) (function)    (Conditional Jump if Less) 
27 - JNG r(r) r(r) (function)   (Conditional Jump if Not Greater) 
28 - JNL r(r) r(r) (function)   (Conditional Jump if Not Less)
29 - JE r(r) r(r) (function)    (Conditional Jump if Equal) 
30 - JNE r(r) r(r)  (function)  (Conditional Jump if Not Equal)
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
46 - INT (ip)                   (Software Interrupt)
47 - RFI                        (Return from Interrupt)
48 - LDX r(r) (mem)             (Load from 24bit address)
49 - STX r(r) (mem)             (Store from 24bit address)
50 - TCR                        (Transfer Carry Flag to Register(r13))
51 - TRC                        (Transfer Register(r13) to Carry Flag)
52 - SEI                        (Enable Interrupts)
53 - SDI                        (Disable Interrupts)
54 - LD8 r(r) (mem)             (Load 1byte)
55 - ST8 r(r) (mem)             (Store 1byte)
56 - LDX8 r(r) (mem)            (Load 1byte (24bit address))
57 - STX8 r(r) (mem)            (Store 1byte (24bit address))
58 - STRX r(r) r(r)             (Store to Address stored in Register (24bit address))
59 - LDRX r(r) r(r)             (Load from Address stored in Register (24bit address))
60 - STRX8 r(r) r(r)            (Store to Address stored in Register (24bit address) 1byte)
61 - LDRX8 r(r) r(r)            (Load from Address stored in Register (24bit address) 1byte)
62 - STAIP (ip) (mem)           (Store Address to Interrupt Pointer)
63 - STR8 r(r) r(r)             (Store to Address stored in Register 1byte)
64 - LDR8 r(r) r(r)             (Load from Address stored in Register 1byte)
65 - JC (function)              (Conditional Jump if Carry)
66 - JNC (function)             (Conditional Jump if not Carry)
67 - LDI8 r(r) (val)            (Load Immediate 1byte)
```

| OP - Name  | Cycles |Bytes |
| ------------- | :-------------: | :-------------: |
| 0 - STOP  | 1  | 1  |
| 1 - ADD  | 5  | 4 |
| 2 - SUB  |  5 | 4 |
| 3 - LD  |  6 | 4 |
| 4 - ST  |  6 | 4 |
| 5 - LDI   | 4  | 4 |
| 6 - JMP  |  4 | 3 |
| 7 - JSR  |  6 | 3 |
| 8 - RFS  | 6  | 1 |
| 9 - INC  |  3 | 2 |
| 10 - DEC  |  3 | 2 |
| 11 - ADC | 5  | 4 |
| 13 - ROL | 3  | 4 |
| 14 - ROR |  3 | 2 |         
| 15 - SLL |  3 | 2 |       
| 16 - SLR |  3 | 2 |       
| 17 - TRR | 4  | 3 |       
| 18 - TRS | 2  | 1 |       
| 19 - TSR |  2 | 1 |       
| 20 - PSH  |  4 | 2 |       
| 21 - POP |  4 | 2 |       
| 22 - AND |  5 | 4 |       
| 23 - OR  |  5 | 4 |       
| 24 - XOR |  5 | 4 |       
| 25 - JG  |  7 | 5 |       
| 26 - JL |  7 | 5 |       
| 27 - JNG | 7  | 5 |       
| 28 - JNL | 7  | 5 |       
| 29 - JE  | 7  | 5 |       
| 30 - JNE | 7  | 5 |       
| 31 - MUL  | 25  | 4 |       
| 32 - DIV |  35 | 4 |       
| 33 - TRP  | 2  | 1 |       
| 34 - TPR  | 2  | 1 |       
| 35 - AD2 | 4  | 3 |       
| 36 - SU2 | 4  | 3 |       
| 37 - NOP | 1  | 1 |       
| 38 - SAR  | 3  | 2 |       
| 39 - NOT |  3 | 2 |       
| 40 - STR  | 5  | 3 |       
| 41 - LDR  | 5  | 3 |       
| 42 - ADDI | 5  | 4 |       
| 43 - SUBI | 5  | 4 |       
| 44 - MULI | 25  | 4 |       
| 45 - DIVI  | 35  | 4 |       
| 46 - INT |  7 | 2 |       
| 47 - RFI  | 7  | 1 |    
| 48 - LDX  |  8 | 5 |    
| 49 - STX  |  8 | 5 |    
| 50 - TCR  | 2  | 1 |    
| 51 - TRC |  2 | 1 |    
| 52 - SEI | 2  | 1 |    
| 53 - SDI | 2  | 1 |    
| 54 - LD8 |  5 | 4 |    
| 55 - ST8  |  5 | 4 |    
| 56 - LDX8 | 7  | 5 |    
| 57 - STX8 | 7  | 5 |    
| 58 - STRX |  6 | 3 |
| 59 - LDRX  | 6  | 3 |    
| 60 - STRX8 | 6  | 3 |    
| 61 - LDRX8 | 6  | 3 |    
| 62 - STAIP | 5  | 4 |    
| 63 - STR8 | 5  | 3 |
| 64 - LDR8  | 5  | 3 |    
| 65 - JC | 4  | 3 |    
| 66 - JNC | 4  | 3 |    
| 67 - LDI8 | 3  | 3 |    



|  | Start | End |
| ------------- | :-------------: | :-------------: |
| Stack  |  0x000000  |  0x0000FF   |
| Program Counter | 0x000100  | 0x00FFFF   |
| Address Space | 0x000000  | 0xFFFFFF   |