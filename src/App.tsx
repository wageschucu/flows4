import React, { useState, ChangeEvent } from "react";
import "./App.css";
import cookieReader from "./cookie.reader"

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
  startInterval: number
  streekLength: number
  delta: number
  showType: ShowType
  input: InputType
  leavePickerOnScreen: boolean
  pickerLength:number
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

type Dictionary = {
  [key in string]: string 
}

type GameState = {
  profile: Profile,
  score: Score,
  parameters: GameParameters,
  display?: any,
  input?: any,
  goal?: Goal,
  goals: Goals,
  pickerChoices:Goals,
  answer?: Answer,
  state: StateEnum,
  text: Dictionary,
  currentTextName: string,
};

function presentScore(state: GameState) {
  state.state = StateEnum.PresentScore
  return awaitGo(state)
}
function awaitGo(state: GameState) {
  state.state = StateEnum.AwaitGo
  return { ...state }
}
function calcNextGoal(state: GameState) {
  state.state = StateEnum.CalcNextGoal

  console.log("calcNextGoal");
  if (state.score.streekAttempts >= state.parameters.streekLength) {
    if (state.score.streekScore >= (state.parameters.streekLength * 2.0) / 3) {
      advancePlayer(state)
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
  console.log("calcNextGoal1", state.goal)
  state.goal = generateGoal(state.goals)
  state.pickerChoices = generateChoices([...state.goals], state.goal, state.parameters.pickerLength)
  console.log("calcNextGoal2", state.goal)
  state.answer = undefined
  return { ...state }
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
  const index = Math.trunc(Math.random() * goals.length);
  return goals[index];
}
function shuffle(array:Goals) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

function generateChoices(array:Goals, goal:Goal, length:number) {
   // random selection lenght-1
   array = [...array]
   const index=array.indexOf(goal)
   array.splice(index,1)
   array = shuffle(array)
   array = array.slice(0,length-1)
   // add goal to list
   array.push(goal)   
   // noch mal schuffel 
  return shuffle(array)
}

const initGoals = ["de", "ne", "ja", "re", "ch","sp", "au", "ie", "ei", "eu", "ne", "en", "do", "zu", "ko", "ge", "be", "um", "me", "an", "ha", "in", "we", "ld", "ki"]

const initState: GameState = {
  parameters: {
    startInterval: 1000,
    streekLength: 3,
    delta: 0.2,
    showType: ShowType.Flash,
    input: InputType.Group,
    leavePickerOnScreen: false,
    pickerLength: 5
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
  pickerChoices: [],
  answer: undefined,
  state: StateEnum.PresentScore,
  text: {},
  currentTextName: ""
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
        {gameState.pickerChoices.map(goal => {
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

function saveGame(gameState: GameState) {
  const cookie = cookieReader.getCookie("gameState")
  const profiles = cookie ? JSON.parse(cookie) : {}
  profiles[gameState.profile.name] = gameState
  console.log("writing cookie:", JSON.stringify(gameState))
  cookieReader.setCookie("gameState", JSON.stringify(profiles), 100)
}

function loadGame(name?: string):GameState {
  const cookie = cookieReader.getCookie("gameState")
  initState.score.interval = initState.parameters.startInterval;
  if (!name) name = initState.profile.name;
  const profiles = cookie ? JSON.parse(cookie) : {};
  console.log("loaded profiles: ", profiles)
  if (!profiles[name]) {
    profiles[name] = initState;
  }
  console.log("loaded profile is: ", profiles[name])
  return profiles[name];
}

// TODO
// 1- text area, replace punct with space, split on white spaces, sort into length buckets 
// save to cookie: gameWordList
// at start, read gameWorkList to ? model variable 
// add parameter: word length:1,2,3,4...
// 2- edit mask for parameters with drop downs for enums 
// 3- prettify display and colors for olivia 

function loadWordList() {}

export const App: React.FC = () => {
  console.log("cookie:", cookieReader.getCookie("gameState"))
  const [state, setState] = useState(initState)
  console.log("render: state:", state);
  let disableGo = true;
  if (
    state.state === StateEnum.AwaitGo ||
    state.state === StateEnum.PresentScore
  )
    disableGo = false;

    const onChangeText = (event: ChangeEvent<HTMLTextAreaElement>) => {
      debugger
    }
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
      <div>
        <input
          type="button"
          value="Save"
          onClick={() => saveGame(state)}
        ></input>
        <input
          type="button"
          value="Load"
          onClick={() => setState(()=>loadGame())}
        ></input>
      </div>
      <h2 className="score">Score: {JSON.stringify(Math.round(state.parameters.startInterval-state.score.interval))}</h2>
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
          <span
            className={"challengeSpan " + calcChallengeShowClassName(state)}
          >
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
      <div className="loadarea">
        <input type="text" name="textname"  value={state.currentTextName} onChange={function(){
        }}/>
        <input type="button" value="save"/>
        <textarea name="text" onChange={onChangeText} value={state.text["test"]}>

        </textarea>
      </div>
      
    </div>
  );
};
export default App;


function calcChallengeClassName(gameState: GameState): string {
  return (
    calcChallengeColorClassName(gameState) +
    " " +
    calcChallengeShowClassName(gameState)
  );
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
  else if (gameState.state === StateEnum.CalcNextGoal ) {
      return "prompt"
  }
  return "";
}
