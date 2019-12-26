(() => {
    'use strict'

    function save (data) {
        try {
            localStorage.setItem('state', JSON.stringify(data))
        } catch {
            console.warn('could not save state to local storage')
        }
    }

    function load () {
        try {
            return JSON.parse(localStorage.getItem('state'))
        } catch {
            console.warn('could not load state from local storage')
        }
    }

    Object.assign(window.auto, {
        persist: {
            save,
            load,
        },
	})
})()