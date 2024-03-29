# CpuSimJS

## CPU
* Architecture: **EMP 1 16-Bit**
* **Load–store** architecture
* Data Width: **16-bit** 
* Address Width: **16-bit / 24-bit**
* Bus: **8-bit** Data + **16-bit** Address // **24-bit** Address
* Registers: 
    - 16 16-Bit Registers (**r0-r15**)  <br/>
    - 16-Bit Program Counter, 16-Bit Stack Pointer, Flags <br/>
    - 16 Interrupt Pointers 
* IPC: **0.14** Avg
* Max Memory: **64**kB (**16**MB)
* Stack: **256 Bytes**

        
|  | Start | End |
| ------------- | :-------------: | :-------------: |
| Stack  |  0x000000  |  0x0000FF   |
| Program Counter | 0x000100  | 0x00FFFF   |
| Address Space | 0x000000  | 0xFFFFFF   |
|  |   |    |
| CPU Ram | 0x000000  |  0x00FFFF  |
| VRAM | 0x010000  |  0x01FFFF  |
| Char ROM | 0x020000  |  0x0207FF |
| User Storage | 0x030000  |  0x03FFFF  |
| Extended Ram | 0x040000  |  0x09FFFF  |
| Keyboard | 0x0A0000  |  -  |
| Timers (1,2) | 0x0A0010  |  0x0A0011  |


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
68 - CBT8 r(r)                  (Convert Byte to 8 Bits) 1 -> 8 Registers r1 -> (r1:r8)
69 - C8TB r(r)                  (Convert 8 Bits to Byte) 8 -> 1 Register (r1:r8) -> r1
70 - DIVR r(r) r(r) r(r)	(Get Remainder of Division)
```

| OP - Name  | Cycles |Bytes |  | Byte1 | Byte2 | Byte3 | Byte4 | Byte5 |
| ------------- |:------:| :-------------: | :-------------: | :-------------: |  :-------------: |  :-------------: |  :-------------: |  :-------------: |  
| 0 - STOP  |   1    | 1  | -  | 0x00  |  - | -  | -  | -  |
| 1 - ADD  |   5    | 4 | -  | 0x01  |  reg | reg  | reg  | -  |
| 2 - SUB  |   5    | 4 | -  | 0x02  |  reg | reg  | reg  | -  |
| 3 - LD  |   6    | 4 | -  | 0x03  |  reg | memHi  | memLo  | -  |
| 4 - ST  |   6    | 4 | -  | 0x04  |  reg | memHi  | memLo  | -  |
| 5 - LDI   |   4    | 4 | -  | 0x05 |  reg | valueHi  | valueLo | -  |
| 6 - JMP  |   4    | 3 | -  | 0x06  |  memHi | memLo  | -  | -  |
| 7 - JSR  |   6    | 3 | -  | 0x07  |  memHi | memLo   | -  | -  |
| 8 - RFS  |   6    | 1 | -  | 0x08  |  - | -  | -  | -  |
| 9 - INC  |   3    | 2 | -  | 0x09  |  reg | -  | -  | -  |
| 10 - DEC  |   3    | 2 | -  | 0x0a  |  reg | -  | -  | -  |
| 11 - ADC |   5    | 4 | -  | 0x0b  |  reg | reg  | reg  | -  |
| 13 - ROL |   3    | 4 | -  | 0x0d  |  reg | reg  | reg  | -  |
| 14 - ROR |   3    | 2 | -  | 0x0e  |  reg | -  | -  | -  |         
| 15 - SLL |   3    | 2 | -  | 0x0f  |  reg | -  | -  | -  |       
| 16 - SLR |   3    | 2 | -  | 0x10  |  reg | -  | -  | -  |       
| 17 - TRR |   4    | 3 | -  |  0x11  |  reg | reg  | -  | -  |      
| 18 - TRS |   2    | 1 | -  |  0x12  |  - | -  | -  | -  |      
| 19 - TSR |   2    | 1 | -  |   0x13  |  - | -  | -  | -  |     
| 20 - PSH  |   4    | 2 | -  |  0x14  |  reg | -  | -  | -  |      
| 21 - POP |   4    | 2 | -  |   0x15  |  reg | -  | -  | -  |     
| 22 - AND |   5    | 4 |  -  |   0x16  |  reg | reg  | reg  | -  |    
| 23 - OR  |   5    | 4 |  -  |   0x17  |  reg | reg  | reg | -  |    
| 24 - XOR |   5    | 4 |  -  |   0x18 |  reg | reg  | reg  | -  |    
| 25 - JG  |   7    | 5 | -  |    0x19 |  reg | reg  | memHi  | memLo |    
| 26 - JL |   7    | 5 |  -  |    0x1a  |  reg | reg  | memHi  | memLo |   
| 27 - JNG |   7    | 5 |  -  |    0x1b  |  reg | reg  | memHi  | memLo |  
| 28 - JNL |   7    | 5 | -  |      0x1c  |   reg | reg  | memHi  | memLo |  
| 29 - JE  |   7    | 5 |  -  |    0x1d |  reg | reg  | memHi  | memLo |  
| 30 - JNE |   7    | 5 |   -  |   0x1e  |   reg | reg  | memHi  | memLo |  
| 31 - MUL  |   25   | 4 | -  |    0x1f  |  reg | reg  | reg  | -  |    
| 32 - DIV |   35   | 4 |  -  |   0x20 |   reg | reg  | reg  | -  |   
| 33 - TRP  |   2    | 1 |  -  |    0x21 |  - | -  | -  | -  |   
| 34 - TPR  |   2    | 1 |  -  |    0x22 |  - | -  | -  | -  |   
| 35 - AD2 |   4    | 3 |   -  |    0x23 |  reg | reg  | -  | -  |  
| 36 - SU2 |   4    | 3 |  -  |      0x24  |  reg | reg  | -  | -  | 
| 37 - NOP |   1    | 1 |  -  |     0x25  |  - | -  | -  | -  |  
| 38 - SAR  |   3    | 2 | -  |      0x26  |  reg | -  | -  | -  |  
| 39 - NOT |   3    | 2 | -  |       0x27  |  reg | -  | -  | -  | 
| 40 - STR  |   5    | 3 |  -  |     0x28  |  reg | reg  | -  | -  |  
| 41 - LDR  |   5    | 3 |  -  |     0x29  |  reg | reg  | -  | -  |  
| 42 - ADDI |   5    | 4 |  -  |      0x2a  |  reg | valueHi  | valueLo  | -  | 
| 43 - SUBI |   5    | 4 |   -  |      0x2b  |  reg | valueHi  | valueLo  | -  | 
| 44 - MULI |   25   | 4 |  -  |     0x2c  |  reg | valueHi  | valueLo  | -  | 
| 45 - DIVI  |   35   | 4 |  -  |     0x2d  |  reg | valueHi  | valueLo  | -  | 
| 46 - INT |   7    | 2 |    -  |     0x2e  |  ip | -  | -  | -  |
| 47 - RFI  |   7    | 1 |   -  |   0x2f  |  - | -  | -  | -  |
| 48 - LDX  |   8    | 5 |  -  |    0x30  |  reg | memHi  | memMi   | memLo  |
| 49 - STX  |   8    | 5 |  -  |    0x31  |  reg | memHi  | memMi   | memLo  |
| 50 - TCR  |   2    | 1 |  -  |    0x32  |  - | -  | -  | -  |
| 51 - TRC |   2    | 1 |   -  |   0x33  |  - | -  | -  | -  |
| 52 - SEI |   2    | 1 |  -  |    0x34  |  - | -  | -  | -  |
| 53 - SDI |   2    | 1 |  -  |    0x35  |  - | -  | -  | -  |
| 54 - LD8 |   5    | 4 |  -  |    0x36  |   reg | memHi  | memLo  | -  |
| 55 - ST8  |   5    | 4 |  -  |    0x37  |   reg | memHi  | memLo  | -  |
| 56 - LDX8 |   7    | 5 |  -  |    0x38  |   reg | memHi  | memMi   | memLo  |
| 57 - STX8 |   7    | 5 |  -  |    0x39  |   reg | memHi  | memMi   | memLo  |
| 58 - STRX |   6    | 3 |   -  |    0x3a |  reg | reg  | -  | -  |
| 59 - LDRX  |   6    | 3 |   -  |   0x3b  |  reg | reg  | -  | -  |
| 60 - STRX8 |   5    | 3 |  -  |    0x3c  |  reg | reg  | -  | -  |
| 61 - LDRX8 |   5    | 3 |  -  |    0x3d  |  reg | reg  | -  | -  |
| 62 - STAIP |   5    | 4 |  -  |    0x3e  |  ip | memHi  | memLo  | -  |
| 63 - STR8 |   4    | 3 |   -  |    0x3f  |   reg | reg  | -  | -  |
| 64 - LDR8  |   4    | 3 |  -  |    0x40 |   reg | reg  | -  | -  |
| 65 - JC |   4    | 3 |    -  |  0x41  | memHi | memLo  | -  | -  |
| 66 - JNC |   4    | 3 |   -  |   0x42  |  memHi | memLo  | -  | -  |
| 67 - LDI8 |   3    | 3 |  -  |    0x43  |  reg | value  | -  | -  |
| 68 - CBT8 |   11   | 2 |  -  |    0x44  |  reg |  - | -  | -  |
| 69 - C8TB |   8    | 2 |  -  |    0x45  |  reg |  - | -  | -  |
| 70 - DIVR |   35   | 4 |  -  |   0x46 |   reg | reg  | reg  | -  |   

### Interrupts

| IP | Interrupt Name |
| ------------- | :-------------: |
| 0 | RESERVED |
| 1 | Keyboard  |
| 2 | Timer1  | 
| 3 | Timer2  | 
| 4 | RESERVED  | 
| 5 | RESERVED  | 
| 6 | RESERVED  | 
| 7 | RESERVED  | 
| 8 | RESERVED  | 
| 9 | RESERVED  | 
| 10 | User  | 
| 11 | User  | 
| 12 | User  | 
| 13 | User  | 
| 14 | User  | 
| 15 | User  | 

# GPU
* Video Memory: **64**kB

| Mode  | Resolution  | Colors | VRAM req. |
| :-------------: | :-------------: | :-------------: | :-------------: | 
| 0 | 320x200 | 2  | 62.5kB |
| 1 | 320x200 | 256  | 62.5kB |
| 2*| 320x200 | 2  | 7.81kB |

*Not implemented yet
    
# Memory
* 0.5 - 64kB CPU RAM
* 8 - 64kB GPU RAM
* 2kB Character ROM
* 0 - 64kB User Storage
* 0 - 320kB Extended RAM (only for **data**, **instructions** must be copied to main 64kB memory)


## Max Clock(sim)
* on Intel Core i5 6600k 4.4GHz
    -  **3.7**-**3.8**MHz (Firefox)
    -  **2.6**-**2.7**MHz (Chrome)
    -  **2.6**-**2.7**MHz (Electron)
    -  **2.3**-**2.7**MHz (Edge)


    
* on Qualcomm SDM636 1.8GHz
    -  **230**kHz (Chrome)
  

        