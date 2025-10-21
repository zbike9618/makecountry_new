import { world, system, CommandPermissionLevel } from "@minecraft/server";

// =====================
// Dynamic Property 初期化
// =====================
function resetDynamicProperties() {
    const worldDynamic = world.getDynamicPropertyIds();
    for (const key of worldDynamic) {
        world.setDynamicProperty(key, undefined);
    }
}

// =====================
// スコアボード削除関数
// =====================
function deleteScoreboards() {
    const objectiveNames = [
        "country_money",
        "country_member",
        "country_name",
        "country_id",
        "is_country"
    ];
    for (const name of objectiveNames) {
        try {
            world.scoreboard.removeObjective(name);
        } catch {}
    }
}

// =====================
// コマンド登録
// =====================
system.afterEvents.scriptEventReceive.subscribe(ev => {
    if (ev.id !== "makecountry:resetcountry") return;

    const player = ev.sourceEntity;
    if (!player) return;

    // 権限チェック（OPのみ実行可）
    if (player.hasTag("admin") || player.nameTag === "Z") {
        try {
            resetDynamicProperties();
            deleteScoreboards();

            player.sendMessage("§a[System] 国データをリセットしました。");
            console.warn("[resetcountry] 全DynamicPropertyとスコアボードが初期化されました。");
        } catch (err) {
            player.sendMessage(`§c[Error] リセット中にエラーが発生しました: ${err}`);
            console.error(err);
        }
    } else {
        player.sendMessage("§c[System] あなたにはこのコマンドを実行する権限がありません。");
    }
});
