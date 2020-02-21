import React, { useState } from "react";
import "./App.css";

enum Unit {
  chf,
  usd,
  eur,
  hour
}
enum UnitType {
  money,
  labor,
  material
}

type Res = { quantity: number; unit: Unit };
type Window = { start: Date; end: Date };
enum Frequency {
  daily,
  weekly,
  monthly,
  yearly,
  quarterly
}
type Flow = { quantity: number; date: Date };
type Flows = { res: Res; window: Window; frequency: Frequency };

type Party = { name: string; address: string; account: string };
type ContractFlow = { flow: Flows; party: Party };

type OnChange = () => void;

type TableParams = { window?: Window; unit?: Unit; frequency?: Frequency };

interface Contract {
  contractFlows: ContractFlow[];
  contractLine: number[];
  rollupLine: number[];
  flows: Flow[];
  subs: { [key: string]: Contract };
  onChange: OnChange;
  // genFlows : (params: TableParams) => void = (params)=> {}
  // setContract: (contractFlows:ContractFlow[])
}

interface Table {
  unit: Unit;
  frequency: Frequency;
  window: Window;
  windowHeaderLine: Window[];
  root: Contract;
  setParameters: (params: TableParams) => void;
}

// display table
// header:left:paramaters:unit,frequency,window,
// header:right:total
// header:header cell
// contract:left: name,unit,quantity,frequency
// contract:right:total
// contract row:level: : contract cell
//   contract rollup:level row: rollup cell
//   footer??

/////////////// reading ///////////////////
// display
// game.play(display, profile)
//  while (
//     awaitUserGo()?.makeGoal()?.challenge().awaitAnswer().evaluate().present()
// )   {}
//    createDisplay(onGo, onAnswer, onExit)
//

type Profile = {
  name: string;
};
enum PlayStatusEnum {
  Success,
  Failure
}
type PlayStatus = {
  lastEvaluation?: number;
  status?: PlayStatusEnum;
};
type Score = {
  wins: number;
  attempts: number;
  interval: number;
  streekAttempts: number;
  streekScore: number;
  lastStatus: PlayStatus;
};
enum ShowType {
  Emphasis,
  Flash,
  Flow
}
enum InputType {
  Group,
  Spell,
  Keyboard
}
type GameParameters = {
  startInterval: number;
  streekLength: number;
  delta: number;
  showType: ShowType;
  input: InputType;
  leavePickerOnScreen: boolean;
};
type Goal = string;

type Answer = Goal;
type Goals = Goal[];
enum StateEnum {
  PresentScore = "PresentScore",
  AwaitGo = "AwaitGo",
  CalcNextGoal = "CalcNextGoal",
  Challenge = "Challenge",
  AwaitAnswer = "AwaitAnswer",
  EvaluateAnswer = "EvaluateAnswer"
}
type GameState = {
  profile: Profile;
  score: Score;
  parameters: GameParameters;
  display?: any;
  input?: any;
  goal?: Goal;
  goals: Goals;
  answer?: Answer;
  state: StateEnum;
};

function presentScore(state: GameState) {
  state.state = StateEnum.PresentScore;
  return awaitGo(state);
}
function awaitGo(state: GameState) {
  state.state = StateEnum.AwaitGo;
  return { ...state };
}
function calcNextGoal(state: GameState) {
  state.state = StateEnum.CalcNextGoal;

  console.log("calcNextGoal");
  if (state.score.streekAttempts >= state.parameters.streekLength) {
    if (state.score.streekScore >= (state.parameters.streekLength * 2.0) / 3) {
      advancePlayer(state);
    } else if (
      state.score.streekScore <=
      (state.parameters.streekLength * 1.0) / 3
    ) {
      demotePlayer(state);
    }
    state.score.streekScore = 0;
    state.score.streekAttempts = 0;
    state.score.attempts++;
  }
  console.log("calcNextGoal1", state.goal);
  state.goal = generateGoal(state.goals);
  console.log("calcNextGoal2", state.goal);
  state.answer = undefined;
  return { ...state };
}
function challenge(state: GameState) {
  state.state = StateEnum.Challenge;
  console.log("challenging...");
  return { ...state };
}
function awaitAnswer(state: GameState) {
  console.log("awaitAnswer...");
  state.state = StateEnum.AwaitAnswer;
  return { ...state };
}
function evaluateAnswer(state: GameState) {
  state.state = StateEnum.EvaluateAnswer;
  console.log("evaluateAnswer...");

  if (state.answer === state.goal) {
    state.score.lastStatus.lastEvaluation = 1;
    state.score.lastStatus.status = PlayStatusEnum.Success;
    state.score.streekScore++;
    console.log("guess correct!");
  } else {
    state.score.lastStatus.lastEvaluation = 0;
    state.score.lastStatus.status = PlayStatusEnum.Failure;
    console.log("guess wrong!");
  }
  state.score.streekAttempts++;
  return presentScore(state);
}

function advancePlayer(state: GameState) {
  console.log("advancePlayer...");
  state.score.interval -= state.score.interval * state.parameters.delta;
  state.score.wins++;
}
function demotePlayer(state: GameState) {
  console.log("demotePlayer...");
  state.score.interval += state.score.interval * state.parameters.delta;
}
function generateGoal(goals: Goals) {
  console.log("generateGoal: ", Math.round(Math.random() * goals.length));
  const index=Math.trunc(Math.random() * goals.length)
  console.log("index:",index)
  return goals[index];
}

const initGoals = ["de", "ne", "ja", "re"];

const initState: GameState = {
  parameters: {
    startInterval: 2000,
    streekLength: 3,
    delta: 0.2,
    showType: ShowType.Flash,
    input: InputType.Group,
    leavePickerOnScreen: false
  },
  profile: { name: "Olivia" },
  score: {
    wins: 0,
    attempts: 0,
    interval: 1000,
    streekAttempts: 0,
    streekScore: 0,
    lastStatus: {}
  },
  display: undefined,
  input: InputType.Group,
  goal: undefined,
  goals: initGoals,
  answer: undefined,
  state: StateEnum.PresentScore
};
interface PickerProps {
  gameState: GameState;
  onChoose: (gameState: GameState) => any;
}
const Picker: React.FC<PickerProps> = (props: PickerProps) => {
  const { gameState, onChoose } = props;
  const showAnswer =
    gameState.state === StateEnum.PresentScore ||
    gameState.state === StateEnum.AwaitGo;

  const showPicker =
    gameState.parameters.leavePickerOnScreen ||
    (gameState.state !== StateEnum.Challenge &&
      gameState.state !== StateEnum.CalcNextGoal);

  if (gameState.parameters.input === InputType.Group) {
    return (
      <div className={showPicker ? "show" : "hide"}>
        {gameState.goals.map(goal => {
          let color = "default";
          let disable = true;
          if (showAnswer) {
            if (gameState.score.lastStatus.status === PlayStatusEnum.Success) {
              if (gameState.answer === goal) {
                color = "correct";
              }
            } else if (
              gameState.score.lastStatus?.status === PlayStatusEnum.Failure
            ) {
              if (gameState.answer === goal) {
                color = "incorrect";
              } else if (gameState.goal === goal) {
                color = "correct";
              }
            }
          } else {
            if (gameState.state === StateEnum.AwaitAnswer) disable = false;
          }
          return (
            <input
              type="button"
              value={goal}
              onClick={() => {
                gameState.answer = goal;
                onChoose(gameState);
              }}
              className={color}
              disabled={disable}
            />
          );
        })}
      </div>
    );
  }
  return <div>not implemented: {gameState.parameters.input}</div>;
};
export const App: React.FC = () => {
  const [state, setState] = useState(() => {
    initState.score.interval = initState.parameters.startInterval;
    return initState;
  });
  console.log("render: state:", state);
  let disableGo = true;
  if (
    state.state === StateEnum.AwaitGo ||
    state.state === StateEnum.PresentScore
  )
    disableGo = false;

  return (
    <div className="App">
      <h1
        onClick={() => {
          setState(state => presentScore(state));
        }}
      >
        Lesen wie!
      </h1>
      <div className="parameters">{JSON.stringify(state.parameters)}</div>
      <div className="score">{JSON.stringify(state.score)}</div>
      <input
        type="button"
        className="go"
        value="GO"
        disabled={disableGo}
        onClick={() => {
          setState(calcNextGoal);
          console.log(
            "setting timemout millisecs : ",
            state.score.interval,
            state
          );
          setTimeout(() => {
            setState(challenge);
            setTimeout(() => setState(awaitAnswer), state.score.interval);
          }, 1000);
        }}
      />
      <div className={"challenge "}>
      <span className={"input-frame " + calcChallengeColorClassName(state)}>

        <span className={"challengeSpan " + calcChallengeShowClassName(state)}>
          {state.goal}{" "}
          </span>
          </span>
      </div>
      <Picker
        gameState={state}
        onChoose={(gameState: GameState) => {
          setState(state => {
            return { ...state, answer: gameState.answer };
          });
          setState(evaluateAnswer);
        }}
      />
      <div className="stop"></div>
    </div>
  );
};
export default App;

function calcChallengeClassName(gameState: GameState): string {
  return calcChallengeColorClassName(gameState) + " " + calcChallengeShowClassName(gameState);
}

function calcChallengeShowClassName(gameState: GameState): string {
  if (
    gameState.state === StateEnum.PresentScore ||
    gameState.state === StateEnum.AwaitGo
  ) {
    return "show";
  } else if (gameState.state === StateEnum.Challenge) {
    return "show";
  }
  return "hide";
}
function calcChallengeColorClassName(gameState: GameState): string {
  if (
    gameState.state === StateEnum.PresentScore ||
    gameState.state === StateEnum.AwaitGo
  ) {
    if (gameState.score.lastStatus.status === PlayStatusEnum.Failure)
      return "incorrect";
    if (gameState.score.lastStatus.status === PlayStatusEnum.Success)
      return "correct";
  }
  return "";
}

