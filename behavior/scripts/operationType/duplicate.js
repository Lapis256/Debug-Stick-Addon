import { ModalFormData } from "mojang-minecraft-ui";

import { send, show } from "../translate.js";
import Base from "./base.js";


export default class Duplicate extends Base {
    id = "duplicate";

    async doSetting(player, block) {
        const permutation = block.permutation.clone();
        this.addData(player, block, permutation);
        send(player, "operation.duplicate.settings.done");
    }

    doBlockStateChange(player, block) {
        const permutation = this.getData(player, block);
        if(!permutation) return;

        block.setPermutation(permutation);
        show(player, "operation.duplicate.property_changed");
    }
}
