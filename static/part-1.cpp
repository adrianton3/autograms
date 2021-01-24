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

std::vector<std::vector<int>> partials;

void outputPartial (const std::vector<int>& partial) {
    partials.push_back(partial);
}