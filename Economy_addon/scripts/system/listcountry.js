import * as server from "@minecraft/server";

const COUNTRY_LIST = "countries";

function safeSend(player, message) {
    try {
        player.sendMessage(message);
    } catch (e) {
        console.warn("メッセージ送信失敗:", e);
    }
}

server.system.beforeEvents.startup.subscribe(ev => {
    ev.customCommandRegistry.registerCommand({
        name: "mc:listcountry",
        description: "国の一覧を表示するコマンド",
        permissionLevel: server.CommandPermissionLevel.Any
    }, (origin, args) => {
        if (origin.sourceEntity?.typeId !== "minecraft:player") return;
        const player = origin.sourceEntity;

        const list = server.world.getDynamicProperty(COUNTRY_LIST) || "[]";
        const countries = JSON.parse(list);

        if (countries.length === 0) {
            safeSend(player, "まだ国は存在しません。");
            return;
        }

        safeSend(player, "=== 国一覧 ===");
        countries.forEach(c => {
            safeSend(player, `- ${c.name} (平和主義: ${c.pacifist ? "はい" : "いいえ"})`);
        });
    });
});
