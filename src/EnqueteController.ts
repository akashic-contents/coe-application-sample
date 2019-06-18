import {
	COEController, Action
} from "@akashic-extension/coe";

/**
 * Command の種別
 */
export enum EnqueteCommandType {
	/**
	 * アンケートの開始
	 */
	Start = "enquete_start",

	/**
	 * アンケートの結果表示
	 */
	Result = "enquete_result"
}

/**
 * Action の種別
 */
export enum EnqueteActionType {
	/**
	 * 設問への投票。
	 */
	Vote = "enquete_vote"
}

export type EnqueteActionData = EnqueteVoteActionData;

/**
 * アンケート投票時の Action Data
 */
export interface EnqueteVoteActionData {
	type: EnqueteActionType.Vote;
	parameter: {
		votedIndex: number;
	};
}

export type EnqueteCommand = EnqueteStartCommand | EnqueteResultCommand;

/**
 * アンケート開始時の Command
 */
export interface EnqueteStartCommand {
	type: EnqueteCommandType.Start;
	parameter: {
		topic: string;
		choices: string[];
	};
}

/**
 * アンケート結果表示時の Command
 */
export interface EnqueteResultCommand {
	type: EnqueteCommandType.Result;
	parameter: {
		topic: string;
		choices: number[];
	};
}

/**
 * EnqueteController 生成時のパラメータ
 */
export interface EnqueteControllerParameter {
	/**
	 * 質問文
	 */
	topic: string;

	/**
	 * 設問
	 */
	choices: string[];
}

/**
 * アンケートの集計を行う Controller
 */
export class EnqueteController extends COEController<EnqueteCommand, EnqueteActionData> {
	votedMap: number[] = [];

	constructor(param: EnqueteControllerParameter) {
		super();

		// パラメータをブロードキャスト
		this.broadcast({
			type: EnqueteCommandType.Start,
			parameter: {
				topic: param.topic,
				choices: param.choices
			}
		});

		// 30秒後に結果を送信
		this.setTimeout(
			() => {
				this.broadcast({
					type: EnqueteCommandType.Result,
					parameter: {
						topic: param.topic,
						choices: this.votedMap
					}
				});
			},
			30 * 1000
		);

		// Action の受信トリガの登録
		this.actionReceived.add(this.onActionReceived, this);
	}

	destroy(): void {
		// Action の受信トリガを解除
		this.actionReceived.remove(this.onActionReceived, this);

		super.destroy();
	}

	/**
	 * Action 受取時の処理
	 *
	 * @param action Action
	 */
	onActionReceived(action: Action<EnqueteActionData>): void {
		const data = action.data;

		if (data == null) {
			return;
		}
		if (data.type !== EnqueteActionType.Vote) {
			return;
		}
		if (typeof data.parameter.votedIndex !== "number") {
			return;
		}
		if (!this.votedMap[data.parameter.votedIndex]) {
			this.votedMap[data.parameter.votedIndex] = 0;
		}
		this.votedMap[data.parameter.votedIndex] += 1;
	}
}
