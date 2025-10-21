import * as server from "@minecraft/server";
import { world, system } from "@minecraft/server";
import * as ui from "@minecraft/server-ui";

// 定数
const COUNTRY_LIST = "countries";
const PLAYER_COUNTRY = "playerCountry";

// ====== JSONデータ管理ユーティリティ ======
function GetAndParsePropertyData(id) {
    const data = world.getDynamicProperty(id);
    if (!data || typeof data !== "string") return [];
    try {
        return JSON.parse(data);
    } catch (e) {
        console.warn(`[Country] JSON parse error for ${id}:`, e);
        return [];
    }
}

function StringifyAndSavePropertyData(id, data) {
    try {
        world.setDynamicProperty(id, JSON.stringify(data));
    } catch (e) {
        console.warn(`[Country] Failed to save property ${id}:`, e);
    }
}

// ====== 国スコアボード用の安全なID生成 ======
function getCountryId(countryName) {
    return "country_" + countryName.replace(/[^a-zA-Z0-9]/g, "_");
}

// ====== 国作成フォーム ======
function show_form(player) {
    const form = new ui.ModalFormData();
    form.title("国作成");
    form.textField("国名", "例: 日本");
    form.toggle("平和主義");

    form.show(player).then(response => {
        if (response.canceled) {
            player.sendMessage("§7キャンセルされました。");
            return;
        }

        const countryName = String(response.formValues[0]).trim();
        const pacifist = Boolean(response.formValues[1]);

        if (!countryName) {
            player.sendMessage("§c国名を入力してください！");
            return;
        }

        // 既に国に所属しているかチェック
        const current = player.getDynamicProperty(PLAYER_COUNTRY);
        if (current) {
            player.sendMessage("§cすでに国に所属しています！");
            return;
        }

        // 既存国リストを取得
        const countries = GetAndParsePropertyData(COUNTRY_LIST);

        // 重複チェック
        if (countries.find(c => c.name === countryName)) {
            player.sendMessage(`§c国「${countryName}」はすでに存在します。`);
            return;
        }

        // 国ID生成
        const id = getCountryId(countryName);

        // 国情報を追加
        countries.push({
            id: id,
            name: countryName,
            pacifist: pacifist,
            king: player.name
        });

        // 保存
        StringifyAndSavePropertyData(COUNTRY_LIST, countries);

        // プレイヤー側に所属データを保存
        player.setDynamicProperty(PLAYER_COUNTRY, countryName);
        player.addTag(`king`);
        player.addTag(`country:${countryName}`);

        player.sendMessage(`§a国「${countryName}」を建国しました！`);
    });
}

// ====== コマンド登録 ======
server.system.beforeEvents.startup.subscribe(ev => {
    ev.customCommandRegistry.registerCommand({
        name: "mc:makecountry",
        description: "国を作成するコマンド",
        permissionLevel: server.CommandPermissionLevel.Any
    }, (origin, args) => {
        const player = origin.sourceEntity;
        if (player?.typeId === "minecraft:player") {
            system.run(() => show_form(player));
        }
    });
});
