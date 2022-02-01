import { BlockRaycastOptions, RawTextBuilder } from "./lib/gametest-utility-lib.js";
import { INPUT_TYPE_TAG_NAMESPACE, INPUT_TYPES } from "./inputType.js";


export class Client {
    constructor(player) {
        this.player = player;
    }

    getTagsWithPrefix(prefix) {
        const tags = this.player.getTags();
        return tags.filter(t => t.startsWith(prefix));
    }

    getTagWithPrefix(prefix) {
        return this.getTagsWithPrefix(prefix)[0];
    }

    get container() {
        const { container } = this.player.getComponent("inventory");
        return container;
    }

    get selectedSlot() {
        return this.player.selectedSlot;
    }

    get inputType() {
        const typeTag = this.getTagWithPrefix(INPUT_TYPE_TAG_NAMESPACE);
        if(!typeTag) {
            const type = INPUT_TYPES.tap;
            this.player.addTag(type.tag);
            return type;
        }
        const typeID = typeTag.replace(INPUT_TYPE_TAG_NAMESPACE, "");
        return INPUT_TYPES[typeID];
    }

    set inputType(type) {
        this.player.removeTag(this.inputType.tag);
        this.player.addTag(type.tag);
    }

    getLookingBlock() {
        const option = new BlockRaycastOptions({
            includeLiquidBlocks: true,
            includePassableBlocks: true,
            maxDistance: 12
        });
        return this.player.getBlockFromViewVector(option);
    }

    get isTap() {
        return this.inputType.id === INPUT_TYPES.tap.id;
    }

    send(translate, ..._with) {
        const rawText = new RawTextBuilder()
            .addTranslate(translate, ..._with.map(String))
            .buildJson();
        this.player.runCommand("tellraw @s " + rawText);
    }

    show(translate, ..._with) {
        const rawText = new RawTextBuilder()
            .addTranslate(translate, ..._with.map(String))
            .buildJson();
        this.player.runCommand("titleraw @s actionbar " + rawText);
    }
}