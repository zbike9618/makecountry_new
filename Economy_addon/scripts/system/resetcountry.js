import { world, system, CommandPermissionLevel } from "@minecraft/server";

const COUNTRY_LIST = "countries";
const PLAYER_COUNTRY = "playerCountry";

function safeSend(player, message) {
    try {
        player.sendMessage(message);
    } catch (e) {
        console.warn("メッセージ送信失敗:", e);
    }
}

system.beforeEvents.startup.subscribe(event => {
    event.customCommandRegistry.registerCommand(
        {
            name: "mc:resetcountry",
            description: "国データをリセットするコマンド (opタグ必須)",
            permissionLevel: CommandPermissionLevel.Any, // ← 誰でも実行できるようにしとく
            mandatoryParameters: [],
            optionalParameters: []
        },
        (origin, args) => {
            if (!origin?.sourceEntity) return;
            const player = origin.sourceEntity;

            // ✅ opタグがない人は弾く
            if (!player.hasTag("op")) {
                safeSend(player, "§cこのコマンドを実行する権限がありません。");
                return;
            }

            // 国データをリセット
            world.setDynamicProperty(COUNTRY_LIST, "[]");

            for (const p of world.getPlayers()) {
                p.setDynamicProperty(PLAYER_COUNTRY, undefined);
            }

            safeSend(player, "§aすべての国データをリセットしました。");
        }
    );
});
