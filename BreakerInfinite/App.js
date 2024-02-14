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
  useWindowDimensions
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

//paddle coeffs
const paddleSizeXCoeff = .3;
const paddleSizeYCoeff = .04;

//Only 1 coeff for ball as it will be a circle
const ballSizeCoeff = .06;
//brickCoeffs
const brickSizeXCoeff = .2;
const brickSizeYCoeff = .05;

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
  });
}
//#endregion
let counter = 0;
const brickMatrix = new BrickMatrix();
var matrixHasInit = false;
export default function App() {
  //screen dimensions
  const { width, height } = useWindowDimensions();
  //#region States
  //PaddleX data as it will vary by moving it
  const [paddleX, setPaddleX] = useState(width / 2 - ((width * paddleSizeXCoeff) / 2));

  //Ball Position values in XY
  const [ballPos, setBallPos] = useState({
    x: width / 2 - ((width * paddleSizeXCoeff) / 2) + (width * ballSizeCoeff),
    y: height - (height * paddleSizeYCoeff * 2) - (height * ballSizeCoeff)
  });
  const [bricks, setBricks] = useState(brickMatrix.bricks);
  //#endregion

  //#region Starters
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
    positionXY: ballPos,
    sizeXY: {
      x: width * ballSizeCoeff,
      y: width * ballSizeCoeff,
    },
    speed: 5,
    collidersArr: []
  }
  //test Brick dims
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
  //#endregion
  //#region PhysicsObjects
  //generate paddle
  var paddle = new Paddle(paddleStats.sizeXY, paddleStats.positionXY, paddleStats.speed, width);
  //generate ball
  var ball = new Ball(ballStats.sizeXY, ballStats.positionXY, ballStats.collidersArr, { w: width, h: height }, ballStats.speed, paddle);
  //brickMatrix
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
  //#region Physics Functions
  function AddBricks() {
    if (brickMatrix.CanGenRow()) {
      brickMatrix.AddNewRow();
      brickMatrix.AddNewRow();
      brickMatrix.AddNewRow();
      setBricks(brickMatrix.bricks);
    }
  }
  function startBallSim() {
    gameState = GFSM.Playing;
    ball.SetRandomUpDir();
    if (matrixHasInit) {
      AddBricks(brickMatrix.bricks);
    }
    moveBallPos();
  }

  const ballAnimX = useRef(new Animated.Value(ball.pos.x)).current;
  const ballAnimY = useRef(new Animated.Value(ball.pos.y)).current;

  const moveBallPos = () => {
    ball.Move();
    if (gameState == GFSM.Playing) {
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
        moveBallPos();
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
    onPanResponderRelease: () => { }
  })).current;
  //#endregion
  //#Brick Matrix Rendering
  let drawBrick = (brick,key) => {
    return (
      <View 
      key={key}
      style={{
        position: 'absolute',
        left: brick.pos.x,
        top: brick.pos.y,
        width: brickStats.sizeXY.x,
        height: brickStats.sizeXY.y,
        backgroundColor: '#fff'
      }}>
      </View>
    );
  }

  let drawMatrix = () => {
    renderBricks = [];
    if(matrixHasInit && bricks.length != 0){
      for (let i = 0; i < bricks.length; i++) {
        for (let j = 0; j < bricks[i].length; j++) {
          if(bricks[i][j].renders){
            key = i.toString()+j.toString();
            console.log(bricks[i][j],key);
            renderBricks.push(drawBrick(bricks[i][j],key)) ;          
          }
        }
      }
      console.log(renderBricks[0]);
      return renderBricks;
    }
 }

  //loading stylesheets in so they can make use of width/height dynamic dimensions
  const styles = CreateStyles(width, height, paddle, pan, ball);
  return (
    <SafeAreaView>
      <View style={styles.Background}>
        <Animated.View style={[styles.ball, { top: ballAnimY, left: ballAnimX }]}></Animated.View>
        <View style={styles.paddle}>
        </View>
        <Animated.View style={styles.paddleInputArea}{...panResponder.panHandlers}>
        </Animated.View>
        {drawMatrix()}
      </View>
    </SafeAreaView>

  );
}