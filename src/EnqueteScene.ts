import {
	Scene, SceneParameters
} from "@akashic-extension/coe";
import {
	EnqueteCommand, EnqueteActionData, EnqueteCommandType, EnqueteActionType
} from "./EnqueteController";

/**
 * EnqueteScene 生成時のパラメータ
 */
export interface EnqueteSceneParameter extends SceneParameters<EnqueteCommand, EnqueteActionData> {
	//
}

/**
 * アンケートの表示・投票などの UI を提供する View
 */
export class EnqueteScene extends Scene<EnqueteCommand, EnqueteActionData> {
	private font: g.DynamicFont;

	constructor(param: EnqueteSceneParameter) {
		super(param);

		this.loaded.addOnce(this.onLoaded, this);
		this.commandReceived.add(this.onCommandReceived, this);
	}

	/**
	 * 本 Scene の読み込み時の処理
	 */
	private onLoaded() {
		const font = new g.DynamicFont({
			game: g.game,
			fontFamily: g.FontFamily.SansSerif,
			size: 40
		});
		this.font = font;
	}

	/**
	 * Controller からの Command を受信した際の処理
	 * @param command Command
	 */
	private onCommandReceived(command: EnqueteCommand) {
		const scene = this;
		const font = this.font;

		if (command.type === EnqueteCommandType.Start) {
			// 質問の描画
			const topic = new g.Label({
				scene,
				font,
				fontSize: 30,
				textColor: "#880000",
				text: command.parameter.topic
			});
			scene.append(topic);

			const description = new g.Label({
				scene,
				font,
				fontSize: 25,
				x: 20,
				y: 35,
				textColor: "#aaa",
				text: "項目をクリックしてください。30秒後に集計結果が表示されます。"
			});
			scene.append(description);

			// 質問文の描画
			command.parameter.choices.forEach((choice, i) => {
				const label = new g.Label({
					scene,
					font,
					fontSize: 30,
					text: `・${choice}`,
					y: 80 + 40 * i,
					width: scene.game.width,
					height: 30,
					touchable: true
				});
				label.pointDown.add(() => {
					label.textColor = "red";
					label.invalidate();
					scene.send({
						type: EnqueteActionType.Vote,
						parameter: {
							votedIndex: i
						}
					});
				});
				scene.append(label);
			});

		} else if (command.type === EnqueteCommandType.Result) {
			// 投票総数の計算
			const sum = command.parameter.choices.reduce((p, c) => p + c, 0);

			// 投票結果の描画
			command.parameter.choices.forEach((choice, i) => {
				const label = new g.Label({
					scene,
					font,
					fontSize: 30,
					text: `${((choice / sum) * 100).toFixed(1)}%`,
					x: 170,
					y: 80 + 40 * i,
					width: scene.game.width,
					height: 30
				});
				scene.append(label);
			});
		}
	}
}
