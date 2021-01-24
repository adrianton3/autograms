'use strict'

const { execFileSync } = require('child_process')
const fs = require('fs')
const path = require('path')
const os = require('os')

const {
    generateCommon,
    generateBrute,
    generatePartial,
    generateMain,
} = require('./src/generator')

const languages = {
    english: require('./languages/english'),
    french: require('./languages/french'),
    italian: require('./languages/italian'),
    latin: require('./languages/latin'),
    romanian: require('./languages/romanian'),
}

const parameters = {
    language: process.argv.length > 2 ? process.argv[2] : 'romanian',
    options: { count: 'max' },
    startStrings: [''],
    fudge: process.argv.length > 3 ? Number(process.argv[3]) : 11,
}

const common = generateCommon(
    languages[parameters.language].alphabet,
    languages[parameters.language].numerals,
    parameters.options,
    parameters.startStrings,
)

const brute = generateBrute(
    languages[parameters.language].alphabet,
    languages[parameters.language].numerals,
    parameters.options,
    parameters.startStrings,
    parameters.fudge,
)

const partial = generatePartial(
    languages[parameters.language].alphabet,
    languages[parameters.language].numerals,
    parameters.options,
    parameters.startStrings,
)

const main = generateMain({
    prefixLength: 5,
    threadCount: os.cpus().length,
})

const parts = [
    fs.readFileSync(path.join(__dirname, 'static/part-1.cpp'), 'utf-8'),
    fs.readFileSync(path.join(__dirname, 'static/part-2.cpp'), 'utf-8'),
]

fs.writeFileSync(
    path.join(__dirname, 'runner.cpp'),
    [parts[0], common, brute, partial, parts[1], main].join(`\n\n// ${'='.repeat(76)}\n\n`),
)

execFileSync('clang++', ['./runner.cpp', '-std=c++17', '-O3'])
