import { world } from "@minecraft/server";

// プレイヤーデータ保存
export function savePlayerData(player, data) {
  player.setDynamicProperty("playerData", JSON.stringify(data));
}

export function loadPlayerData(player) {
  const raw = player.getDynamicProperty("playerData");
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

// 国データ保存
export function saveCountryData(countries) {
  world.setDynamicProperty("countries", JSON.stringify(countries));
}

export function loadCountryData() {
  const raw = world.getDynamicProperty("countries");
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}
