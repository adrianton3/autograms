#include <array>
#include <vector>
#include <algorithm>
#include <functional>
#include <iostream>
#include <chrono>

const auto start = std::chrono::system_clock::now();

template<typename T>
void outputComplete (const T& solution) {
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

void distribute () {
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

    for (const auto& partial : partials) {
        runBrute(partial.prefix);
    }
}


int main () {
	runPartial();
	distribute();
	return 0;
}