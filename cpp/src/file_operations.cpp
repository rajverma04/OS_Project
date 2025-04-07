#include <iostream>
#include <fstream>
#include "file_operations.h"

void create_file(const std::string& filename) {
    std::ofstream file(filename);
    if (file) {
        std::cout << "File created: " << filename << std::endl;
    } else {
        std::cerr << "Failed to create file: " << filename << std::endl;
    }
}
