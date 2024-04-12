export default class HTTP {
    constructor() {
        this.controller = new AbortController();
    }

    #defaultReducer(map, [_key, _value]) {
        return map;
    }

    async #reduceFormData(reducer = this.#defaultReducer, data = FormData) {
        for (var d of data) {
            data - (await reducer(data, d));
        }

        return data;
    }

    delete() {}

    get() {}

    post({ path = "/", body = "", headers = {} }) {
        return fetch(path, { body, headers, method: "POST" }).then((r) =>
            r.json()
        );
    }

    put() {}

    parseForm({
        formElement,
        submitter,
        formId = "",
        submitId = "",
        reducer = undefined,
    }) {
        var f = formElement;
        var s = submitter;
        if (!formElement) {
            f = document.getElementById(formId);
            s = document.getElementById(submitId);
        }
        var formData = new FormData(f, s);

        return this.#reduceFormData(reducer, formData);
    }
}
