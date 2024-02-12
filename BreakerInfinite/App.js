//refrences: 
// ReactNative documentation: https://reactnative.dev/
// For delay function: Etienne, Martin, Nov 24 2017, Stack Overflow, https://stackoverflow.com/questions/14226803/wait-5-seconds-before-executing-next-line
import { StatusBar } from 'expo-status-bar';
import {
  Button,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  Animated,
  PanResponder
} from 'react-native';

import { useWindowDimensions } from 'react-native';
import { Paddle } from './Paddle';
import { useState, useRef } from 'react';
import { Ball } from './Ball';
const title = "Breaker: Infinite";

const FPS = 60;
const DELTA = 1000 / FPS;

//Pseudo-enum with all game states
const GFSM = {
  StartMenu: 0,
  GameStart: 1,
  Playing: 2,
  GameOver: 3,
}
var gameState = GFSM.GameStart;
//What amount of the width of the screen is the paddle size, must be in range 0-1
const paddleSizeXCoeff = .3;
//What amount of the height of the screen is the paddle size, must be in range 0-1
const paddleSizeYCoeff = .04;
//Only 1 coeff for ball as it will be a circle
const ballSizeCoeff = .07;
//#region Stylesheet
function CreateStyles(width, height, paddle, pan, ball) {
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
    brick:
    {
      //tbd
    }
  });
}
//#endregion
let counter = 0;
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
    speed: 15,
    collidersArr: []
  }
  //#endregion

  //generate paddle
  var paddle = new Paddle(paddleStats.sizeXY, paddleStats.positionXY, paddleStats.speed, width);

  //generate ball
  var ball = new Ball(ballStats.sizeXY, ballStats.positionXY, ballStats.collidersArr, { w: width, h: height }, ballStats.speed, paddle);

  //#region Physics Functions
  function startBallSim() {
    gameState = GFSM.Playing;
    ball.SetRandomUpDir();

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
      ]).start(() => { ball.UpdateBrickColliders({ tag: "paddle", obj: paddle }); moveBallPos(); });

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

      </View>
    </SafeAreaView>

  );
}