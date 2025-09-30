import * as server from "@minecraft/server";
import { world, system } from "@minecraft/server";
import * as ui from "@minecraft/server-ui";

const COUNTRY_LIST = "countries";
const PLAYER_COUNTRY = "playerCountry";

// 安全にメッセージ送信
function safeSend(player, message) {
    try {
        player.sendMessage(message);
    } catch (e) {
        console.warn("メッセージ送信失敗:", e);
    }
}

// 国一覧UI
function showCountryUI(player) {
    const form = new ui.ActionFormData();
    form.title("国一覧");

    // 国リストをDynamicPropertyから取得
    const list = world.getDynamicProperty(COUNTRY_LIST) || "[]";
    const countries = JSON.parse(list);

    // プレイヤーの所属国を取得
    const currentCountry = player.getDynamicProperty(PLAYER_COUNTRY);

    for (const c of countries) {
        const label = c.pacifist
            ? `${c.name} [平和主義]`
            : `${c.name} [非平和主義]`;

        if (currentCountry === c.name) {
            form.button(`§a${label}（所属中）`);
        } else {
            form.button(label);
        }
    }

    form.show(player).then(response => {
        if (response.canceled) return;

        const selected = countries[response.selection];
        if (!selected) return;

        const label = selected.pacifist
            ? `${selected.name} [平和主義]`
            : `${selected.name} [非平和主義]`;

        // サブメニュー（参加 / 離脱）
        const confirm = new ui.ActionFormData();
        confirm.title(label);

        if (currentCountry === selected.name) {
            confirm.body(`あなたは現在「${label}」に所属しています。\nどうしますか？`);
            confirm.button("§c離脱する");
            confirm.button("§7キャンセル");

            confirm.show(player).then(r => {
                if (r.selection === 0) {
                    player.setDynamicProperty(PLAYER_COUNTRY, undefined);
                    safeSend(player, `§e国「${label}」を離脱しました`);
                }
            });
        } else {
            confirm.body(`国「${label}」を選択しました。\nどうしますか？`);
            confirm.button("§a参加する");
            confirm.button("§7キャンセル");

            confirm.show(player).then(r => {
                if (r.selection === 0) {
                    player.setDynamicProperty(PLAYER_COUNTRY, selected.name);
                    safeSend(player, `§a国「${label}」に参加しました！`);
                }
            });
        }
    });
}

// スラッシュコマンド登録
server.system.beforeEvents.startup.subscribe(ev => {
    ev.customCommandRegistry.registerCommand({
        name: "mc:country",
        description: "国一覧を表示する",
        permissionLevel: server.CommandPermissionLevel.Any,
    }, (origin, args) => {
        const player = origin.sourceEntity;
        if (player?.typeId === "minecraft:player") {
            system.run(() => showCountryUI(player));
        }
    });
});
