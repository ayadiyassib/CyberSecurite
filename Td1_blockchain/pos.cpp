#include <iostream>
#include <vector>
#include <string>
#include <map>
#include <random>
#include <chrono>

struct Validator { 
    std::string name;
    int stake;
};

std::string selectValidator(const std::vector<Validator>& vs) {
    int total = 0;
    for (auto& v: vs) total += v.stake;
    static std::mt19937 gen(std::random_device{}());
    std::uniform_int_distribution<> dist(1, total);
    int pick = dist(gen), cum = 0;
    for (auto& v : vs) {
        cum += v.stake;
        if (pick <= cum) return v.name;
    }
    return vs.back().name;
}

int main() {
    std::vector<Validator> vs = {
        {"Alice", 32},
        {"Bob", 64},
        {"Charlie", 128},
        {"Dave", 16}
    };
    std::map<std::string, int> counts;
    auto start = std::chrono::high_resolution_clock::now();
    for (int i=0; i<10000; ++i) counts[selectValidator(vs)]++;
    auto ms = std::chrono::duration_cast<std::chrono::milliseconds>(
        std::chrono::high_resolution_clock::now() - start).count();

    for (auto& [n, c] : counts)
        std::cout << n << " : " << c << " sélections (" << (100.0 * c / 10000) << "%)\n";
    std::cout << "Temps total (10000 tours) : " << ms << " ms\n";
    std::cout << "=> PoS est beaucoup plus rapide que PoW (pas de calcul intensif).\n";
    return 0;
}
