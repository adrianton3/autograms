'use strict'

const { execFileSync } = require('child_process')
const fs = require('fs')
const path = require('path')
const os = require('os')

const {
    generateCommon,
    generateBrute,
    generatePartial,
} = require('./src/generator')

function expand (source, map) {
    return source.replace(/\/\*\$(\w+)\*\//g, (match, name) => {
        if (map.hasOwnProperty(name)) {
            return map[name]
        } else {
            return match
        }
    })
}

const languages = {
    english: require('./languages/english'),
    french: require('./languages/french'),
    italian: require('./languages/italian'),
    latin: require('./languages/latin'),
    romanian: require('./languages/romanian'),
}

const parameters = {
    language: process.argv.length > 2 ? process.argv[2] : 'romanian',
    startStrings: [],
    fudge: process.argv.length > 3 ? Number(process.argv[3]) : 10,
    prefixLength: 5,
    threadCount: os.cpus().length,
}

const common = generateCommon(
    languages[parameters.language].alphabet,
    languages[parameters.language].numerals,
    parameters.startStrings,
    parameters.fudge,
)

const brute = generateBrute(
    languages[parameters.language].alphabet,
    languages[parameters.language].numerals,
    parameters.startStrings,
    parameters.fudge,
)

const partial = generatePartial(
    languages[parameters.language].alphabet,
    languages[parameters.language].numerals,
    parameters.startStrings,
    parameters.fudge,
    parameters.prefixLength,
)

const template = fs.readFileSync(path.join(__dirname, 'static/template-multi.cpp'), 'utf-8')

const source = expand(template, {
    prefixLength: parameters.prefixLength,
    common,
    brute,
    partial,
    threadCount: parameters.threadCount,
})

fs.writeFileSync(path.join(__dirname, 'runner.cpp'), source)

execFileSync('clang++', ['./runner.cpp', '-std=c++17', '-O3'])
