#include <iostream>
#include <vector>
#include <string>
#include <ctime>
#include <sstream>
#include <iomanip>
#include <openssl/sha.h>


std::string sha256(const std::string& data) {
    unsigned char h[SHA256_DIGEST_LENGTH];
    SHA256(reinterpret_cast<const unsigned char*>(data.c_str()), data.size(), h);
    std::stringstream ss;

    for (int i=0; i < SHA256_DIGEST_LENGTH; i++)
        ss << std::hex << std::setw(2) << std::setfill('0') << (int)h[i];
    return ss.str();
}

struct Block {
    int index; 
    std::string timestamp, data, prevHash, hash;
    long nonce = 0;
    std::string serialize() const {
        return std::to_string(index) + timestamp + data + prevHash + std::to_string(nonce);
    }
};

class Blockchain {
    std::vector<Block> chain;
    int difficulty;
public:
    explicit Blockchain(int diff) : difficulty(diff) {
        Block g{0, now(), "Genesis", std::string(64, '0'), "", 0};
        g.hash = mine(g);
        chain.push_back(g);
    }
    static std::string now() {
        std::time_t t = std::time(nullptr);
        char buf[32]; std::strftime(buf, sizeof(buf), "%Y-%m-%d %H:%M:%S", std::localtime(&t));
        return buf;
    }
    std::string mine(Block& b) {
        std::string target(difficulty, '0');
        b.nonce = 0;
        while (true) {
            std::string h = sha256(b.serialize());
            if (h.compare(0, difficulty, target) == 0) return h;
            b.nonce++;
        }
    }
    void addBlock(const std::string& data) {
        Block b{(int)chain.size(), now(), data, chain.back().hash, "", 0};
        b.hash = mine(b);
        chain.push_back(b);
    }
    bool isValid() const {
        for (size_t i = 1; i < chain.size(); ++i) {
            const Block& c = chain[i];
            const Block& p = chain[i-1];
            if (sha256(c.serialize()) != c.hash) return false;
            if (c.prevHash != p.hash) return false;
        }
        return true;
    }
    void tamper(int idx, const std::string& newData) { chain[idx].data = newData; }
    void print() const {
        for (auto& b : chain) {
            std::cout << "#" << b.index << " [" << b.timestamp << "]\n"
                      << "  data=" << b.data << "\n"
                      << "  prev=" << b.prevHash.substr(0,16) << "...\n"
                      << "  hash=" << b.hash.substr(0,16) << "... | nonce=" << b.nonce << "\n\n";
        }
    }
};

int main() 
{
    Blockchain bc(3);
    bc.addBlock("Alice->Bob:10");
    bc.addBlock("Alice->Charlie:5");
    bc.addBlock("Charlie->Dave:2");

    std::cout << "=== Chaîne valide ===\n"; bc.print();
    std::cout << "Validité : " << (bc.isValid() ? "OUI" : "NON") << "\n\n";

    std::cout << "=== Falsification du bloc #1 ===\n";
    bc.tamper(1, "HACKED");
    std::cout << "Validité : " << (bc.isValid() ? "OUI" : "NON") << "\n";
    return 0;
}