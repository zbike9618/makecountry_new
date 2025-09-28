import {
  system,
  CustomCommandParamType,
  CustomCommandResult,
  CommandPermissionLevel
} from "@minecraft/server";
import { createCountry, deleteCountry } from "../systems/countrySystem.js";

export function registerCountryCommands(registry) {
  // /makecountry <国名>
  registry.registerCommand(
    {
      name: "makecountry",
      description: "国を作成する",
      permissionLevel: CommandPermissionLevel.Any,
      mandatoryParameters: [
        { name: "name", type: CustomCommandParamType.String }
      ]
    },
    (origin, name) => {
      const entity = origin.sourceEntity;
      if (!entity) return { status: CustomCommandResult.Failure, message: "プレイヤーから実行してください" };

      const msg = createCountry(name, entity.name);
      return { status: CustomCommandResult.Success, message: msg };
    }
  );

  // /deletecountry <国名>
  registry.registerCommand(
    {
      name: "deletecountry",
      description: "国を削除する",
      permissionLevel: CommandPermissionLevel.Any,
      mandatoryParameters: [
        { name: "name", type: CustomCommandParamType.String }
      ]
    },
    (origin, name) => {
      const entity = origin.sourceEntity;
      if (!entity) return { status: CustomCommandResult.Failure, message: "プレイヤーから実行してください" };

      const msg = deleteCountry(name, entity.name);
      return { status: CustomCommandResult.Success, message: msg };
    }
  );
}
