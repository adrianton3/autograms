(() => {
    'use strict'

    function setupElements (options) {
        const elements = {}

        elements.language = document.getElementById('language')

        Object.keys(options.languages).forEach((language) => {
            const option = document.createElement('option')
            option.textContent = language

            elements.language.appendChild(option)
        })

        elements.optionAutogram = document.getElementById('option-autogram')
        elements.optionReflexicon = document.getElementById('option-reflexicon')

        elements.prefixLength = document.getElementById('prefix-length')
        elements.fudgeStart = document.getElementById('fudge-start')

        elements.fudgeTimeMin = document.getElementById('fudge-time-min')
        elements.fudgeTimeMin.addEventListener('change', () => {
            options.handleFudgeTimeChange(Number(elements.fudgeTimeMin.value) * 1000)
        })

        elements.threadCountMax = document.getElementById('thread-count-max')
        elements.threadCountMax.addEventListener('change', () => {
            options.handleThreadCountChange(Number(elements.threadCountMax.value))
        })

        elements.partialsIndex = document.getElementById('partials-index')
        elements.partialsCount = document.getElementById('partials-count')
        elements.estimatedTime = document.getElementById('estimated-time')

        elements.run = document.getElementById('run')
        elements.run.addEventListener('click', () => {
            options.handleRun()
        })

        elements.info = document.getElementById('info')
        elements.info.addEventListener('click', () => {
            options.handleInfo()
        })

        elements.outLog = document.getElementById('out-log')
        elements.outSolutions = document.getElementById('out-solutions')
        elements.outStatus = document.getElementById('out-status')

        return elements
    }

    function Ui (options) {
        this.elements = setupElements(options)
    }

    Ui.prototype.getParameters = function () {
		const language = this.elements.language.value

		const startStrings = (() => {
			if (this.elements.optionAutogram.checked) {
				return auto.languages[language].intros.flatMap((intro) =>
					auto.languages[language].lastSeparators.map((lastSeparator) =>
						`${intro} ${lastSeparator}`
					)
				)
			}

			return ['']
		})()

		return {
			language,
			options: {
				count: 'max',
			},
            fudge: Number(this.elements.fudgeStart.value),
			prefix: null,
			startStrings,
			prefixLength: Number(this.elements.prefixLength.value),
		}
    }

    function setLock (elements, value) {
        elements.language.disabled = value

        elements.optionAutogram.disabled = value
        elements.optionReflexicon.disabled = value

        elements.fudgeStart.disabled = value
        elements.prefixLength.disabled = value

        elements.run.disabled = value
        elements.info.disabled = value
    }

    Ui.prototype.lock = function () {
        setLock(this.elements, true)
    }

    Ui.prototype.unlock = function () {
        setLock(this.elements, false)
    }

    Ui.prototype.setPartialsCount = function (value) {
        this.elements.partialsCount.textContent = String(value)
    }

    Ui.prototype.setPartialsIndex = function (value) {
        this.elements.partialsIndex.textContent = String(value)
    }

    Ui.prototype.setEstimatedTime = function (value) {
        this.elements.estimatedTime.textContent = String(stringifyTime(value))
    }

    Ui.prototype.postLog = function (data) {
        this.elements.outLog.value += `${data}\n`
    }

    Ui.prototype.postSolution = function (count, inflated, deltaTime) {
        this.elements.outSolutions.value += `solution: ${count}\ntime: ${stringifyTime(deltaTime)}\n"${inflated}"\n\n`
    }

    Ui.prototype.postThreads = function (threads) {
        this.elements.outStatus.value = threads.map(
            (status, index) =>
                status.state === 'busy'
                    ? `thread ${index}: ${status.state} [${status.prefix.join(' ')}] ${status.fudge}`
                    : `thread ${index}: ${status.state}`
        ).join('\n')
    }

    Ui.prototype.clear = function () {
        this.elements.outLog.value = ''
        this.elements.outSolutions.value = ''
        this.elements.outStatus.value = ''
    }

    Ui.prototype.getRuntimeParameters = function () {
        return {
            threadCountMax: Number(this.elements.threadCountMax.value),
            fudgeTimeMin: Number(this.elements.fudgeTimeMin.value) * 1000,
        }
    }

	function stringifyTime (ms) {
		return ms >= 1000 * 60 * 60 ? `${(ms / (1000 * 60 * 60)).toFixed(1)} h`
			: ms >= 1000 * 60 ? `${(ms / (1000 * 60)).toFixed(1)} m`
			: ms >= 1000 ? `${(ms / 1000).toFixed(1)} s`
			: `${ms.toFixed(1)} ms`
    }

    Object.assign(window.auto, {
        Ui,
        stringifyTime,
	})
})()
