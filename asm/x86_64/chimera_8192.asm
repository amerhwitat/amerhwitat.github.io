; Chimera II native x86-64 helper layer.
; The architectural register is 8192 bits = 128 lanes of 64 bits.
; SysV ABI. These helpers are intentionally small; the C/C++ layer remains portable.
bits 64
default rel
section .text
global chimera_lane_xor
chimera_lane_xor:
    xor rax, rax
    ret

global chimera_lane_add
chimera_lane_add:
    mov rax, rdi
    add rax, rsi
    ret
