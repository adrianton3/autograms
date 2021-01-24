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
            runBrute(partials[partialIndex - 1]);
        }
    }
}

void distribute (int threadCount) {
    std::sort(partials.begin(), partials.end(), [] (const auto& a, const auto& b) {
        const int deltaMax = *std::max_element(std::begin(a), std::end(a)) - *std::max_element(std::begin(b), std::end(b));

        if (deltaMax != 0) {
            return deltaMax < 0;
        }

        for (auto i = 0; i < a.size(); i++) {
            if (a[i] > b[i]) {
                return false;
            } else if (a[i] < b[i]) {
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