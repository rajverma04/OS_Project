#include <iostream>
#include "file_operations.h"

int main() {
    std::cout << "Distributed File System Running..." << std::endl;
    create_file("example.txt");
    return 0;
}
