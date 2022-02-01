import { ActionFormData } from "mojang-minecraft-ui";

import Base from "./base.js";


export default class Tap extends Base {
    id = "tap";

    #getNextIndex({ value, validValues }, reverse) {
        const index = validValues.indexOf(value);
        const nextIndex = reverse ? index - 1 : index + 1;

        if(nextIndex >= validValues.length) {
            return 0;
        } else if(nextIndex < 0) {
            return validValues.length - 1;
        }
        return nextIndex;
    }

    async doSetting(client, item, block) {
        const properties = block.permutation.getAllProperties();

        const form = new ActionFormData()
            .title("%operation.tap.settings.title")
            .body("%operation.tap.settings.description");
        properties.forEach(p => form.button(p.name));

        const { isCanceled, selection } = await form.show(client.player);
        if(isCanceled) return;

        const name = properties[selection].name;
        item.addValue(block.id, name);
        item.setToClient(client);
        client.send("operation.tap.settings.done", name);
    }

    doBlockStateChange(client, item, block) {
        const permutation = block.permutation.clone();
        const properties = permutation.getAllProperties();
        const name = item.getValue(block.id);
        const property = properties.find(p => p.name === name) ?? properties[0];
        if(!property) return;

        const nextIndex = this.#getNextIndex(property, client.player.isSneaking);
        property.value = property.validValues[nextIndex];
        block.setPermutation(permutation);
        client.show("operation.tap.property_changed", property.name, property.value);
    }
}
