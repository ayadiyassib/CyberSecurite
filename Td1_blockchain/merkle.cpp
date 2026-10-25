#include <iostream>
#include <vector>
#include <string>
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

class MerkleTree {
    std::vector<std::vector<std::string>> levels;
public:
    explicit MerkleTree(const std::vector<std::string>& txs) {
        std::vector<std::string> leaf;
        for (auto& t: txs) leaf.push_back(sha256(t));
        levels.push_back(leaf);

        while(levels.back().size() > 1) {
            const auto& cur = levels.back();
            std::vector<std::string> next;

            for(size_t i=0; i < cur.size(); i+=2) {
                std::string a = cur[i];
                std::string b = (i + 1 < cur.size()) ? cur[i+1] :a; 
                next.push_back(sha256(a + b));
            }
            levels.push_back(next);
        }
    }
    std::string root() const { return levels.back()[0]; }
    void print() const {
        for (int i = (int)levels.size() -1; i>= 0; --i) {
            for (auto& h: levels[i]) std::cout << h.substr(0, 16) << "... ";
            std::cout << "\n";
        }
    }
};

int main() {
    std::vector<std::string> txs = {
        "Alice->Bob:10", 
        "Bob->Charlie:5",
        "Charlie->Dave:2", 
        "Dave->Eve:1"
    };

    MerkleTree mt(txs);
    std::cout << "Merkle Root: " << mt.root() << "\n\n";
    std::cout << "Niveaux (haut -> bas):\n";
    mt.print();
    return 0;
}