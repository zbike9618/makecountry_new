import * as server from "@minecraft/server";
import { world , system } from "@minecraft/server";

server.system.beforeEvents.startup.subscribe(ev => {
    ev.customCommandRegistry.registerCommand({
        name:"mc:money",
        description:"お金を確認するコマンド",
        permissionLevel : server.CommandPermissionLevel.Any,
        mandatoryParameters:[],
        optionalParameters:[]
    },(origin, arg) => {
        if (origin.sourceEntity?.typeId === "minecraft:player") {
            let player = origin.sourceEntity;
            system.run(() => {  // 1tick後に安全に実行
                const objective = world.scoreboard.getObjective("money");
                if (!objective) {
                    player.sendMessage("§cスコアボード 'money' が存在しません。");
                    return;
                }

                const score = objective.getScore(player) ?? 0;
                player.sendMessage(`§eあなたの所持金: §a${score} コイン`);
            });
        }
    });
});
