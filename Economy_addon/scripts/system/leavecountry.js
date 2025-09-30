import * as server from "@minecraft/server";

const PLAYER_COUNTRY = "playerCountry";

function safeSend(player, message) {
    try {
        player.sendMessage(message);
    } catch (e) {
        console.warn("メッセージ送信失敗:", e);
    }
}

server.system.beforeEvents.startup.subscribe(ev => {
    ev.customCommandRegistry.registerCommand({
        name: "mc:leavecountry",
        description: "所属している国から離脱するコマンド",
        permissionLevel: server.CommandPermissionLevel.Any
    }, (origin, args) => {
        if (origin.sourceEntity?.typeId !== "minecraft:player") return;
        const player = origin.sourceEntity;

        const current = player.getDynamicProperty(PLAYER_COUNTRY);
        if (!current) {
            safeSend(player, "あなたはどの国にも所属していません。");
            return;
        }

        player.setDynamicProperty(PLAYER_COUNTRY, undefined);
        safeSend(player, `国「${current}」から離脱しました。`);
    });
});
