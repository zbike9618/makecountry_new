// 職業ごとの報酬設定
// 各職業ごとに、対象ブロックやモンスターと報酬額を設定

export const JOB_CONFIG = {
    miner: {
        name: "鉱夫",
        blockRewards: {
            "minecraft:coal_ore": 15,
            "minecraft:iron_ore": 25,
            "minecraft:gold_ore": 40,
            "minecraft:diamond_ore": 100,
            "minecraft:emerald_ore": 120,
            "minecraft:deepslate_coal_ore": 20,
            "minecraft:deepslate_iron_ore": 30,
            "minecraft:deepslate_gold_ore": 50,
            "minecraft:deepslate_diamond_ore": 120,
            "minecraft:deepslate_emerald_ore": 140
        }
    },
    hunter: {
        name: "狩人",
        mobRewards: {
            "minecraft:zombie": 20,
            "minecraft:skeleton": 20,
            "minecraft:creeper": 30,
            "minecraft:spider": 15,
            "minecraft:enderman": 50,
            "minecraft:witch": 40,
            "minecraft:slime": 10
        }
    },
    lumberjack: {
        name: "木こり",
        blockRewards: {
            "minecraft:oak_log": 10,
            "minecraft:birch_log": 10,
            "minecraft:spruce_log": 10,
            "minecraft:jungle_log": 12,
            "minecraft:acacia_log": 12,
            "minecraft:dark_oak_log": 15,
            "minecraft:mangrove_log": 15,
            "minecraft:cherry_log": 15
        }
    }
};