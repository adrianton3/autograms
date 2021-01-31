#include <array>
#include <vector>
#include <algorithm>
#include <functional>
#include <iostream>
#include <chrono>
#include <thread>
#include <mutex>

const auto start = std::chrono::system_clock::now();

std::mutex outputMutex;

template<typename T>
void outputComplete (const T& solution) {
    std::scoped_lock lock { outputMutex };

    const auto end = std::chrono::system_clock::now();

    for (const auto& count : solution) {
        std::cout << count << " ";
    }

    std::cout << std::endl;

    const std::chrono::duration<double> seconds = end - start;
    std::cout << seconds.count() << " seconds" << std::endl << std::endl;
}

constexpr auto prefixLength = /*$prefixLength*/;

struct Partial { int max; std::array<int, prefixLength> prefix; };

std::vector<Partial> partials;

template<typename T>
void outputPartial (const T& partial) {
    const auto max = *std::max_element(std::begin(partial), std::end(partial));
    partials.push_back({ max, partial });
}

/*$common*/

/*$brute*/

/*$partial*/

std::vector<std::thread> threads;

int partialIndex;

std::mutex pickMutex;

void pick () {
    while (true) {
        {
            std::scoped_lock lock { pickMutex };

            if (partialIndex >= partials.size()) {
                return;
            }

            partialIndex++;
        }

        if (partialIndex < partials.size()) {
            runBrute(partials[partialIndex - 1].prefix);
        }
    }
}

void distribute (int threadCount) {
    std::sort(partials.begin(), partials.end(), [] (const auto& a, const auto& b) {
        const auto deltaMax = a.max - b.max;

        if (deltaMax != 0) {
            return deltaMax < 0;
        }

        const auto& aPrefix = a.prefix;
        const auto& bPrefix = b.prefix;

        for (auto i = 0; i < aPrefix.size(); i++) {
            if (aPrefix[i] > bPrefix[i]) {
                return false;
            } else if (aPrefix[i] < bPrefix[i]) {
                return true;
            }
        }

        return true;
    });

    partialIndex = 0;

    for (auto i = 1; i < threadCount; i++) {
        threads.push_back(std::thread { pick });
    }

    pick();

    for (auto& thread : threads) {
        thread.join();
    }
}


int main () {
	runPartial();
	distribute(/*$threadCount*/);
	return 0;
}
