import * as server from "@minecraft/server";
import { world, system } from "@minecraft/server";
import * as ui from "@minecraft/server-ui";

const PLAYER_COUNTRY = "playerCountry";

// プレイヤー所属国を取得
function getPlayerCountry(player) {
    const country = player.getDynamicProperty(PLAYER_COUNTRY);
    return country ? String(country) : null;
}

// スコアボード初期化
function ensureScoreboard(name, displayName) {
    try {
        world.scoreboard.addObjective(name, displayName);
    } catch (e) {
        // 既にある場合は無視
    }
}

// 残高取得
function getScore(objective, target) {
    return world.scoreboard.getObjective(objective)?.getScore(target) ?? 0;
}

// 残高セット
function setScore(objective, target, value) {
    const obj = world.scoreboard.getObjective(objective);
    if (!obj) return;
    obj.setScore(target, value);
}

// 国庫UI
function showBankUI(player) {
    const country = getPlayerCountry(player);
    if (!country) {
        player.sendMessage("§cあなたは国に所属していません。");
        return;
    }

    const bank = getScore("bank", country);
    const money = getScore("money", player);

    const form = new ui.ActionFormData()
        .title(`国庫: ${country}`)
        .body(`§e国庫残高: §a${bank} コイン\n§eあなたの所持金: §a${money} コイン`)
        .button("§a入金する")
        .button("§c引き出す");

    form.show(player).then(r => {
        if (r.canceled) return;

        if (r.selection === 0) {
            // 入金フォーム
            const f = new ui.ModalFormData()
                .title("国庫へ入金")
                .textField("金額を入力", "例: 100");
            f.show(player).then(res => {
                if (res.canceled) return;
                const amount = parseInt(res.formValues[0]);
                if (isNaN(amount) || amount <= 0) {
                    player.sendMessage("§c正しい金額を入力してください。");
                    return;
                }

                const currentMoney = getScore("money", player);
                if (currentMoney < amount) {
                    player.sendMessage("§c所持金が足りません。");
                    return;
                }

                // 移動処理
                setScore("money", player, currentMoney - amount);
                setScore("bank", country, bank + amount);
                player.sendMessage(`§a国庫に ${amount} コインを入金しました！`);
            });

        } else if (r.selection === 1) {
            // 出金フォーム
            const f = new ui.ModalFormData()
                .title("国庫から出金")
                .textField("金額を入力", "例: 100");
            f.show(player).then(res => {
                if (res.canceled) return;
                const amount = parseInt(res.formValues[0]);
                if (isNaN(amount) || amount <= 0) {
                    player.sendMessage("§c正しい金額を入力してください。");
                    return;
                }

                const bankBalance = getScore("bank", country);
                if (bankBalance < amount) {
                    player.sendMessage("§c国庫の残高が不足しています。");
                    return;
                }

                const currentMoney = getScore("money", player);

                // 移動処理
                setScore("bank", country, bankBalance - amount);
                setScore("money", player, currentMoney + amount);
                player.sendMessage(`§e国庫から ${amount} コインを引き出しました！`);
            });
        }
    });
}

// コマンド登録
server.system.beforeEvents.startup.subscribe(ev => {
    ensureScoreboard("money", "所持金");
    ensureScoreboard("bank", "国庫");

    ev.customCommandRegistry.registerCommand({
        name: "mc:bank",
        description: "国庫を管理するUIを開く",
        permissionLevel: server.CommandPermissionLevel.Any,
    }, (origin, args) => {
        const player = origin.sourceEntity;
        if (player?.typeId === "minecraft:player") {
            system.run(() => showBankUI(player));
        }
    });
});
