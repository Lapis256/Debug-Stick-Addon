export default class Base {
    id;

    get name() {
        return `operation.${this.id}.name`;
    }

    get description() {
        return `operation.${this.id}.description`;
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
