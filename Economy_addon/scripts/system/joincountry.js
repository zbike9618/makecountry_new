import * as server from "@minecraft/server";

const COUNTRY_LIST = "countries";
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
        name: "mc:joincountry",
        description: "国に参加するコマンド",
        permissionLevel: server.CommandPermissionLevel.Any,
        mandatoryParameters: [
            {
                name: "countryName",
                type: server.CustomCommandParamType.String
            }
        ]
    }, (origin, args) => {
        if (origin.sourceEntity?.typeId !== "minecraft:player") return;
        const player = origin.sourceEntity;
        const countryName = args.countryName;

        // プレイヤーが既に所属しているか確認
        const current = player.getDynamicProperty(PLAYER_COUNTRY);
        if (current) {
            safeSend(player, `あなたはすでに「${current}」に所属しています。`);
            return;
        }

        // 国リストを取得
        const list = server.world.getDynamicProperty(COUNTRY_LIST) || "[]";
        const countries = JSON.parse(list);

        if (!countries.find(c => c.name === countryName)) {
            safeSend(player, `国「${countryName}」は存在しません。`);
            return;
        }

        // 国に参加
        player.setDynamicProperty(PLAYER_COUNTRY, countryName);
        safeSend(player, `国「${countryName}」に参加しました！`);
    });
});
