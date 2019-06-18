import { initialize } from "@akashic-extension/coe";
import { EnqueteController } from "./EnqueteController";
import { EnqueteScene } from "./EnqueteScene";

const game = g.game;

function main(args: g.GameMainParameterObject): void {
	initialize({ game, args });

	const controller = new EnqueteController({
		topic: "好きな色はなんですか？",
		choices: [
			"赤", "青", "緑", "黄色", "ピンク", "紫", "白", "黒"
		]
	});

	const scene = new EnqueteScene({
		game,
		controller
	});
	game.pushScene(scene);
}

export = main;
