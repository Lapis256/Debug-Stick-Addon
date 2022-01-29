import { world } from "mojang-minecraft";
import { ActionFormData } from "mojang-minecraft-ui";

import { Gamemode, BlockRaycastOptions } from "./lib/gametest-utility-lib.js";
import { send } from "./translate.js";


const TAG_NAMESPACE = "debug_stick_operation_type:";


export default class DebugStick {
    #operationTypes = [];
    #itemID;

    constructor(itemID) {
        this.#itemID = itemID;

        this.#subscribeEvents();
    }

    registerOperationType(operationType) {
        if(this.#operationTypes.find(t => t.id === operationType.id)) {
            throw "An operationType with the same name already exists.";
        }

        this.#operationTypes.push(operationType);
    }

    #getLookingBlock(player) {
        const option = new BlockRaycastOptions({
            includeLiquidBlocks: true,
            includePassableBlocks: true,
            maxDistance: 12
        });
        return player.getBlockFromViewVector(option);
    }

    #getOperationTypeID(player) {
        const typeTag = player.getTags().find(t => t.startsWith(TAG_NAMESPACE));
        if(!typeTag) {
            const id = this.#operationTypes[0].id;
            player.addTag(TAG_NAMESPACE + id);
            return id;
        }
        return typeTag.replace(TAG_NAMESPACE, "");
    }

    #getOperationType(player) {
        const id = this.#getOperationTypeID(player);
        return this.#operationTypes.find(t => t.id === id);
    }

    async #changeOperationType(player) {
        const descriptionTexts = [
            "%settings.operation.description\n"
        ];

        const form = new ActionFormData()
            .title("%settings.operation.title");
        this.#operationTypes.forEach(({ name, description }) => {
            descriptionTexts.push(`%${name}: %${description}`);
            form.button(name);
        });
        const currentType = this.#getOperationType(player);
        const description = descriptionTexts.join("\n");
        form.body(
            `${description}\n\n%settings.operation.current: "%${currentType.name}"\n\n`
        );

        const { isCanceled, selection } = await form.show(player);
        if(isCanceled) return;

        const type = this.#operationTypes[selection];
        player.removeTag(TAG_NAMESPACE + currentType.id);
        player.addTag(TAG_NAMESPACE + type.id);
    }

    #itemUseEventHandler({ source: player }) {
        const block = this.#getLookingBlock(player);
        if(!block) {
            this.#changeOperationType(player).catch(console.error);
            return;
        }
        const properties = block.permutation.getAllProperties();
        if(properties.length === 0) {
            send(player, "common.property_not_found");
            return;
        }
        const type = this.#getOperationType(player);
        type.doSetting(player, block).catch(console.error);
    }

    #itemUseOnEventHandler({ blockLocation, source: player }) {
        const block = player.dimension.getBlock(blockLocation);
        const type = this.#getOperationType(player);
        type.doBlockStateChange(player, block);
    }

    #eventCheckWrapper(handler) {
        return (ev) => {
            if(Gamemode.isCreative(ev.source) && ev.item.id === this.#itemID) {
                ev.cancel = true;
                handler.call(this, ev);
            }
        }
    }

    #subscribeEvents() {
        world.events.beforeItemUse.subscribe(
            this.#eventCheckWrapper(this.#itemUseEventHandler)
        );
        world.events.beforeItemUseOn.subscribe(
            this.#eventCheckWrapper(this.#itemUseOnEventHandler)
        );
    }
}
