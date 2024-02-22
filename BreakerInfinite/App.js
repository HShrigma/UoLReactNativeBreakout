//refrences: 
// ReactNative documentation: https://reactnative.dev/
// For delay function: Etienne, Martin, Nov 24 2017, Stack Overflow, 
// https://stackoverflow.com/questions/14226803/wait-5-seconds-before-executing-next-line
import { StatusBar } from 'expo-status-bar';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  Animated,
  PanResponder,
  useWindowDimensions,
  TouchableOpacity, Image,
  Vibration,
  FlatList
} from 'react-native';

import { useState, useRef } from 'react';

import AsyncStorage from '@react-native-async-storage/async-storage';



import { Paddle } from './Paddle';
import { Ball } from './Ball';
import { Brick } from './Brick';
import { BrickMatrix } from './BrickMatrix';
const title = "Breaker: Infinite";

const FPS = 60;
const DELTA = 1000 / FPS; //time for 1 frame in ms

//Image paths
const imgPathVibrationsOn = "./assets/userSettings/vibration-on.png";
const imgPathVibrationsOff = "./assets/userSettings/vibration-off.png";
const imgPathPause = "./assets/pause.png";
const imgPathPlay = "./assets/play.png";
const imgPathCog = "./assets/cog.png";
const imgPathShop = "./assets/shop.png";
const imgPathVolOn = "./assets/userSettings/volume-on.png";
const imgPathVolOff = "./assets/userSettings/volume-off.png";
const imgPathLock = "./assets/lock.png";
//Pseudo-enum with all game states
const GFSM = {
  MainMenu: 0,
  GameStart: 1,
  Playing: 2,
  GameOver: 3,
  Paused: 4,
  Settings: 5,
  Skins: 6
}
var gameState = GFSM.MainMenu;
//#region Physics objects coefficients

//all coeffs are multipliers applied to screenwidth/height
//i.e. coeffX = 0.05 == 5% screen width
//this is better when working with absolute positions
//other coeffs can be applied to numbers as % modifiers such as brickDifficulty Coeff;

//paddle coeffs
const paddleSizeXCoeff = .3;
const paddleSizeYCoeff = .04;

//Only 1 coeff for ball as it will be a circle
const ballSizeCoeff = .06;
//brickCoeffs
const brickSizeXCoeff = .2;
const brickSizeYCoeff = .05;
const brickDifficultyCoeff = .95;
//#endregion
//#region Stylesheet
function CreateStyles(width, height, paddle, pan, ball, brick) {
  return StyleSheet.create({
    Background: {
      width: width,
      height: "100%", //is 100% rather than height to remove white bar from screen bottom
      backgroundColor: '#000',
      alignItems: 'center',
      justifyContent: 'center',
    },
    paddle: {
      width: paddle.size.x,
      height: paddle.size.y,
      // backgroundColor: "#fff",
      borderColor: "#d6d6d6",
      borderWidth: 5,
      borderRadius: 25,
      position: 'absolute',
      top: paddle.pos.y,
      left: paddle.pos.x,
    },
    PaddleInputArea: {
      width: width,
      height: paddle.size.y * 10,
      position: 'absolute',
      top: paddle.pos.y - 200,
      left: 0
    },
    Ball: {
      width: ball.size.x,
      height: ball.size.y,
      borderColor: "#d6d6d6",
      borderWidth: 3,
      borderRadius: 25,
      position: 'absolute',
      top: ball.pos.y,
      left: ball.pos.x,
      borderRadius: 50
    },
    score: {
      fontSize: width / 3,
      color: "#707070",
      textAlign: 'center'
    },
    pauseButtonTO: {
      position: 'absolute',
      left: width - (width * 0.15),
      top: 0,
    },
    pauseButtonIMG: {
      position: 'absolute',
      width: width / 10,
      height: width / 10,
    },
    resumeButtonTO: {
      position: 'absolute',
      left: width / 2 - (width * 0.15),
      top: height / 2 + (width * 0.3),
    },
    resumeButtonIMG: {
      position: 'absolute',
      width: width * 0.3,
      height: width * 0.3,
    },
    GameOverMenu: {
      position: 'absolute',
      backgroundColor: "#4b5563",
      left: width * 0.1,
      top: height * 0.3,
      width: width * 0.8,
      height: height * 0.3,
      borderWidth: 8,
      borderColor: "#d6d6d6",
      borderRadius: 20,
      alignItems: 'flex-start',

    },
    LargeText: {
      flex: 1,
      color: "#fff",
      fontSize: Math.round(width / 15),
      alignSelf: 'center',
      textAlignVertical: 'center',
      fontWeight: '500',
      letterSpacing: 1.5
    },
    GameOverButtonRow: {
      flex: 2,
      flexDirection: 'row'
    },
    GameOverButton: {
      flex: 1,
      backgroundColor: "#6e7f96",
      margin: width * 0.04,
      textAlignVertical: 'center',
      verticalAlign: 'middle',
      borderWidth: 5,
      borderColor: "#d6d6d6",
      borderRadius: 20,
    },
    MainMenu: {
      position: "absolute",
      top: height * 0.4,
      left: width * 0.1,
      height: height * 0.6,
      width: width * 0.8,
      flexDirection: "row",
      alignItems: "center",
    },
    MainMenuTitle: {
      color: "#4b5563",
      position: "absolute",
      top: -height * 0.5,
      textAlign: "center",
      fontSize: Math.round(width *0.11),
      alignSelf: 'center',
      textAlignVertical: 'center',
      fontWeight: '800',
      letterSpacing: 1.5
    },
    MainMenuSettingsTO: {
      position: 'absolute',
      left: width * 0.1,
      top: height * 0.6,

    },
    MainMenuSettingsIMG: {
      position: 'absolute',
      width: width * 0.2,
      height: width * 0.2
    },
    MainMenuPlayTO: {
      position: 'absolute',
      left: width * 0.3,
      top: height * 0.4,

    },
    MainMenuPlayIMG: {
      position: 'absolute',
      width: width * 0.4,
      height: width * 0.4
    },
    MainMenuSkinsTO: {
      position: 'absolute',
      right: width * 0.27,
      top: height * 0.6,

    },
    MainMenuSkinsIMG: {
      position: 'absolute',
      width: width * 0.187,
      height: width * 0.2
    },
    SubMenu: {
      position: "absolute",
      backgroundColor: "#4b5563",
      borderColor: "#d6d6d6",
      borderWidth: 5,
      borderRadius: 20,
      left: width * 0.1,
      width: width * 0.8,
      top: height * 0.1,
      height: height * 0.8,
      justifyContent: 'center',
    },
    SubMenuTitleBanner: {
      flex: 1,
      color: "#fff",
      backgroundColor: "#4b5563",
      textAlign: "center",
      left: "-1%",
      top: "-1%",
      width: "102%",
      height: "102%",
      borderColor: "#d6d6d6",
      borderRadius: 20,
      borderWidth: 6,
    },
    BackButton: {
      flex: 1,
      backgroundColor: "#944b29",
      color: "#fff",
      borderColor: "#d6d6d6",
      borderRadius: 20,
      borderWidth: 6,
      left: "-1%",
      bottom: "-1%",
      width: "102%",
      height: "102%",
    },
    SubMenuArea: {
      flex: 10,
      alignItems: "center",
      flexDirection: "row",
    },

    SettingsBox: {
      flex: 1,
      backgroundColor: "#d6d6d6",
      borderColor: "#944b29",
      borderRadius: 20,
      borderWidth: 6,
      marginHorizontal: "1%"
    },
    SettingsBoxIMG: {
      alignSelf: "center",
      width: width * 0.122,
      height: width * 0.1,
      top: "-2%",
    },
    SettingsBoxIMGAlt: {
      alignSelf: "center",
      width: width * 0.1,
      height: width * 0.1,
      top: "-2%",
    },
    SettingsBoxLabel: {
      top: "-5%",
      textAlign: "center",
      fontSize: Math.round(width / 25),
      alignSelf: 'center',
      textAlignVertical: 'center',
      fontWeight: '500',
      letterSpacing: 1.5,
      color: "#fff",
    },
    SubMenuAreaSkins: {
      flex: 10,
      alignItems: "center",
    },
    SkinsContainer: {
      flex: 1,
      margin: "5%",
      padding: "1%",
      width: "90%",
      borderColor: "#d6d6d6",
      borderWidth: 5,
      borderRadius: 20,
    },
    SkinsContainerLabel: {
      top: "-20%",
      textAlign: "center",
      fontSize: Math.round(width / 25),
      alignSelf: 'center',
      textAlignVertical: 'center',
      fontWeight: '500',
      letterSpacing: 1.5,
      color: "#fff",
    },
    SkinsItem: {
      flex: 1,
      margin: width * 0.01,
      width: width * 0.5,
      alignContent: "center",
      verticalAlign: "middle",
      borderRadius: 20,
    },
    SkinsItemText: {
      flex: 1,
      color: "#000",
      fontSize: Math.round(width / 15),
      alignSelf: 'center',
      textAlignVertical: 'center',
      fontWeight: '500',
      letterSpacing: 1.5
    },
    SkinsItemLockIMG: {
      position: "absolute",
      width: width * 0.1,
      height: width * 0.11,
      top: "1%",
      left: "2%",
      opacity: 1,

    },
    SelectSkin: {
      flex: 1,
      width: "100%",
      backgroundColor: "#944b29",
      height: "4%",
      borderRadius: 20,
      borderTopLeftRadius: 0,
      borderTopRightRadius: 0,
      borderWidth: 5,
      borderColor: "#d6d6d6",
    },

  });
}
//#endregion
//#region  global Vars
let counter = 0;
const brickMatrix = new BrickMatrix();
var matrixHasInit = false;
var score = 0;
var initBrickSpawnTime = 15000;
var brickSpawnTime = 15000;
var ballHasInit = false;
var ball;
var bricksAdding = false;

var userSettings = {
  music: "",
  sound: "",
  vibrations: ""
}
var skins = {
  paddle: "#fff",
  ball: "#fff",
  brick: "#fff"
}
//#endregion
export default function App() {
  //screen dimensions
  const { width, height } = useWindowDimensions();
  const initPaddleX = width / 2 - ((width * paddleSizeXCoeff) / 2);
  const initBallPos = {
    x: width / 2 + (width * ballSizeCoeff),
    y: height - (height * paddleSizeYCoeff * 2) - (height * ballSizeCoeff)
  };
  //#region States
  //PaddleX data as it will vary by moving it
  const [paddleX, setPaddleX] = useState(initPaddleX);

  //Ball Position values in XY
  //bricks to be displayed
  const [bricks, setBricks] = useState(brickMatrix.bricks);
  //simple bool used to toggle re-render call 
  const [reRenderBricks, setReRenderBricks] = useState(false);
  // const [score,setScore] = useState(0);
  //simple bools used to toggle re-render call 
  const [reRenderScore, setReRenderScore] = useState(false);
  const [reRenderPause, setReRenderPause] = useState(false);
  const [reRenderGameOver, setReRenderGameOver] = useState(false);
  const [reRenderMainMenu, setReRenderMainMenu] = useState(true);
  const [reRenderSkins, setReRenderSkins] = useState(false);
  const [reRenderSettings, setReRenderSettings] = useState(false);
  //User Settings State
  const [soundOn, setSoundOn] = useState("");
  const [musicOn, setMusicOn] = useState("");
  const [vibrationsOn, setVibrationsOn] = useState("");
  //User High Score
  const [highScore, setHighScore] = useState("");
  //User Skin
  const [paddleSkin, setPaddleSkin] = useState("");
  const [ballSkin, setBallSkin] = useState("");
  const [brickSkin, setBrickSkin] = useState("");
  const [paddleSkinsStats, setPaddleSkinsStats] = useState([
    {
      name: "Default",
      color: "#fff",
      unlocked: "true",
      selected: "true"
    },
    {
      name: "Crimson",
      color: "#dc143c",
      unlocked: "true",
      selected: "false"
    },
    {
      name: "Slate Blue",
      color: "#6a5acd",
      unlocked: "false",
      selected: "false"
    },
    {
      name: "Olive",
      color: "#808000",
      unlocked: "false",
      selected: "false"
    },
    {
      name: "Gold",
      color: "#ffd700",
      unlocked: "false",
      selected: "false"
    }
  ]);
  const [ballSkinsStats, setBallSkinsStats] = useState([
    {
      name: "Default",
      color: "#fff",
      unlocked: "true",
      selected: "true"
    },
    {
      name: "Crimson",
      color: "#dc143c",
      unlocked: "false",
      selected: "false"
    },
    {
      name: "Slate Blue",
      color: "#6a5acd",
      unlocked: "false",
      selected: "false"
    },
    {
      name: "Olive",
      color: "#808000",
      unlocked: "false",
      selected: "false"
    },
    {
      name: "Gold",
      color: "#ffd700",
      unlocked: "false",
      selected: "false"
    }
  ]);
  const [brickSkinsStats, setBrickSkinsStats] = useState([
    {
      name: "Default",
      color: "#fff",
      unlocked: "true"
    },
    {
      name: "Crimson",
      color: "#dc143c",
      unlocked: "false"
    },
    {
      name: "Slate Blue",
      color: "#6a5acd",
      unlocked: "false"
    },
    {
      name: "Olive",
      color: "#808000",
      unlocked: "false"
    },
    {
      name: "Gold",
      color: "#ffd700",
      unlocked: "false"
    }
  ]);

  //#endregion
  //#region Async Storage
  let SavePaddleSkin = async (name, unlocked, selected) => {
    let key = "@Paddle" + name;
    let value = unlocked + "_" + selected;

    await AsyncStorage.setItem(key, value);

  }
  let SaveBallSkin = async (name, unlocked, selected) => {
    let key = "@Ball" + name;
    let value = unlocked + "_" + selected;
    await AsyncStorage.setItem(key, value);
  }
  let SaveBrickSkin = async (name, unlocked, selected) => {
    let key = "@Brick" + name;
    let value = unlocked + "_" + selected;
    await AsyncStorage.setItem(key, value);
  }
  let SaveHighScore = async (value) => {
    await AsyncStorage.setItem("@UserScore", value);
    setHighScore(value);
  }
  let SaveMusic = async (value) => {
    await AsyncStorage.setItem("@UserMusic", value);
    setMusicOn(value);
    userSettings.music = value;
  }
  let SaveSound = async (value) => {
    await AsyncStorage.setItem("@UserSound", value);
    setSoundOn(value);
    userSettings.sound = value;
  }
  let SaveVibrations = async (value) => {
    await AsyncStorage.setItem("@UserVibrations", value);
    setVibrationsOn(value);
    userSettings.vibrations = value;
  }

  let GetPaddleSkin = async (skin) => {
    let key = "@Paddle" + skin;
    let value = await AsyncStorage.getItem(key).catch((err) => { console.log("error getting paddle: " + err) })
    if (value == null) {
      //if null return initial value
      let i = 0;
      while (i < paddleSkinsStats.length) {
        if (paddleSkinsStats[i].name == skin) {
          break;
        }
        i++;
      }
      value = paddleSkinsStats[i].unlocked + "_" + paddleSkinsStats[i].selected;
      await SavePaddleSkin(skin, paddleSkinsStats[i].unlocked, paddleSkinsStats[i].selected);

    }
    else {
      // console.log("got paddle:" + value);
    }
    return value;
  }
  let GetBallSkin = async (skin) => {
    let key = "@Ball" + skin;
    let value = await AsyncStorage.getItem(key).catch((err) => { console.log("error getting ball: " + err) })
    if (value == null) {
      //if null return initial value
      let i = 0;
      while (i < ballSkinsStats.length) {
        if (ballSkinsStats[i].name == skin) {
          break;
        }
        i++;
      }
      value = ballSkinsStats[i].unlocked + "_" + ballSkinsStats[i].selected;
      await SaveBallSkin(skin, ballSkinsStats[i].unlocked, ballSkinsStats[i].selected);
    }
    else {
      // console.log("got ball:" + value);
    }
    return value;
  }
  let GetBrickSkin = async (skin) => {
    let key = "@Brick" + skin;
    let value = await AsyncStorage.getItem(key).catch((err) => { console.log("error getting brick: " + err) })
    if (value == null) {
      //if null return initial value
      let i = 0;
      while (i < brickSkinsStats.length) {
        if (brickSkinsStats[i].name == skin) {
          break;
        }
        i++;
      }
      value = brickSkinsStats[i].unlocked + "_" + brickSkinsStats[i].selected;
      await SaveBrickSkin(skin, brickSkinsStats[i].unlocked, brickSkinsStats[i].selected);
    }
    else {
      // console.log("got brick:" + value);
    }
    return value;
  }

  let GetHighScore = async () => {
    let value = await AsyncStorage.getItem("@UserScore").catch((err) => { console.log("error getting score: " + err) })
    if (value == null) {
      // console.log("null");
      await SaveHighScore(score.toString());
      value = score.toString();
    }
    else {
      // console.log("got score:" + value);
    }
    return value;
  }
  let GetMusic = async () => {
    let value = await AsyncStorage.getItem("@UserMusic").catch((err) => { console.log("error getting music: " + err) })
    if (value == null) {
      // console.log("null");
      await SaveMusic("true");
      value = "true";
    }
    else {
      // console.log("got music:" + value);
    }
    return value;
  }
  let GetSound = async () => {
    let value = await AsyncStorage.getItem("@UserSound").catch((err) => { console.log("error getting sound: " + err) })
    if (value == null) {
      // console.log("null");
      await SaveSound("true");
      value = "true";
    }
    else {
      // console.log("got sound:" + value);
    }
    return value;
  }
  let GetVibration = async () => {
    let value = await AsyncStorage.getItem("@UserVibrations").catch((err) => { console.log("error getting vibs: " + err) })
    if (value == null) {
      // console.log("null");
      await SaveVibrations("true");
      value = "true";
    }
    else {
      // console.log("got vibrations:" + value);
    }
    return value;
  }
  let GetAllKeys = async () => {
    let keys = []
    try {
      keys = await AsyncStorage.getAllKeys()
    } catch (e) {
      // read key error
    }

    console.log(keys);
  }
  //init values
  let initUserSkins = async () => {
    await UpdatePaddleSkinStats();
    await UpdateBallSkinStats();
    await UpdateBrickSkinStats();
    // await GetAllKeys();
  }

  let UpdatePaddleSkinStats = async () => {
    let skinStats = [];
    for (let i = 0; i < paddleSkinsStats.length; i++) {
      let value = (await GetPaddleSkin(paddleSkinsStats[i].name)).split("_");
      var obj = {
        name: paddleSkinsStats[i].name,
        color: paddleSkinsStats[i].color,
        unlocked: value[0],
        selected: value[1]
      }
      skinStats.push(obj);
      if (value[1] == "true") {
        skins.paddle = paddleSkinsStats[i].color;
        await setPaddleSkin(skins.paddle);
      }
    }
    await setPaddleSkinsStats(skinStats);
    for (let i = 0; i < paddleSkinsStats.length; i++) {
      if (paddleSkinsStats[i].selected != skinStats[i].selected || paddleSkinsStats[i].unlocked != skinStats[i].unlocked) {
        paddleSkinsStats[i].selected = skinStats[i].selected;
        paddleSkinsStats[i].unlocked = skinStats[i].unlocked;
      }
    }
  }

  let UpdateBallSkinStats = async () => {
    let skinStats = [];
    for (let i = 0; i < ballSkinsStats.length; i++) {
      let value = (await GetBallSkin(ballSkinsStats[i].name)).split("_");
      var obj = {
        name: ballSkinsStats[i].name,
        color: ballSkinsStats[i].color,
        unlocked: value[0],
        selected: value[1]
      }
      skinStats.push(obj);
      if (value[1] == "true") {
        skins.ball = ballSkinsStats[i].color;
        await setBallSkin(skins.ball);
      }
    }
    await setBallSkinsStats(skinStats);
    for (let i = 0; i < ballSkinsStats.length; i++) {
      if (ballSkinsStats[i].selected != skinStats[i].selected || ballSkinsStats[i].unlocked != skinStats[i].unlocked) {
        ballSkinsStats[i].selected = skinStats[i].selected;
        ballSkinsStats[i].unlocked = skinStats[i].unlocked;
      }
    }
  }
  let UpdateBrickSkinStats = async () => {
    let skinStats = [];
    for (let i = 0; i < brickSkinsStats.length; i++) {
      let value = (await GetBrickSkin(brickSkinsStats[i].name)).split("_");
      var obj = {
        name: brickSkinsStats[i].name,
        color: brickSkinsStats[i].color,
        unlocked: value[0],
        selected: value[1]
      }
      skinStats.push(obj);
      if (value[1] == "true") {
        skins.brick = brickSkinsStats[i].color;
        await setBrickSkin(skins.brick);
      }
    }
    await setBrickSkinsStats(skinStats);
    for (let i = 0; i < brickSkinsStats.length; i++) {
      if (brickSkinsStats[i].selected != skinStats[i].selected || brickSkinsStats[i].unlocked != skinStats[i].unlocked) {
        brickSkinsStats[i].selected = skinStats[i].selected;
        brickSkinsStats[i].unlocked = skinStats[i].unlocked;
      }
    }
  }

  let SelectPaddleSkin = async (skin) => {
    for (let i = 0; i < paddleSkinsStats.length; i++) {
      if (paddleSkinsStats[i].selected == "true") {
        await SavePaddleSkin(paddleSkinsStats[i].name, "true", "false");
        break;
      }
    }
    await SavePaddleSkin(skin, "true", "true");
    await UpdatePaddleSkinStats();
  }

  let SelectBallSkin = async (skin) => {
    for (let i = 0; i < ballSkinsStats.length; i++) {
      if (ballSkinsStats[i].selected == "true") {
        await SaveBallSkin(ballSkinsStats[i].name, "true", "false");
        break;
      }
    }
    await SaveBallSkin(skin, "true", "true");
    await UpdateBallSkinStats();
  }

  let SelectBrickSkin = async (skin) => {
    for (let i = 0; i < brickSkinsStats.length; i++) {
      if (brickSkinsStats[i].selected == "true") {
        await SaveBrickSkin(brickSkinsStats[i].name, "true", "false");
        break;
      }
    }
    await SaveBrickSkin(skin, "true", "true");
    await UpdateBrickSkinStats();
  }

  let unlockPaddleSkin = async (skin) => {
    await SavePaddleSkin(skin, "true", "false");
    await UpdatePaddleSkinStats();
  }

  let UnlockBallSkin = async (skin) => {
    await SaveBallSkin(skin, "true", "false");
    await UpdateBallSkinStats();
  }
  let UnlockBrickSkin = async (skin) => {
    await SaveBrickSkin(skin, "true", "false");
    await UpdateBrickSkinStats();
  }
  let initUserSettings = async () => {
    let hScore = await GetHighScore();
    setHighScore(hScore);
    let music = await GetMusic();
    setMusicOn(music);
    let sound = await GetSound();
    setSoundOn(sound);
    let vibs = await GetVibration();
    setVibrationsOn(vibs);
    userSettings.music = music;
    userSettings.sound = sound;
    userSettings.vibrations = vibs;
  }

  //#endregion
  //#region Starters & misc
  //starter stats for paddle
  const paddleStats = {
    positionXY: {
      x: paddleX,
      y: height - (height * paddleSizeYCoeff * 2),
    },
    sizeXY: {
      x: width * paddleSizeXCoeff,
      y: height * paddleSizeYCoeff,
    },
    speed: 10
  }
  const ballStats = {
    positionXY: {
      x: width / 2 + (width * ballSizeCoeff),
      y: height - (height * paddleSizeYCoeff * 2) - (height * ballSizeCoeff)
    },
    sizeXY: {
      x: width * ballSizeCoeff,
      y: width * ballSizeCoeff,
    },
    speed: 5
  }
  //Brick dims
  const brickStats = {
    sizeXY: {
      x: width * brickSizeXCoeff,
      y: height * brickSizeYCoeff
    },
    posXY: {
      x: width / 2,
      y: height / 2
    }
  }
  //misc i.e. helper functions and vars
  //delay function, not mine, see references line 0
  const delay = ms => new Promise(res => setTimeout(res, ms));
  //#endregion
  //#region PhysicsObjects
  //generate paddle
  var paddle = new Paddle(paddleStats.sizeXY, paddleStats.positionXY, paddleStats.speed, width);
  //generate ball
  if (!ballHasInit) {
    ball = new Ball(ballStats.sizeXY, ballStats.positionXY, { w: width, h: height }, ballStats.speed, paddle);
    ballHasInit = true;
  }
  // Init brickMatrix
  if (!matrixHasInit) {
    let maxWH = {
      w: width,
      h: height
    };
    let brickSizeXY = brickStats.sizeXY;
    brickMatrix.Init(maxWH, brickSizeXY);
    matrixHasInit = true;
  }

  //#endregion
  //#region Physics & Game Functions
  async function OnBricksHit(i, j) {
    brickMatrix.bricks[i][j].renders = false;
    setReRenderBricks(true);
    ball.UpdateBrickColliders(brickMatrix.bricks);
    score += 5;
    setReRenderScore(true);
    if (userSettings.vibrations != "true" && userSettings.vibrations != "false") {
      await initUserSettings();
    }
    if (userSettings.vibrations == "true") {
      Vibration.vibrate(100);
    }
  }
  async function TryAddBricks() {
    bricksAdding = true;
    if (brickMatrix.CanGenRow()) {
      if (gameState == GFSM.Playing) {
        AddBricks();

        if (brickSpawnTime > 750) {
          brickSpawnTime *= brickDifficultyCoeff;
        }
      }
    }
    else {
      gameState = GFSM.GameOver;
      setReRenderGameOver(true);
    }

    await delay(Math.round(brickSpawnTime));
    TryAddBricks();

  }
  function AddBricks() {

    brickMatrix.AddNewRow();
    setBricks(brickMatrix.bricks);
    setReRenderBricks(true);
    ball.UpdateBrickColliders(brickMatrix.bricks);
  }
  function StartBallSim() {
    gameState = GFSM.Playing;
    ball.SetRandomUpDir();
    if (matrixHasInit && !bricksAdding) {
      TryAddBricks();
    }
    moveBallPos();
  }

  const ballAnimX = useRef(new Animated.Value(ball.pos.x)).current;
  const ballAnimY = useRef(new Animated.Value(ball.pos.y)).current;

  const moveBallPos = async () => {
    if (gameState == GFSM.Playing) {
      let collIndexes = ball.Move();
      Animated.parallel([
        Animated.timing(ballAnimX, {
          toValue: ball.pos.x,
          duration: DELTA,
          useNativeDriver: false
        }),
        Animated.timing(ballAnimY, {
          toValue: ball.pos.y,
          duration: DELTA,
          useNativeDriver: false
        })
      ]).start(() => {
        //update ball collision with bricks
        if (collIndexes != "none") {
          OnBricksHit(collIndexes[0], collIndexes[1]);
        }
        if (ball.gameOver) {


          gameState = GFSM.GameOver;
          setReRenderGameOver(true);
        }
        else {
          moveBallPos();
        }
      });
    }
    if (gameState == GFSM.Paused) {
      await delay(DELTA);
      moveBallPos();
    }

  }
  function RestartGame() {
    brickSpawnTime = initBrickSpawnTime;
    brickMatrix.Flush();
    setPaddleX(initPaddleX);

    ball.pos = initBallPos;
    ballStats.positionXY = initBallPos;
    ballAnimX.setValue(ball.pos.x);
    ballAnimY.setValue(ball.pos.y);
    ball.gameOver = false;
    ball.speed = ballStats.speed;
    ball.UpdateBrickColliders(brickMatrix.bricks);
    ball.mag = 1;
    score = 0;

    gameState = GFSM.GameStart;
  }
  //#endregion
  //#region Pan and panResponder for paddle movement
  const pan = useRef(new Animated.ValueXY()).current;



  const panResponder = useRef(PanResponder.create({
    onMoveShouldSetPanResponder: () => {
      if (gameState == GFSM.GameStart || gameState == GFSM.Playing) {
        return true;
      }
    },
    onPanResponderGrant: () => {
      pan.setOffset({ x: pan.x._value, y: pan.y._value });
      //on paddle move, game should start only if this is the gamestart state
      if (gameState == GFSM.GameStart) {
        StartBallSim();
      }
    },
    onPanResponderMove: Animated.event([
      null,
      { dx: pan.x, dy: pan.y },
    ], {
      useNativeDriver: false,
      listener: (event, gestureState) => {

        let touches = event.nativeEvent.touches;
        //abs position = touches[0].locationX
        //rel position(0 starts at width/2) = pan.x._value
        paddle.onTouchHeldEvent(pan.x._value);
        setPaddleX(paddle.pos.x);
        //update paddle collider in ball
        ball.UpdatePaddleCollider(paddle);
      }
    }),
    onPanResponderRelease: () => { setBricks(brickMatrix.bricks); }
  })).current;
  //#endregion
  //#region Brick Matrix Rendering

  let drawMatrix = (reRender = false) => {
    if (gameState == GFSM.Playing || gameState == GFSM.GameStart || gameState == GFSM.Paused) {
      if (reRender != false) {
        setReRenderBricks(false);
      }
      renderBricks = [];
      if (matrixHasInit && bricks.length != 0) {
        for (let i = 0; i < bricks.length; i++) {
          for (let j = 0; j < bricks[i].length; j++) {
            if (brickMatrix.bricks[i][j].renders) {
              key = i.toString() + j.toString();
              renderBricks.push((
                <View
                  key={key}
                  style={{
                    position: 'absolute',
                    left: bricks[i][j].pos.x,
                    top: bricks[i][j].pos.y,
                    width: bricks[i][j].size.x,
                    height: bricks[i][j].size.y,
                    borderRadius: 10,
                    backgroundColor: skins.brick,
                    borderColor: "#d6d6d6",
                    borderWidth: 5,
                    borderRadius: 10,
                  }}>
                </View>
              ));
            }
          }
        }
        return renderBricks;
      }
    }

  }
  //#endregion

  //loading stylesheets in so they can make use of width/height dynamic dimensions
  const styles = CreateStyles(width, height, paddle, pan, ball);
  //#region Dynamic elements rendering
  let displayScore = (reRender) => {
    if (reRender == true) {
      setReRenderScore(false);
    }
    return (<Text style={styles.score}>{score}</Text>)
  }
  let displayPauseResume = (reRender) => {
    if (reRender) {
      setReRenderPause(false);
    }
    if (gameState == GFSM.Playing) {
      return (<TouchableOpacity style={styles.pauseButtonTO} onPress={onPausePress} activeOpacity={0.5}>
        <Image
          style={styles.pauseButtonIMG}
          source={require(imgPathPause)} />
      </TouchableOpacity>);
    }
    if (gameState == GFSM.Paused) {
      return (<TouchableOpacity style={styles.resumeButtonTO} onPress={onResumePress} activeOpacity={0.5}>
        <Image
          style={styles.resumeButtonIMG}
          source={require(imgPathPlay)} />
      </TouchableOpacity>);
    }
  }
  let displayGameOver = (reRender) => {
    if (reRender) {
      setReRenderGameOver(false);
      if (score > Number(highScore)) {
        setHighScore(score.toString());
        SaveHighScore(score.toString());
      }
    }
    if (gameState == GFSM.GameOver) {
      return (<View style={styles.GameOverMenu}>
        <Text style={styles.LargeText}>
          Game Over!
        </Text>
        <Text style={styles.LargeText}>
          Score: {score}
        </Text>
        <Text style={styles.LargeText}>
          High Score: {highScore}
        </Text>
        <View style={styles.GameOverButtonRow}>
          <TouchableOpacity
            style={styles.GameOverButton}
            onPress={onRestartPress}>
            <Text style={styles.LargeText}>
              Restart
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.GameOverButton}
            onPress={onMainMenuPress}>
            <Text style={styles.LargeText}>
              Menu
            </Text>
          </TouchableOpacity>
        </View>
      </View>);

    }
  }
  let displayMainMenu = (reRender) => {
    if (reRender) {
      if (musicOn == "" || soundOn == "" || vibrationsOn == "") {
        initUserSettings();
      }
      if (ballSkin == "") {
        UpdateBallSkinStats();
      }
      if (paddleSkin == "") {
        UpdatePaddleSkinStats();
      }
      if (brickSkin == "") {
        UpdateBrickSkinStats();
      }
      setReRenderMainMenu(false);
    }
    if (gameState == GFSM.MainMenu) {
      let touchables = [];
      touchables.push(<View key={"title"}>
        <Text style={styles.MainMenuTitle}>{title}</Text>
      </View>)
      touchables.push(
        <TouchableOpacity
          key={"menuSettings"}
          style={styles.MainMenuSettingsTO}
          onPress={onSettingsPress}
          activeOpacity={0.5}>
          <Image
            style={styles.MainMenuSettingsIMG}
            source={require(imgPathCog)} />
        </TouchableOpacity>);
      touchables.push(<TouchableOpacity
        key={"menuPlay"}
        style={styles.MainMenuPlayTO}
        onPress={onPlayPress}
        activeOpacity={0.5}>
        <Image
          style={styles.MainMenuPlayIMG}
          source={require(imgPathPlay)} />
      </TouchableOpacity>);
      touchables.push(<TouchableOpacity
        key={"menuSkins"}
        style={styles.MainMenuSkinsTO}
        onPress={onSkinsPress}
        activeOpacity={0.5}>
        <Image
          style={styles.MainMenuSkinsIMG}
          source={require(imgPathShop)} />
      </TouchableOpacity>);
      return touchables;
    }
  }
  let displaySettings = (reRender) => {
    if (reRender) {
      setReRenderSettings(false);
      initUserSettings();
    }
    if (gameState == GFSM.Settings) {
      //logic for sound,music,vibrations user settings
      let vibrationButton = () => {
        if (vibrationsOn == "true") {
          return (<Image style={styles.SettingsBoxIMGAlt} source={require(imgPathVibrationsOn)} />);
        }
        return (<Image style={styles.SettingsBoxIMGAlt} source={require(imgPathVibrationsOff)} />);
      };
      let musicButton = () => {
        if (musicOn == "true") {
          return (<Image style={styles.SettingsBoxIMG} source={require(imgPathVolOn)} />);
        }
        return (<Image style={styles.SettingsBoxIMG} source={require(imgPathVolOff)} />);
      };
      let soundButton = () => {
        if (soundOn == "true") {
          return (<Image style={styles.SettingsBoxIMG} source={require(imgPathVolOn)} />);
        }
        return (<Image style={styles.SettingsBoxIMG} source={require(imgPathVolOff)} />);
      };
      return (
        <View style={styles.SubMenu}>
          <View style={styles.SubMenuTitleBanner}>
            <Text style={styles.LargeText}>
              Settings
            </Text>
          </View>
          <View style={styles.SubMenuArea}>
            <TouchableOpacity
              style={styles.SettingsBox}
              onPress={onToggleMusicPress}
              activeOpacity={0.5}>
              <Text style={styles.SettingsBoxLabel}>Music</Text>
              {musicButton()}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.SettingsBox}
              onPress={onToggleSoundPress}
              activeOpacity={0.5}>
              <Text style={styles.SettingsBoxLabel}>Sound</Text>
              {soundButton()}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.SettingsBox}
              onPress={onToggleVibrationsPress}
              activeOpacity={0.5}>
              <Text style={styles.SettingsBoxLabel}>Vibration</Text>
              {vibrationButton()}
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={styles.BackButton}
            onPress={() => { onBackPress(false) }}
            activeOpacity={0.5}>
            <Text style={styles.LargeText}>Back</Text>
          </TouchableOpacity>
        </View>);
    }
  }
  let displaySkins = (reRender) => {
    if (reRender) {
      setReRenderSkins(false);
      initUserSkins();
    }
    if (gameState == GFSM.Skins) {
      return (
        <View style={styles.SubMenu}>
          <View style={styles.SubMenuTitleBanner}>
            <Text style={styles.LargeText}>
              Skins
            </Text>
          </View>
          <View style={styles.SubMenuAreaSkins}>
            <View style={styles.SkinsContainer}>
              <Text style={styles.SkinsContainerLabel}>Paddle Skins</Text>
              <FlatList
                horizontal
                data={paddleSkinsStats}
                renderItem={({ item }) => {
                  if (item.unlocked == "true") {
                    if (item.selected == "true") {
                      return (
                        <View style={[styles.SkinsItem, { backgroundColor: item.color }]}>
                          <Text style={styles.SkinsItemText}>{item.name}</Text>
                          <View style={[styles.SelectSkin, { backgroundColor: "#ffd700" }]}>
                            <Text style={styles.LargeText}>Selected</Text>
                          </View>
                        </View>
                      );

                    }
                    else {
                      return (
                        <View style={[styles.SkinsItem, { backgroundColor: item.color }]}>
                          <Text style={styles.SkinsItemText}>{item.name}</Text>
                          <TouchableOpacity
                            onPress={() => { onSelectSkinPaddle(item.name) }}
                            style={styles.SelectSkin}>
                            <Text style={styles.LargeText}>Select</Text>
                          </TouchableOpacity>
                        </View>
                      );

                    }
                  }
                  else {
                    return (
                      <View style={[styles.SkinsItem, { backgroundColor: item.color }]}>
                        <Text style={styles.SkinsItemText}>{item.name}</Text>
                        <TouchableOpacity
                          onPress={() => { onUnlockSkinPaddle(item.name) }}
                          style={[styles.SelectSkin,
                          { backgroundColor: "#D5D8DC", borderColor: "#fff" }]}>
                          <Text style={styles.LargeText}>$Unlock</Text>
                        </TouchableOpacity>
                        <Image style={styles.SkinsItemLockIMG} source={require(imgPathLock)} />
                      </View>

                    );
                  }
                }}
              />
            </View>
            <View style={styles.SkinsContainer}>
              <Text style={styles.SkinsContainerLabel}>Ball Skins</Text>
              <FlatList
                horizontal
                data={ballSkinsStats}
                renderItem={({ item }) => {
                  if (item.unlocked == "true") {
                    if (item.selected == "true") {
                      return (
                        <View style={[styles.SkinsItem, { backgroundColor: item.color }]}>
                          <Text style={styles.SkinsItemText}>{item.name}</Text>
                          <View style={[styles.SelectSkin, { backgroundColor: "#ffd700" }]}>
                            <Text style={styles.LargeText}>Selected</Text>
                          </View>
                        </View>
                      );

                    }
                    else {
                      return (
                        <View style={[styles.SkinsItem, { backgroundColor: item.color }]}>
                          <Text style={styles.SkinsItemText}>{item.name}</Text>
                          <TouchableOpacity
                            onPress={() => { onSelectSkinBall(item.name) }}
                            style={styles.SelectSkin}>
                            <Text style={styles.LargeText}>Select</Text>
                          </TouchableOpacity>
                        </View>
                      );

                    }
                  }
                  else {
                    return (
                      <View style={[styles.SkinsItem, { backgroundColor: item.color }]}>
                        <Text style={styles.SkinsItemText}>{item.name}</Text>
                        <TouchableOpacity
                          onPress={() => { onUnlockSkinBall(item.name) }}
                          style={[styles.SelectSkin, { backgroundColor: "#D5D8DC", borderColor: "#fff" }]}>
                          <Text style={styles.LargeText}>$Unlock</Text>
                        </TouchableOpacity>
                        <Image style={styles.SkinsItemLockIMG} source={require(imgPathLock)} />
                      </View>

                    );
                  }
                }}
              />
            </View>
            <View style={styles.SkinsContainer}>
              <Text style={styles.SkinsContainerLabel}>Brick Skins</Text>
              <FlatList
                horizontal
                data={brickSkinsStats}
                renderItem={({ item }) => {
                  if (item.unlocked == "true") {
                    if (item.selected == "true") {
                      return (
                        <View style={[styles.SkinsItem, { backgroundColor: item.color }]}>
                          <Text style={styles.SkinsItemText}>{item.name}</Text>
                          <View style={[styles.SelectSkin, { backgroundColor: "#ffd700" }]}>
                            <Text style={styles.LargeText}>Selected</Text>
                          </View>
                        </View>
                      );

                    }
                    else {
                      return (
                        <View style={[styles.SkinsItem, { backgroundColor: item.color }]}>
                          <Text style={styles.SkinsItemText}>{item.name}</Text>
                          <TouchableOpacity
                            onPress={() => { onSelectSkinBrick(item.name) }}
                            style={styles.SelectSkin}>
                            <Text style={styles.LargeText}>Select</Text>
                          </TouchableOpacity>
                        </View>
                      );

                    }
                  }
                  else {
                    return (
                      <View style={[styles.SkinsItem, { backgroundColor: item.color }]}>
                        <Text style={styles.SkinsItemText}>{item.name}</Text>
                        <TouchableOpacity
                          onPress={() => { onUnlockSkinBrick(item.name) }}
                          style={[styles.SelectSkin, { backgroundColor: "#D5D8DC", borderColor: "#fff" }]}>
                          <Text style={styles.LargeText}>$Unlock</Text>
                        </TouchableOpacity>
                        <Image style={styles.SkinsItemLockIMG} source={require(imgPathLock)} />
                      </View>

                    );
                  }
                }}
              />
            </View>
          </View>
          <TouchableOpacity
            style={styles.BackButton}
            onPress={() => { onBackPress(false) }}
            activeOpacity={0.5}>
            <Text style={styles.LargeText}>Back</Text>
          </TouchableOpacity>
        </View>);
    }
  }
  //#endregion
  //#region OnButtonPress functions
  let onPausePress = () => {
    gameState = GFSM.Paused;
    setReRenderPause(true);
  }
  let onResumePress = () => {
    gameState = GFSM.Playing;
    setReRenderPause(true);
  }
  let onRestartPress = () => {
    setReRenderGameOver(true);
    RestartGame();
  }
  let onMainMenuPress = () => {
    gameState = GFSM.MainMenu;
    setReRenderGameOver(true);
  }
  let onPlayPress = () => {
    if (bricksAdding) {
      RestartGame();
    }
    else {
      gameState = GFSM.GameStart;
    }
    setReRenderMainMenu(true);
  }
  let onSettingsPress = () => {
    gameState = GFSM.Settings;
    setReRenderMainMenu(true);
    setReRenderSettings(true);
  }
  let onSkinsPress = () => {
    gameState = GFSM.Skins;
    setReRenderMainMenu(true);
    setReRenderSkins(true);
  }
  let onBackPress = (fromSettings) => {
    gameState = GFSM.MainMenu;
    if (fromSettings) {
      setReRenderSettings(true);
    }
    else {
      setReRenderSkins(true);
    }
    setReRenderMainMenu(true);
  }

  let onToggleSoundPress = () => {
    if (soundOn == "true") {
      SaveSound("false");
    }
    else {
      SaveSound("true");
    }
    setReRenderSettings(true);
  }
  let onToggleMusicPress = () => {
    if (musicOn == "true") {
      SaveMusic("false");
    }
    else {
      SaveMusic("true");
    }
    setReRenderSettings(true);
  }
  let onToggleVibrationsPress = () => {
    if (vibrationsOn == "true") {
      SaveVibrations("false");
    }
    else {
      SaveVibrations("true");
      Vibration.vibrate(100);
    }
    setReRenderSettings(true);
  }

  let onSelectSkinPaddle = async (name) => {
    await SelectPaddleSkin(name);
    setReRenderSkins(true);
  }
  let onUnlockSkinPaddle = async (name) => {
    await unlockPaddleSkin(name);
    setReRenderSkins(true);

  }
  let onSelectSkinBall = async (name) => {
    await SelectBallSkin(name);
    setReRenderSkins(true);
  }
  let onUnlockSkinBall = async (name) => {
    await UnlockBallSkin(name);
    setReRenderSkins(true);

  }
  let onSelectSkinBrick = async (name) => {
    await SelectBrickSkin(name);
    setReRenderSkins(true);
  }
  let onUnlockSkinBrick = async (name) => {
    await UnlockBrickSkin(name);
    setReRenderSkins(true);

  }

  //#endregion
  return (
    <SafeAreaView>
      {/*View containing each game object*/}
      <View style={styles.Background}>
        {/*First draw bricks */}
        {drawMatrix(reRenderBricks)}
        {/*Draw Score over bricks so they don't cover it*/}
        {displayScore(reRenderScore)}
        {/*Ball Should be displayed over bricks and score */}
        <Animated.View style={[styles.Ball, { backgroundColor: skins.ball, top: ballAnimY, left: ballAnimX }]}></Animated.View>
        {/* Paddle is drawn above every other game object*/}
        <Animated.View style={styles.PaddleInputArea}{...panResponder.panHandlers}>
        </Animated.View>
        <View style={[styles.paddle, { backgroundColor: skins.paddle }]}>
        </View>
        {/*Render Pause Button*/}
        {displayPauseResume(reRenderPause)}
        {/*Render Game Over Menu */}
        {displayGameOver(reRenderGameOver)}
        {/*Render Main Menu Buttons */}
        {displayMainMenu(reRenderMainMenu)}
        {/*Render Settings Menu */}
        {displaySettings(reRenderSettings)}
        {/*Render Skins Menu */}
        {displaySkins(reRenderSkins)}
      </View>
      <StatusBar hidden />
    </SafeAreaView>

  );
}