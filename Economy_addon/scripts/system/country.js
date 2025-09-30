import * as server from "@minecraft/server";
import {world} from "@minecraft/server";
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

// フォーム表示
function show_form(player) {
    const form = new ui.ModalFormData();
    form.title("国作成");
    form.textField("国名", "例: 日本");
    form.toggle("平和主義");

    form.show(player).then(response => {
        if (response.canceled) {
            safeSend(player, "キャンセルされました");
            return;
        }

        const countryName = String(response.formValues[0]).trim();
        const pacifist = Boolean(response.formValues[1]);

        if (!countryName) {
            safeSend(player, "国名を入力してください！");
            return;
        }

        // プレイヤーが既に国に所属しているか確認
        const playerStore = player.getDynamicProperty(PLAYER_COUNTRY);
        if (playerStore) {
            safeSend(player, "すでに国に所属しているため建国できません。");
            return;
        }

        // 既存の国リストを取得
        const list = world.getDynamicProperty(COUNTRY_LIST) || "[]";
        const countries = JSON.parse(list);

        if (countries.find(c => c.name === countryName)) {
            safeSend(player, `国「${countryName}」はすでに存在します。`);
            return;
        }

        // 国を追加
        countries.push({ name: countryName, pacifist });
        world.setDynamicProperty(COUNTRY_LIST, JSON.stringify(countries));

        // プレイヤーをその国に参加させる
        player.setDynamicProperty(PLAYER_COUNTRY, countryName);

        safeSend(player, `国「${countryName}」を建国しました！`);
    });
}

// スタートアップイベント
server.system.beforeEvents.startup.subscribe(ev => {
    ev.customCommandRegistry.registerCommand({
        name: "mc:makecountry",
        description: "国を作成するコマンド",
        permissionLevel: server.CommandPermissionLevel.Any
        // mandatoryParameters / optionalParameters は削除
    }, (origin, arg) => {
        if (origin.sourceEntity?.typeId === "minecraft:player") {
            let player = origin.sourceEntity;
            server.system.run(() => {
                show_form(player);
            });
        }
    });
});
