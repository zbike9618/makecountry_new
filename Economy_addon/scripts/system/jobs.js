import * as server from "@minecraft/server";
import { world , system , CommandPermissionLevel , CustomCommandStatus} from "@minecraft/server";
import * as ui from "@minecraft/server-ui";
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

    for (const jobId of ["miner", "lumberjack", "farmer", "netherdigger"]) { // ← 制限！
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

    for (const jobId of ["hunter"]) { // ← 制限！
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


//job form

function show_form(player){
    const form = new ui.ActionFormData();
    form.title("職業選択");
    form.button("狩人");
    form.button("農夫");
    form.button("鉱夫");
    form.button("木こり");
    form.button("ネザー掘り士");
    form.button("建築士");
    form.show(player).then((response) => {
    if (response.canceled) return;

    // 既存のjobタグを削除
    for (const jobId of Object.keys(JOB_CONFIG)) {
        player.removeTag(`job:${jobId}`);
    }

    switch(response.selection){
        case 0:
            player.addTag("job:hunter");
            player.sendMessage("§a職業: 狩人 に就きました！");
            break;
        case 1:
            player.addTag("job:farmer");
            player.sendMessage("§a職業: 農夫 に就きました！");
            break;
        case 2:
            player.addTag("job:miner");
            player.sendMessage("§a職業: 鉱夫 に就きました！");
            break;
        case 3:
            player.addTag("job:lumberjack");
            player.sendMessage("§a職業: 木こり に就きました！");
            break;
        case 4:
            player.addTag("job:netherdigger");
            player.sendMessage("§a職業: ネザー掘り士 に就きました！");
            break;
        case 5:
            player.addTag("job:builder");
            player.sendMessage("§a職業: 建築士 に就きました！");
            break;
    }

    }).catch(error =>
        player.sendMessage("An error occurred: " + error.message)
    );
}

server.system.beforeEvents.startup.subscribe(ev => {
    ev.customCommandRegistry.registerCommand({
        name:"mc:jobs",
        description:"職業を選択するコマンド",
        permissionLevel : server.CommandPermissionLevel.Any,
        mandatoryParameters:[
        ],
        optionalParameters:[
        ]
    },(origin, arg) => {
        if (origin.sourceEntity?.typeId === "minecraft:player") {
            let player = origin.sourceEntity;
            system.run(() => {  // 1tick後に安全に実行
                show_form(player);
            });
        }
    });
});