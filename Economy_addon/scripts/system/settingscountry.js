import * as server from "@minecraft/server";
import * as ui from "@minecraft/server-ui";

const system = server.system;
const world = server.world;

// /mc:sc コマンド登録
system.beforeEvents.startup.subscribe(ev => {
    ev.customCommandRegistry.registerCommand({
        name: "mc:sc",
        description: "国管理メニューを開く",
        permissionLevel: server.CommandPermissionLevel.Any,
    }, (origin, args) => {
        const player = origin.sourceEntity;
        if (!player || player.typeId !== "minecraft:player") return;

        // 1tick遅延でUIを開く（権限エラー回避）
        system.run(() => {
            showSCMenu(player);
        });
    });
});

// ==============================
// メインメニュー
// ==============================
function showSCMenu(player) {
    const form = new ui.ActionFormData()
        .title("§l国管理メニュー")
        .button("国庫管理")
        .button("国解体")
        .button("国民管理");

    form.show(player).then(response => {
        if (response.canceled) return;

        switch (response.selection) {
            case 0:
                showBankMenu(player);
                break;
            case 1:
                if (!player.hasTag("king")) {
                    player.sendMessage("§c国王のみ国解体が可能です。");
                    return;
                }
                disbandCountry(player);
                break;
            case 2:
                if (!player.hasTag("king")) {
                    player.sendMessage("§c国王のみ国民管理が可能です。");
                    return;
                }
                manageCitizens(player);
                break;
        }
    });
}

// ==============================
// 国庫メニュー
// ==============================
function showBankMenu(player) {
    const form = new ui.ActionFormData()
        .title("§l国庫メニュー")
        .button("入金")
        .button("引き出し");

    form.show(player).then(response => {
        if (response.canceled) return;

        if (response.selection === 0) {
            depositToCountry(player);
        } else if (response.selection === 1) {
            withdrawFromCountry(player);
        }
    });
}

// 入金処理
function depositToCountry(player) {
    const form = new ui.ModalFormData()
        .title("入金")
        .textField("入金額を入力してください", "例: 100");

    form.show(player).then(response => {
        if (response.canceled) return;
        const amount = parseInt(response.formValues[0]);
        if (isNaN(amount) || amount <= 0) {
            player.sendMessage("§c正しい金額を入力してください。");
            return;
        }

        const moneyObj = world.scoreboard.getObjective("money");
        const bankObj = world.scoreboard.getObjective("bank");
        if (!moneyObj || !bankObj) {
            player.sendMessage("§cスコアボード 'money' または 'bank' が存在しません。");
            return;
        }

        const currentMoney = moneyObj.getScore(player) ?? 0;
        if (currentMoney < amount) {
            player.sendMessage("§c所持金が足りません。");
            return;
        }

        // 国名を取得
        const countryName = player.getDynamicProperty("country");
        if (!countryName) {
            player.sendMessage("§cあなたはどの国にも所属していません。");
            return;
        }

        // 処理
        moneyObj.setScore(player, currentMoney - amount);
        const currentBank = bankObj.getScore(countryName) ?? 0;
        bankObj.setScore(countryName, currentBank + amount);

        player.sendMessage(`§a国庫に ${amount} コインを入金しました。`);
    });
}

// 引き出し処理
function withdrawFromCountry(player) {
    const form = new ui.ModalFormData()
        .title("引き出し")
        .textField("引き出す額を入力してください", "例: 100");

    form.show(player).then(response => {
        if (response.canceled) return;
        const amount = parseInt(response.formValues[0]);
        if (isNaN(amount) || amount <= 0) {
            player.sendMessage("§c正しい金額を入力してください。");
            return;
        }

        const moneyObj = world.scoreboard.getObjective("money");
        const bankObj = world.scoreboard.getObjective("bank");
        if (!moneyObj || !bankObj) {
            player.sendMessage("§cスコアボード 'money' または 'bank' が存在しません。");
            return;
        }

        // 国名を取得
        const countryName = player.getDynamicProperty("country");
        if (!countryName) {
            player.sendMessage("§cあなたはどの国にも所属していません。");
            return;
        }

        const currentBank = bankObj.getScore(countryName) ?? 0;
        if (currentBank < amount) {
            player.sendMessage("§c国庫に十分な資金がありません。");
            return;
        }

        const currentMoney = moneyObj.getScore(player) ?? 0;

        // 処理
        bankObj.setScore(countryName, currentBank - amount);
        moneyObj.setScore(player, currentMoney + amount);

        player.sendMessage(`§a国庫から ${amount} コインを引き出しました。`);
    });
}

// ==============================
// 国解体
// ==============================
function disbandCountry(player) {
    const countryName = player.getDynamicProperty("country");
    if (!countryName) {
        player.sendMessage("§cあなたは国に所属していません。");
        return;
    }

    // 国庫リセット
    const bankObj = world.scoreboard.getObjective("bank");
    if (bankObj) {
        bankObj.setScore(countryName, 0);
    }

    // 所属国を解除
    player.setDynamicProperty("country", undefined);
    player.removeTag("king");

    player.sendMessage(`§c国 '${countryName}' を解体しました。`);
}

// ==============================
// 国民管理
// ==============================
function manageCitizens(player) {
    const form = new ui.ActionFormData()
        .title("国民管理")
        .button("国民追放")
        .button("国王譲渡");

    form.show(player).then(response => {
        if (response.canceled) return;

        if (response.selection === 0) {
            exileCitizen(player);
        } else if (response.selection === 1) {
            transferKingship(player);
        }
    });
}

// 国民追放
function exileCitizen(player) {
    const players = [...world.getPlayers()].filter(p => p !== player);
    const form = new ui.ActionFormData().title("国民追放");

    players.forEach(p => form.button(p.name));

    form.show(player).then(response => {
        if (response.canceled) return;
        const target = players[response.selection];
        if (!target) return;

        if (target.getDynamicProperty("country") === player.getDynamicProperty("country")) {
            target.setDynamicProperty("country", undefined);
            player.sendMessage(`§e${target.name} を国から追放しました。`);
            target.sendMessage("§cあなたは国から追放されました。");
        } else {
            player.sendMessage("§c同じ国に所属していないプレイヤーです。");
        }
    });
}

// 国王譲渡
function transferKingship(player) {
    const players = [...world.getPlayers()].filter(p => p !== player);
    const form = new ui.ActionFormData().title("国王譲渡");

    players.forEach(p => form.button(p.name));

    form.show(player).then(response => {
        if (response.canceled) return;
        const target = players[response.selection];
        if (!target) return;

        if (target.getDynamicProperty("country") === player.getDynamicProperty("country")) {
            player.removeTag("king");
            target.addTag("king");
            player.sendMessage(`§e${target.name} に国王を譲渡しました。`);
            target.sendMessage("§aあなたは新しい国王になりました。");
        } else {
            player.sendMessage("§c同じ国に所属していないプレイヤーです。");
        }
    });
}  