import { world } from "@minecraft/server";
import { JOBS_CONFIG } from "../config/jobs_config.js";
world.afterEvents.playerBreakBlock.subscribe(ev => {
    const { player, brokenBlockPermutation } = ev;
    const blockId = brokenBlockPermutation.type.id;

    if (blockId === "minecraft:stone") {
        // 石を壊したら +1
        player.runCommand(`scoreboard players add @s money 1`);

        // 現在の残高を取得
        const score = world.scoreboard.getObjective("money").getScore(player);
        player.sendMessage(`§a石を壊したので 1 コイン獲得！ 所持金: ${score}`);
    }
});
