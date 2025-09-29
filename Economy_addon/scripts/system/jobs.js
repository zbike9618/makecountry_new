import { world } from "@minecraft/server";
import { JOB_CONFIG } from "../config/jobs_config.js";

/**
 * スコアボードにmoneyが無ければ作成
 */
try {
    world.getDimension("overworld").runCommand("scoreboard objectives add money dummy Money");
} catch {}

/**
 * ブロック破壊時の処理
 */
world.afterEvents.playerBreakBlock.subscribe(ev => {
    const { player, brokenBlockPermutation } = ev;
    const blockId = brokenBlockPermutation.type.id;

    for (const jobId in JOB_CONFIG) {
        if (!player.hasTag(`job:${jobId}`)) continue;

        const job = JOB_CONFIG[jobId];
        if (!job.blockRewards) continue;

        const reward = job.blockRewards[blockId];
        if (reward !== undefined) {
            player.runCommand(`scoreboard players add @s money ${reward}`);
            const score = world.scoreboard.getObjective("money").getScore(player);
            player.sendMessage(`§a${job.name}として ${blockId} を壊して ${reward} コイン獲得！ 残高: ${score}`);
        }
    }
});

/**
 * ブロック設置時の処理
 * → 建築者(builder)と農夫(farmer)のみ
 */
world.afterEvents.playerPlaceBlock.subscribe(ev => {
    const { player, block } = ev;
    const blockId = block.typeId;

    for (const jobId of ["builder", "farmer"]) { // ← 制限！
        if (!player.hasTag(`job:${jobId}`)) continue;

        const job = JOB_CONFIG[jobId];
        if (!job.blockRewards) continue;

        const reward = job.blockRewards[blockId];
        if (reward !== undefined) {
            player.runCommand(`scoreboard players add @s money ${reward}`);
            const score = world.scoreboard.getObjective("money").getScore(player);
            player.sendMessage(`§a${job.name}として ${blockId} を設置して ${reward} コイン獲得！ 残高: ${score}`);
        }
    }
});

/**
 * Mob討伐時の処理
 */
world.afterEvents.entityDie.subscribe(ev => {
    const { deadEntity, damageSource } = ev;
    const killer = damageSource?.damagingEntity;
    if (!killer) return;

    const mobId = deadEntity.typeId;

    for (const jobId in JOB_CONFIG) {
        if (!killer.hasTag(`job:${jobId}`)) continue;

        const job = JOB_CONFIG[jobId];
        if (!job.mobRewards) continue;

        const reward = job.mobRewards[mobId];
        if (reward !== undefined) {
            killer.runCommand(`scoreboard players add @s money ${reward}`);
            const score = world.scoreboard.getObjective("money").getScore(killer);
            killer.sendMessage(`§a${job.name}として ${mobId} を倒して ${reward} コイン獲得！ 残高: ${score}`);
        }
    }
});

/**
 * 釣り報酬（全て固定額）
 */
world.afterEvents.itemCompleteUse.subscribe(ev => {
    const { source: player, itemStack } = ev;
    if (!player || !itemStack) return;

    if (!player.hasTag("job:fisherman")) return;

    // 釣れたら固定で 10 コイン
    const reward = 10;
    player.runCommand(`scoreboard players add @s money ${reward}`);
    const score = world.scoreboard.getObjective("money").getScore(player);
    player.sendMessage(`§a漁師として魚を釣って ${reward} コイン獲得！ 残高: ${score}`);
});
