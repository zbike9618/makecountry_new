import { world } from "@minecraft/server";
import { JOB_CONFIG } from "../config/jobs_config.js";

// 職業取得（仮実装: 実際はデータ保存やスコアボード等で管理）
export function getPlayerJob(player) {
	return player.getDynamicProperty("job") || "miner";
}

// スコアボード(money)に金額加算
export function addMoney(player, amount) {
	try {
		const objectiveName = "money";
		let objective = world.scoreboard.getObjective(objectiveName);
		if (!objective) {
			objective = world.scoreboard.addObjective(objectiveName, "Money");
		}
		const current = objective.getScore(player) || 0;
		objective.setScore(player, current + amount);
	} catch (e) {
		console.warn("スコアボード加算エラー:", e);
	}
}

// ブロック破壊時の報酬処理
export function handleBlockBreak(player, blockTypeId) {
	const job = getPlayerJob(player);
	const config = JOB_CONFIG[job];
	if (!config || !config.blockRewards) return;
	const reward = config.blockRewards[blockTypeId];
	if (reward) {
		addMoney(player, reward);
	}
}

// モンスター討伐時の報酬処理
export function handleMobKill(player, mobTypeId) {
	const job = getPlayerJob(player);
	const config = JOB_CONFIG[job];
	if (!config || !config.mobRewards) return;
	const reward = config.mobRewards[mobTypeId];
	if (reward) {
		addMoney(player, reward);
	}
}
