import { OPERATION_TYPES, TEXT_PREFIX } from "./operationType/index.js";


const DATA_PREFIX_TEXT = "Extra Data";


export class DebugStickItem {
    constructor(item) {
        this.item = item;
        this.#setup();
    }

    #setup() {
        const [ typeName, data ] = this.item.getLore();
        if(!(typeName || data)) {
            const defaultType = OPERATION_TYPES[0];
            this.item.setLore([ "%" + defaultType.name, "" ]);
            this.#setData({});
        }
    }

    get operationType() {
        const [ type ] = this.item.getLore();
        const name = type.replace("%", "");
        return OPERATION_TYPES.find(o => o.name === name);
    }

    set operationType(type) {
        const [ oldTypeName, data ] = this.item.getLore();
        if(oldTypeName.endsWith(type.name)) return;

        this.item.setLore(["%" + type.name, data]);
    }

    #getData() {
        const [ , data ] = this.item.getLore();
        return JSON.parse(data.replaceAll("§", "").replace(DATA_PREFIX_TEXT, ""));
    }

    #setData(data) {
        const json = JSON.stringify(data);
        const [ type ] = this.item.getLore();
        this.item.setLore([
            type,
            DATA_PREFIX_TEXT + Array.from(json).map(t => "§" + t).join("")
        ]);
    }

    addValue(key, value) {
        const data = this.#getData();
        data[key] = value;
        this.#setData(data);
    }

    getValue(key) {
        const data = this.#getData();
        return data[key];
    }

    addPermutation({ id: blockID }, permutation) {
        const clonedPermutation = permutation.clone();
        const properties = permutation.getAllProperties()
            .map(({ name, value }) => ({ name, value }));

        this.addValue(blockID, properties);
    }

    getPermutation(block) {
        const properties = this.getValue(block.id);
        if(!properties) return;

        const permutation = block.type.createDefaultBlockPermutation();
        properties.forEach(({ name, value }) => {
            permutation.getProperty(name).value = value;
        });
        return permutation;
    }

    setToClient({ container, selectedSlot: slot }) {
        container.setItem(slot, this.item);
    }
}
