//refrences: 
// ReactNative documentation: https://reactnative.dev/
// For delay function: Etienne, Martin, Nov 24 2017, Stack Overflow, 
// https://stackoverflow.com/questions/14226803/wait-5-seconds-before-executing-next-line
import { StatusBar } from 'expo-status-bar';
import {
  Button,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  Animated,
  PanResponder,
  useWindowDimensions,
  TouchableOpacity, Image,
  Vibration
} from 'react-native';

import { useState, useRef } from 'react';

import { Paddle } from './Paddle';
import { Ball } from './Ball';
import { Brick } from './Brick';
import { BrickMatrix } from './BrickMatrix';

const title = "Breaker: Infinite";

const FPS = 60;
const DELTA = 1000 / FPS; //time for 1 frame in ms

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
      backgroundColor: "#fff",
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
      backgroundColor: "#fff",
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
      width:"102%",
      height:"102%",
      borderColor: "#d6d6d6",
      borderRadius: 20,
      borderWidth: 6,
    },
    SubMenuArea: {
      flex: 10
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
      width:"102%",
      height:"102%",
    }
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
  function OnBricksHit(i, j) {
    brickMatrix.bricks[i][j].renders = false;
    setReRenderBricks(true);
    ball.UpdateBrickColliders(brickMatrix.bricks);
    score += 5;
    setReRenderScore(true);
    Vibration.vibrate(100);
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
                    backgroundColor: "#fff",
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
          source={require("./assets/pause.png")} />
      </TouchableOpacity>);
    }
    if (gameState == GFSM.Paused) {
      return (<TouchableOpacity style={styles.resumeButtonTO} onPress={onResumePress} activeOpacity={0.5}>
        <Image
          style={styles.resumeButtonIMG}
          source={require("./assets/play.png")} />
      </TouchableOpacity>);
    }
  }
  let displayGameOver = (reRender) => {
    if (reRender) {
      setReRenderGameOver(false);
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
          High Score: {score}
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
      setReRenderMainMenu(false);
    }
    if (gameState == GFSM.MainMenu) {
      let touchables = [];
      touchables.push(
        <TouchableOpacity
          key={"menuSettings"}
          style={styles.MainMenuSettingsTO}
          onPress={onSettingsPress}
          activeOpacity={0.5}>
          <Image
            style={styles.MainMenuSettingsIMG}
            source={require("./assets/cog.png")} />
        </TouchableOpacity>);
      touchables.push(<TouchableOpacity
        key={"menuPlay"}
        style={styles.MainMenuPlayTO}
        onPress={onPlayPress}
        activeOpacity={0.5}>
        <Image
          style={styles.MainMenuPlayIMG}
          source={require("./assets/play.png")} />
      </TouchableOpacity>);
      touchables.push(<TouchableOpacity
        key={"menuSkins"}
        style={styles.MainMenuSkinsTO}
        onPress={onSkinsPress}
        activeOpacity={0.5}>
        <Image
          style={styles.MainMenuSkinsIMG}
          source={require("./assets/shop.png")} />
      </TouchableOpacity>);
      return touchables;
    }
  }
  let displaySettings = (reRender) => {
    if (reRender) {
      setReRenderSettings(false);
    }
    if (gameState == GFSM.Settings) {
      return (
        <View style={styles.SubMenu}>
          <View style={styles.SubMenuTitleBanner}>
            <Text style={styles.LargeText}>
              Settings
            </Text>
          </View>
          <View style={styles.SubMenuArea}>
          </View>
          <TouchableOpacity
            style={styles.BackButton}
            onPress={()=> {onBackPress(false)}}
            activeOpacity={0.5}>
            <Text style={styles.LargeText}>Back</Text>
          </TouchableOpacity>
        </View>);
    }
  }
  let displaySkins = (reRender) => {
    if (reRender) {
      setReRenderSkins(false);
    }
    if (gameState == GFSM.Skins) {
      return (
        <View style={styles.SubMenu}>
          <View style={styles.SubMenuTitleBanner}>
            <Text style={styles.LargeText}>
              Skins
            </Text>
          </View>
          <View style={styles.SubMenuArea}>
          </View>
          <TouchableOpacity
            style={styles.BackButton}
            onPress={()=> {onBackPress(false)}}
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
    if(fromSettings){
      setReRenderSettings(true);
    }
    else{
      setReRenderSkins(true);
    }
    setReRenderMainMenu(true);
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
        <Animated.View style={[styles.Ball, { top: ballAnimY, left: ballAnimX }]}></Animated.View>
        {/* Paddle is drawn above every other game object*/}
        <Animated.View style={styles.PaddleInputArea}{...panResponder.panHandlers}>
        </Animated.View>
        <View style={styles.paddle}>
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