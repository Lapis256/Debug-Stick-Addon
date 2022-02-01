import { world } from "mojang-minecraft";
import { ActionFormData, MessageFormData } from "mojang-minecraft-ui";

import { Gamemode } from "./lib/gametest-utility-lib.js";
import { OPERATION_TYPES } from "./operationType/index.js";
import { INPUT_TYPES } from "./inputType.js";
import { DebugStickItem } from "./debugStickItem.js";
import { Client } from "./client.js";


const OPERATION_TYPE_TAG_NAMESPACE = "debug_stick_operation_type:";
const INPUT_TYPE_TAG_NAMESPACE = "debug_stick_input_type:";


export default class DebugStick {
    #operationTypes = [];
    #itemID;

    constructor(itemID) {
        this.#itemID = itemID;

        this.#subscribeEvents();
    }

    async #openSettings(client, item) {
        const { isCanceled, selection } = await (new MessageFormData()
            .title("%settings.title")
            .button1("%settings.operation.title")
            .button2("%settings.input.title")
            .body("%settings.description")
            .show(client.player));
        if(isCanceled) return;

        if(selection === 1) {
            await this.#operationTypeSetting(client, item);
            return;
        }
        await this.#inputTypeSetting(client);
    }

    async #inputTypeSetting(client) {
        const { isCanceled, selection } = await (new MessageFormData()
            .title("%settings.input.title")
            .body("%settings.input.description")
            .button1("%settings.input.tap")
            .button2("%settings.input.others")
            .show(client.player));
        if(isCanceled) return;

        if(selection === 1) {
            client.inputType = INPUT_TYPES.tap;
            return;
        }
        client.inputType = INPUT_TYPES.others;
    }

    async #operationTypeSetting(client, item) {
        const descriptionTexts = [
            "%settings.operation.description\n"
        ];

        const form = new ActionFormData()
            .title("%settings.operation.title");
        OPERATION_TYPES.forEach(({ name, description }) => {
            descriptionTexts.push(`%${name}: %${description}`);
            form.button("%" + name);
        });

        const description = descriptionTexts.join("\n");
        form.body(
            `${description}\n\n%settings.operation.current: "%${item.operationType.name}"\n\n`
        );

        const { isCanceled, selection } = await form.show(client.player);
        if(isCanceled) return;

        item.operationType = OPERATION_TYPES[selection];
        item.setToClient(client);
    }

    #itemUseEventHandler({ item, source: player }) {
        const client = new Client(player);
        const debugItem = new DebugStickItem(item);
        const block = client.getLookingBlock();
        if(!block) {
            this.#openSettings(client, debugItem).catch(console.error);
            return;
        }
        if(!(client.isTap || player.isSneaking)) return;

        const properties = block.permutation.getAllProperties();
        if(properties.length === 0) {
            client.send("common.property_not_found");
            return;
        }
        debugItem.operationType.doSetting(client, debugItem, block)
            .catch(console.error);
    }

    #itemUseOnEventHandler({ item, blockLocation, source: player }) {
        const client = new Client(player);
        if(!client.isTap && player.isSneaking) return;

        const block = player.dimension.getBlock(blockLocation);
        const debugItem = new DebugStickItem(item);
        debugItem.operationType.doBlockStateChange(client, debugItem, block);
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
