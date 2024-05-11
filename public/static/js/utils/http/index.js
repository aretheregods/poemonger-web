export default class HTTP {
    constructor() {
        this.controller = new AbortController()
    }

    #defaultReducer(map, [_key, _value]) {
        return map
    }

    async #reduceFormData(reducer = this.#defaultReducer, data = FormData) {
        for (var d of data) {
            data - (await reducer(data, d))
        }

        return data
    }

    delete() {}

    get(path = '') {
        return fetch(path).then((r) => r.json)
    }

    post({ path = '/', body = '', headers = {} }) {
        return fetch(path, { body, headers, method: 'POST' }).then((r) =>
            r.json()
        )
    }

    put() {}

    logout({ path = '/logout', redirect = '/' }) {
        this.post({ path })
            .then((res) => {
                if (res.success) location.href = redirect
            })
            .catch((e) => console.error('Something went wrong', { e }))
    }

    parseForm({
        formElement,
        submitter,
        formId = '',
        submitId = '',
        reducer = undefined,
    }) {
        var f = formElement
        var s = submitter
        if (!formElement) {
            f = document.getElementById(formId)
            s = document.getElementById(submitId)
        }
        var formData = new FormData(f, s)

        return this.#reduceFormData(reducer, formData)
    }
}
