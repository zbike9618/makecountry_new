import { CONFIG } from "../config/settings.js";
import { loadCountryData, saveCountryData } from "../utils/storage.js";

let countries = loadCountryData();

export function createCountry(name, owner) {
  if (name.length > CONFIG.MAX_COUNTRY_NAME) return "国名が長すぎます";
  if (countries[name]) return "すでに存在します";

  countries[name] = {
    owner,
    members: [owner],
    money: CONFIG.START_MONEY
  };
  saveCountryData(countries);
  return `国「${name}」を作成しました！（初期資金 ${CONFIG.START_MONEY}）`;
}

export function deleteCountry(name, requester) {
  if (!countries[name]) return "存在しません";
  if (countries[name].owner !== requester) return "所有者のみ削除できます";

  delete countries[name];
  saveCountryData(countries);
  return `国「${name}」を削除しました`;
}
