import TEXT_PREFIX from "./prefix.js";


export default class Base {
    id;

    get name() {
        return TEXT_PREFIX + this.id;
    }

    get description() {
        return `${TEXT_PREFIX}${this.id}.description`;
    }

    #data = {};

    addData({ name } /* player */, { id } /* block */, data) {
        if(!this.#data[name]) {
            this.#data[name] = {};
        }
        this.#data[name][id] = data;
    }

    getData({ name } /* player */, { id } /* block */) {
        return this.#data[name]?.[id];
    }

    async doSetting(player, block) {
        throw "Must be overridden.";
    }

    doBlockStateChange(player, block) {
        throw "Must be overridden.";
    }
}
