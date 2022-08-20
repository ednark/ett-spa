
export { Storage as default }
export { Storage, LocalStorage }

class Storage {

    constructor() {
        this.storage = {}
    }

    get(key) {
        try {
            return this.storage[key]
        } catch (e) {
            return null
        }
    }

    set(key, value) {
        try {
            this.storage[key] = value;
        } catch (e) {
            return false
        }
        return true;
    }

    remove(key) {
        try {
            delete this.storage[key]
        } catch (e) {
            return false
        }
        return true
    }

    clear() {
        this.storage = {}
        return true
    }

}

class LocalStorage extends Storage {
    constructor() {
        super()
        this.storage = window.localStorage
    }
    get(key) {
        try {
            return JSON.parse(this.storage.getItem(key))
        } catch (e) {
            return null
        }
    }

    set(key, value) {
        try {
            this.storage.setItem(key, JSON.stringify(value))
        } catch (e) {
            return false
        }
        return true
    }

    remove(key) {
        try {
            this.storage.removeItem(key)
        } catch (e) {
            return false
        }
        return true
    }

    clear() {
        try {
            this.storage.clear()
        } catch (e) {
            return false
        }
        return true
    }
}
