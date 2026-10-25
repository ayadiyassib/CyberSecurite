#include <iostream>
#include <string>
#include <chrono>
#include <sstream>
#include <iomanip>
#include <openssl/sha.h>

std::string sha256(const std::string& data) {
    unsigned char hash[SHA256_DIGEST_LENGTH];
    SHA256(reinterpret_cast<const unsigned char*>(data.c_str()), data.size(), hash);
    std::stringstream ss;

    for (int i=0; i < SHA256_DIGEST_LENGTH; i++) 
        ss << std::hex << std::setw(2) << std::setfill('0') << (int)hash[i];
    return ss.str();
}

void mineBlock(const std::string& data, int difficulty) {
    std::string target(difficulty, '0');
    long nonce = 0;
    auto start = std::chrono::high_resolution_clock::now();
    while (true) {
        std::string hash = sha256(data + std::to_string(nonce));
        if (hash.compare(0, difficulty, target) == 0) {
            auto end = std::chrono::high_resolution_clock::now();
            auto ms = std::chrono::duration_cast<std::chrono::milliseconds>(end - start).count();
            std::cout << "Difficulte " << difficulty
                      << " | nonce=" << nonce 
                      << " | temps=" << ms << " ms\n"
                      << " hash=" << hash << "\n";
            return;
        }
        nonce++;
    }
}

int main() 
{
    for (int d=1; d<=4; ++d) 
        mineBlock("bloc-demo", d);
    return 0;
}