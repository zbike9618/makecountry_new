import { world } from "@minecraft/server";
import { JOBS_CONFIG } from "../config/jobs_config.js";
world.afterEvents.playerBreakBlock.subscribe(ev => {
    const { player, brokenBlockPermutation } = ev;
    const blockId = brokenBlockPermutation.type.id;

    if (blockId === "minecraft:stone") {
        // 石を壊したら +1
        player.runCommand(`scoreboard players add @s money 1`);
    }
});
