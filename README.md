Find autograms and reflexicons in English, French, Italian, Latin and Romanian.

This was used to find the first documented reflexicons in Latin and Romanian.
A slightly modified (but hacky) version of this was used to find the first reflexicon in Swedish.

The algorithms is exhaustive and it would take hours to completely explore the search space,
but due to a few heuristics the search space is traversed in such a way that solutions are found in at most a few seconds. The single-threaded native version finds a (the only) reflexicon in Romanian in a bit under 9 seconds
on a modern 3.8 GHz CPU. The multi-threaded version finds the same reflexicon in just under 1 second. Romanian was used as the main benchmark since out of all tested languages it has the longest numerals and there are 15 letters used by them. This is a lot compared to say, Italian with its much shorter numerals, no 'decoration' around letters in the plural and use of only 13 letters in its numerals. The 3 Italian reflexicons are found in 0.06 seconds by comparison (when run on multiple threads). Reflexicons were favored when choosing a benchmark because they are more strict than autograms - there is no padding or "slack" given by an intro/outro. For this reason reflexicons are not even guaranteed to exist for a given language.

### Web version

The web version runs just fine in Chrome and Firefox. It spawns a pool of webworkers and dispatches
searches starting with carefully chosen prefixes. The pool size is configurable at runtime - the user can
allocate more or less depending on other tasks the computer might be engaged with.

https://adrianton3.github.io/autograms

### Native version

The binary version was written mainly to see how fast it can be compared to the web one.
Numeral signatures, search spans and other data used to direct the search is computed using the same logic
as in the web version (this time using node) and from this a cpp file is generated which is then fed to a c++ compiler. The same data could be obtained entirely at compile-time in c++ with `constexpr` and friends but the
JavaScript logic was already tried and tested and works just fine.

### Web benchmark

There is also a more static page that just logs the time it takes to find the Romanian reflexicon.
This is used only for benchmarking reasons. Romanian was chosen as its first reflexicon is harder
to find than the ones in the other available languages.

https://adrianton3.github.io/autograms/bench.html

### Autograms found by this project

#### Latin reflexicon

> Quattuor a, sex c, quattuor d, quindecim e, quinque i, sex m, tres n, octo o, tres p, septem q, septem r, octo s, quattuordecim t, decem u, tres x

#### Romanian reflexicons/autograms

> Șapte a-uri, patru ă-uri, zece c-uri, trei d-uri, șaisprezece e-uri, treizecișiunu i-uri, cinci n-uri, cinci o-uri, șase p-uri, douăzecișitrei r-uri, patru s-uri, opt ș-uri, nouă t-uri, douăzecișitrei u-uri, șase z-uri

> Șase a-uri, cinci ă-uri, un â, un b, unsprezece c-uri, trei d-uri, nouăsprezece e-uri, un f, un g, un h, treizecișiunu i-uri, un î, un j, un k, un l, un m, douăzecișitrei n-uri, șase o-uri, șapte p-uri, un q, douăzecișitrei r-uri, cinci s-uri, opt ș-uri, nouă t-uri, un ț, patruzeci u-uri, un v, un w, un x, un y, șapte z-uri

> Fraza aceasta include zece a-uri, opt ă-uri, unsprezece c-uri, șapte d-uri, douăzecișiunu e-uri, douăzecișinouă i-uri, șase n-uri, zece o-uri, șapte p-uri, douăzecișitrei r-uri, patru s-uri, opt ș-uri, nouă t-uri, treizeci u-uri, două f-uri, două l-uri și zece z-uri.

#### Swedish reflexicon

> Tre a:n, åtta e:n, fem f, två i:n, fyra m, tio n, tre o:n, fem r, två s, tretton t:n, fem v:n, två x, två y:n, sex å:n

### Future plans and endeavors

+ run benchmarks on a raspberry pi

+ try and fit this algorithm on an arduino uno; this would have hardware at more or less the
same computational power as a "typical" computer in the early 80s when Lee Sallows published his first results on autograms

+ use the GPU instead of threads; the prefixes would have to be embedded in one or more textures;
the logic on the GPU would be simpler and would explore more 'unpromising' space but the number of execution
units are much higher than on a CPU
