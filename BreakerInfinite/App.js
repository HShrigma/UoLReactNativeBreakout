//refrences: 
// ReactNative documentation: https://reactnative.dev/
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


//What amount of the width of the screen is the paddle size, must be in range 0-1
const paddleSizeXCoeff = .3;
//What amount of the height of the screen is the paddle size, must be in range 0-1
const paddleSizeYCoeff = .04;
//Only 1 coeff for ball as it will be a circle
const ballSizeCoeff = .05;
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
export default function App() {
  //screen dimensions
  const { width, height } = useWindowDimensions();
  //#region States
  //PaddleX data as it will vary by moving it
  const [paddleX, setPaddleX] = useState(width / 2 - ((width * paddleSizeXCoeff) / 2));
  const [ballPos, setBallPos] = useState({
    x: width / 2 - ((width * paddleSizeXCoeff) / 2) + (width * ballSizeCoeff),
    y: height - (height * paddleSizeYCoeff * 2) - (height * ballSizeCoeff)
  });
  //#endregion

  //  const { gameOver, setGameOver } = useState(false);
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
    speed: 2,
    collidersArr: []
  }
  //#endregion

  //generate paddle
  paddle = new Paddle(paddleStats.sizeXY, paddleStats.positionXY, paddleStats.speed, width);

  //generate ball
  ballStats.collidersArr.push(paddle);

  ball = new Ball(ballStats.sizeXY, ballStats.positionXY, ballStats.collidersArr, { w: width, h: height }, ballStats.speed);

  //#region Ball Physics Functions
  function startBallSim() {
    ball.StartSim();
  }
  //#endregion
  //#region Pan and panResponder for paddle movement
  const pan = useRef(new Animated.ValueXY()).current;
  const panResponder = useRef(PanResponder.create({
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: () => {
      pan.setOffset({ x: pan.x._value, y: pan.y._value });
      //on paddle move, game should start
      startBallSim();
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
        <View style={styles.ball}></View>
        <View style={styles.paddle}>
        </View>
        <Animated.View style={styles.paddleInputArea}{...panResponder.panHandlers}>
        </Animated.View>

      </View>
    </SafeAreaView>

  );
}