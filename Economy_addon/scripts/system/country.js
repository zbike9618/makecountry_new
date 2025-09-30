import * as server from "@minecraft/server";
import { world , system , CommandPermissionLevel , CustomCommandStatus} from "@minecraft/server";
import * as ui from "@minecraft/server-ui";

function show_form(player) {
    const form = new ui.ModalFormData();
    form.title("国作成");
    form.textField("国名", "例: 日本",);
    form.toggle("平和主義");
    form.show(player).then(response => {
        if (response.canceled){
            player.sendMessage('キャンセルされました');
            return;
        }
        player.sendMessage("国名: "+ String(response.formValues[0]));
        player.sendMessage("平和主義: " +String(response.formValues[1]));
    })
}

server.system.beforeEvents.startup.subscribe(ev => {
    ev.customCommandRegistry.registerCommand({
        name:"mc:makecountry",
        description:"国を作成するコマンド",
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