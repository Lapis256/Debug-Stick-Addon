import { RawTextBuilder } from "./lib/gametest-utility-lib.js";


export function send(player, translate, ..._with) {
    const rawText = new RawTextBuilder()
            .addTranslate(translate, ..._with.map(String))
            .buildJson();
        player.runCommand("tellraw @s " + rawText);
}

export function show(player, translate, ..._with) {
    const rawText = new RawTextBuilder()
            .addTranslate(translate, ..._with.map(String))
            .buildJson();
        player.runCommand("titleraw @s actionbar " + rawText);
}
