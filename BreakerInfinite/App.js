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
  StartMenu: 0,
  GameStart: 1,
  Playing: 2,
  GameOver: 3,
  Paused: 4
}
var gameState = GFSM.GameStart;

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
      position: 'absolute',
      top: paddle.pos.y,
      left: paddle.pos.x,
    },
    paddleInputArea: {
      width: width,
      height: paddle.size.y * 10,
      // backgroundColor: "#FFA500",
      position: 'absolute',
      top: paddle.pos.y - 200,
      left: 0
    },
    ball: {
      width: ball.size.x,
      height: ball.size.y,
      backgroundColor: "#FF0000",
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
  });
}
//#endregion
let counter = 0;
const brickMatrix = new BrickMatrix();
var matrixHasInit = false;
var score = 0;
var brickSpawnTime = 15000;
export default function App() {
  if (gameState == GFSM.GameOver) {
    //insert game over logic
  }
  //screen dimensions
  const { width, height } = useWindowDimensions();
  //#region States
  //PaddleX data as it will vary by moving it
  const [paddleX, setPaddleX] = useState(width / 2 - ((width * paddleSizeXCoeff) / 2));

  //Ball Position values in XY
  //bricks to be displayed
  const [bricks, setBricks] = useState(brickMatrix.bricks);
  //simple bool used to toggle re-render call 
  const [reRenderBricks, setReRenderBricks] = useState(false);
  // const [score,setScore] = useState(0);
  //simple bool used to toggle re-render call 
  const [reRenderScore, setReRenderScore] = useState(false);
  //#endregion

  //#region Starters & misc
  //starter stats for paddle
  const paddleStats = {
    positionXY: {
      x: paddleX,
      y: height - (height * paddleSizeYCoeff),
    },
    sizeXY: {
      x: width * paddleSizeXCoeff,
      y: height * paddleSizeYCoeff,
    },
    speed: 10
  }
  const ballStats = {
    positionXY: {
      x: width / 2 - ((width * paddleSizeXCoeff) / 2) + (width * ballSizeCoeff),
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
  var ball = new Ball(ballStats.sizeXY, ballStats.positionXY, { w: width, h: height }, ballStats.speed, paddle);
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

    if (brickMatrix.CanGenRow()) {
      if (gameState == GFSM.Playing) {
        AddBricks();
      }
    }
    else {
      gameState = GFSM.GameOver;
    }

    if (brickSpawnTime > 750) {
      brickSpawnTime *= brickDifficultyCoeff;
    }


    await delay(Math.round(brickSpawnTime));
    if (gameState == GFSM.Playing || gameState == GFSM.Paused) {
      TryAddBricks();
    }

  }
  function AddBricks() {

    brickMatrix.AddNewRow();
    setBricks(brickMatrix.bricks);
    setReRenderBricks(true);
    ball.UpdateBrickColliders(brickMatrix.bricks);
  }
  function startBallSim() {
    gameState = GFSM.Playing;
    ball.SetRandomUpDir();
    if (matrixHasInit) {
      TryAddBricks();
    }
    moveBallPos();
  }

  const ballAnimX = useRef(new Animated.Value(ball.pos.x)).current;
  const ballAnimY = useRef(new Animated.Value(ball.pos.y)).current;

  const moveBallPos = () => {

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
          gameState = GFSM.gameOver;
        }
        else {
          moveBallPos();
        }
      });

    }

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
        startBallSim();
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
                    backgroundColor: '#fff'
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
  let displayPause = () => {

    return (<TouchableOpacity style={styles.pauseButtonTO} onPressIn={onPausePressIn} activeOpacity={0.5}>
      <Image
        style={styles.pauseButtonIMG}
        source={require("./assets/pause.png")} />
    </TouchableOpacity>);
  }
  //#endregion
  //#region OnButtonPress functions
  let onPausePressIn = () => {
    
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
        <Animated.View style={[styles.ball, { top: ballAnimY, left: ballAnimX }]}></Animated.View>
        {/* Paddle is drawn above every other game object*/}
        <Animated.View style={styles.paddleInputArea}{...panResponder.panHandlers}>
        </Animated.View>
        <View style={styles.paddle}>
        </View>

        {/*View containing each UI element*/}
        {/*Render Pause Button*/}
        {displayPause()}
      </View>

      <StatusBar hidden />
    </SafeAreaView>

  );
}