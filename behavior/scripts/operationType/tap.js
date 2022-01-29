import { ActionFormData } from "mojang-minecraft-ui";

import { send, show } from "../translate.js";
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

    async doSetting(player, block) {
        const properties = block.permutation.getAllProperties();

        const form = new ActionFormData()
            .title("%operation.tap.settings.title")
            .body("%operation.tap.settings.description");
        properties.forEach(p => form.button(p.name));

        const { isCanceled, selection } = await form.show(player);
        if(isCanceled) return;

        const name = properties[selection].name;
        this.addData(player, block, name);
        send(player, "operation.tap.settings.done", name);
    }

    doBlockStateChange(player, block) {
        const permutation = block.permutation.clone();
        const properties = permutation.getAllProperties();
        const name = this.getData(player, block);
        const property = properties.find(p => p.name === name) ?? properties[0];
        if(!property) return;

        const nextIndex = this.#getNextIndex(property, player.isSneaking);
        property.value = property.validValues[nextIndex];
        block.setPermutation(permutation);
        show(player, "operation.tap.property_changed", property.name, property.value);
    }
}
