import { ModalFormData } from "mojang-minecraft-ui";

import Base from "./base.js";


export default class Duplicate extends Base {
    id = "duplicate";

    async doSetting(client, item, block) {
        item.addPermutation(block, block.permutation);
        item.setToClient(client);
        client.send("operation.duplicate.settings.done");
    }

    doBlockStateChange(client, item, block) {
        const permutation = item.getPermutation(block);
        if(!permutation) return;

        block.setPermutation(permutation);
        client.show("operation.duplicate.property_changed");
    }
}
