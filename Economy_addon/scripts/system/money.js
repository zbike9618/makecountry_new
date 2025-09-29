import * as server from "@minecraft/server";
import { world , system , CommandPermissionLevel , CustomCommandStatus} from "@minecraft/server";
import * as ui from "@minecraft/server-ui";

server.system.beforeEvents.startup.subscribe(ev => {
    ev.customCommandRegistry.registerCommand({
        name:"mc:jobs",
        description:"職業を選択するコマンド",
        permissionLevel : server.CommandPermissionLevel.Any,
        mandatoryParameters:[
        ],
        optionalParameters:[
        ]
    },(origin, arg) => {
        if (origin.sourceEntity?.typeId === "minecraft:player") {
            let player = origin.sourceEntity;
            system.run(() => {  // 1tick後に安全に実行
                show_form(player);
            });
        }
    });
});