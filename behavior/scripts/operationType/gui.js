import { ModalFormData } from "mojang-minecraft-ui";

import { isSequence, pprint } from "../lib/gametest-utility-lib.js";
import Base from "./base.js";


export default class GUI extends Base {
    id = "gui";

    async doSetting(client, item, block) {
        const permutation = block.permutation.clone();
        const properties = permutation.getAllProperties();

        const form = new ModalFormData()
            .title("%operation.gui.settings.title");
        const currentPermutation = item.getPermutation(block) ?? permutation;
        properties.forEach(({ name, value, validValues }) => {
            const { value: currentValue } = currentPermutation.getProperty(name);
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
        
        const { isCanceled, formValues } = await form.show(client.player);
        if(isCanceled) return;

        formValues.forEach((value, i) => {
            const property = properties[i];
            if(typeof property.value === "string") {
                property.value = property.validValues[value];
                return;
            }
            property.value = value;
        });
        item.addPermutation(block, permutation);
        item.setToClient(client);
        client.send("operation.gui.settings.done");
    }

    doBlockStateChange(client, item, block) {
        const permutation = item.getPermutation(block);
        if(!permutation) return;

        block.setPermutation(permutation);
        client.show("operation.gui.property_changed");
    }
}
