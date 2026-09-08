cmake_minimum_required(VERSION 3.20)
project(chimera2_native VERSION 1.1 LANGUAGES C CXX)
set(CMAKE_C_STANDARD 11)
set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
option(CHIMERA_ENABLE_NASM "Build native x86-64 assembly helpers when NASM is available" ON)
add_library(chimera2 STATIC
  src/c/chimera_c_api.c
  src/c/chimera_catalog.c
  src/cpp/chimera_cpu.cpp
  src/cpp/koronos.cpp
  src/cpp/runtime.cpp
  src/cpp/desktop.cpp
  src/cpp/federation.cpp
  src/cpp/platform_compat.cpp
)
target_include_directories(chimera2 PUBLIC include)
if(CHIMERA_ENABLE_NASM AND CMAKE_SYSTEM_PROCESSOR MATCHES "[Xx]86_64|AMD64")
  find_program(NASM_EXECUTABLE nasm)
  if(NASM_EXECUTABLE)
    enable_language(ASM_NASM)
    target_sources(chimera2 PRIVATE asm/x86_64/chimera_8192.asm)
  endif()
endif()
add_executable(chimera2_selftest tests/native_selftest.cpp)
target_link_libraries(chimera2_selftest PRIVATE chimera2)
add_executable(chimera2_compat_selftest tests/platform_compat_selftest.cpp)
target_link_libraries(chimera2_compat_selftest PRIVATE chimera2)
enable_testing()
add_test(NAME chimera2_selftest COMMAND chimera2_selftest)
add_test(NAME chimera2_compat_selftest COMMAND chimera2_compat_selftest)
