import { ModalFormData } from "mojang-minecraft-ui";

import { isSequence } from "../lib/gametest-utility-lib.js";
import { send, show } from "../translate.js";
import Base from "./base.js";


export default class GUI extends Base {
    id = "gui";

    async doSetting(player, block) {
        const permutation = block.permutation.clone();
        const properties = permutation.getAllProperties();

        const form = new ModalFormData()
            .title("%operation.gui.settings.title");
        const current = this.getData(player, block) ?? permutation;
        properties.forEach(({ name, value, validValues }) => {
            const { value: currentValue } = current.getProperty(name);
            switch(typeof value) {
                case "boolean":
                    form.toggle(name, currentValue);
                    break;
                case "number":
                    if(isSequence(validValues)) {
                        form.slider(
                            name,
                            validValues[0],
                            validValues[validValues.length - 1],
                            1,
                            currentValue
                        );
                        break;
                    }
                case "string":
                    form.dropdown(
                        name,
                        validValues.map(String),
                        validValues.indexOf(currentValue)
                    );
                    break;
            }
        });
        
        const { isCanceled, formValues } = await form.show(player);
        if(isCanceled) return;

        formValues.forEach((value, i) => {
            const property = properties[i];
            if(typeof property.value === "string") {
                property.value = property.validValues[value];
                return;
            }
            property.value = value;
        });
        this.addData(player, block, permutation);
        send(player, "operation.gui.settings.done");
    }

    doBlockStateChange(player, block) {
        const permutation = this.getData(player, block);
        if(!permutation) return;

        block.setPermutation(permutation);
        show(player, "operation.gui.property_changed");
    }
}
