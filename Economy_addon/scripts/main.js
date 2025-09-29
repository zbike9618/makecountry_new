import { system, world } from "@minecraft/server";
import * as jobs from "./systems/jobs.js";

// 石を掘ったときにお金を加算するイベントリスナー
world.afterEvents.blockBreak.subscribe((event) => {
	const { block, player } = event;
	if (!player) return;
	// どのブロックでも職業報酬判定
	jobs.handleBlockBreak(player, block.typeId);
});

// モンスター討伐時のイベント（例: entityDie）
world.afterEvents.entityDie.subscribe((event) => {
	const { deadEntity, damageSource } = event;
	// プレイヤーが倒した場合のみ
	if (damageSource && damageSource.cause === "entityAttack" && damageSource.damagingEntity) {
		const player = damageSource.damagingEntity;
		// モンスターのみ報酬判定（プレイヤー以外）
		if (deadEntity.typeId.startsWith("minecraft:") && deadEntity.typeId !== "minecraft:player") {
			jobs.handleMobKill(player, deadEntity.typeId);
		}
	}
});
// jobs.jsの関数は jobs.handleBlockBreak, jobs.handleMobKill などで利用可能

