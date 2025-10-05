import * as server from "@minecraft/server";
import { world } from "@minecraft/server";
import * as ui from "@minecraft/server-ui";

const COUNTRY_LIST = "countries";
const PLAYER_COUNTRY = "playerCountry";

function safeSend(player, message) {
    try {
        player.sendMessage(message);
    } catch (e) {
        console.warn("メッセージ送信失敗:", e);
    }
}

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

        const playerStore = player.getDynamicProperty(PLAYER_COUNTRY);
        if (playerStore) {
            safeSend(player, "すでに国に所属しているため建国できません。");
            return;
        }

        const list = world.getDynamicProperty(COUNTRY_LIST) || "[]";
        const countries = JSON.parse(list);

        if (countries.find(c => c.name === countryName)) {
            safeSend(player, `国「${countryName}」はすでに存在します。`);
            return;
        }

        // 国追加
        countries.push({ name: countryName, pacifist });
        world.setDynamicProperty(COUNTRY_LIST, JSON.stringify(countries));

        // プレイヤーを国に参加
        player.setDynamicProperty(PLAYER_COUNTRY, countryName);

        // 国王タグを付与
        // 国作成時、国王本人に所属国を設定
        player.setDynamicProperty("country", countryName);
        player.addTag("king");


        safeSend(player, `国「${countryName}」を建国しました！ あなたは国王です。`);
    });
}

server.system.beforeEvents.startup.subscribe(ev => {
    ev.customCommandRegistry.registerCommand({
        name: "mc:makecountry",
        description: "国を作成するコマンド",
        permissionLevel: server.CommandPermissionLevel.Any
    }, (origin, arg) => {
        if (origin.sourceEntity?.typeId === "minecraft:player") {
            let player = origin.sourceEntity;
            server.system.run(() => {
                show_form(player);
            });
        }
    });
});
