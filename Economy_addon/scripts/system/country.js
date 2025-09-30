import * as server from "@minecraft/server";

const { world, system } = server;




// --- 国データ管理 ---
function getCountries() {
    const raw = world.getDynamicProperty("countries");

    // undefined や null の場合は空配列を返す
    if (typeof raw !== "string" || raw.trim() === "") {
        return [];
    }

    try {
        return JSON.parse(raw);
    } catch (e) {
        console.warn("[Country] JSON parse error:", e, raw);
        return [];
    }
}


function saveCountries(countries) {
    world.setDynamicProperty("countries", JSON.stringify(countries));
}

// --- コマンド登録 ---
system.beforeEvents.startup.subscribe(ev => {
    ev.customCommandRegistry.registerCommand({
        name: "mc:createcountry",
        description: "国を作成します",
        permissionLevel: server.CommandPermissionLevel.Any,
        mandatoryParameters: [], // ← 引数を必須にしない
        optionalParameters: []
    }, (origin, args) => {
        const player = origin.sourceEntity;
        if (!player || player.typeId !== "minecraft:player") {
            return { status: server.CustomCommandStatus.Failure, message: "プレイヤーのみ実行できます" };
        }

        // 引数を全部結合して国名にする
        const name = args.join(" ").trim();

        if (!name || name.length === 0) {
            return { status: server.CustomCommandStatus.Failure, message: "国名を入力してください" };
        }

        const countries = getCountries();

        // 所属チェック
        for (const tag of player.getTags()) {
            if (tag.startsWith("country:")) {
                return { status: server.CustomCommandStatus.Failure, message: "すでに国に所属しています" };
            }
        }

        // 重複チェック
        if (countries.some(c => c.name.toLowerCase() === name.toLowerCase())) {
            return { status: server.CustomCommandStatus.Failure, message: "その国名はすでに使われています" };
        }

        // 国を作成
        const newCountry = {
            name,
            owner: player.name,
            members: [player.name]
        };
        countries.push(newCountry);
        saveCountries(countries);

        // タグ付与
        try {
            player.runCommand(`tag @s add country:${name}`);
        } catch (e) {
            console.warn("[Country] Tag add failed:", e);
        }

        return { status: server.CustomCommandStatus.Success, message: `国「${name}」を建国しました！` };
    });
});



// 国データを初期化する関数
function resetCountries() {
    server.world.setDynamicProperty("countries", JSON.stringify([]));
}

// リセットコマンド登録
server.system.beforeEvents.startup.subscribe(ev => {
    ev.customCommandRegistry.registerCommand({
        name: "mc:resetcountries",
        description: "国データをリセット（空にする）",
        permissionLevel: server.CommandPermissionLevel.Any, // OP専用
        mandatoryParameters: [],
        optionalParameters: []
    }, (origin, args) => {
        resetCountries();
        return { status: server.CustomCommandStatus.Success, message: "国データをリセットしました！" };
    });
});
