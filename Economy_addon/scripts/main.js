import { world, DynamicPropertiesDefinition } from "@minecraft/server";
import { registerCountryCommands } from "./commands/country.js";

world.afterEvents.worldInitialize.subscribe(ev => {
  const def = new DynamicPropertiesDefinition();

  // 国データ保存用（文字列最大20000文字）
  def.defineString("countries", 20000);

  // プレイヤーデータ保存用
  def.defineString("playerData", 5000);

  ev.propertyRegistry.registerWorldDynamicProperties(def);
  ev.propertyRegistry.registerEntityTypeDynamicProperties(def, "minecraft:player");
});

world.beforeEvents.chatSend.subscribe(ev => {
  if (ev.message === "!reload") {
    ev.sender.sendMessage("§aEconomy Addon Loaded!");
  }
});

// コマンド登録
system.beforeEvents.startup.subscribe(ev => {
  registerCountryCommands(ev.customCommandRegistry);
});
