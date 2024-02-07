import { StatusBar } from 'expo-status-bar';
import { Button, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { useWindowDimensions } from 'react-native';
import { Paddle } from './Paddle';
import { useState } from 'react';
//import {Ball} from './Ball';
const title = "Breaker: Infinite";

const FPS = 60;
const DELTA = 1000 / FPS;
//What amount of the width of the screen is the paddle size, must be in range 0-1
const paddleSizeXCoeff = .3;
//What amount of the height of the screen is the paddle size, must be in range 0-1
const paddleSizeYCoeff = .04;

function CreateStyles(width, height, paddleStats) {
  return StyleSheet.create({
    Background: {
      width: width,
      height: "100%", //is 100% rather than height to remove white bar from screen bottom
      backgroundColor: '#000',
      alignItems: 'center',
      justifyContent: 'center',
    },
    paddle: {
      width: paddleStats.sizeXY.x,
      height: paddleStats.sizeXY.y,
      backgroundColor: "#fff",
      position: 'absolute',
      bottom: paddleStats.positionXY.y,
      left: paddleStats.positionXY.x
    },
    ball: {
      width: width / 10,
      height: height / 25,
      backgroundColor: "#fff",
      position: 'absolute'
    },
    brick:
    {
      //tbd
    }
  });
}

export default function App() {
  //loading stylesheets in so they can make use of width/height dynamic dimensions
  const { width, height } = useWindowDimensions();
  const { paddleX, setPaddleX } = useState(width / 2);

  const paddleStats = {
    positionXY: {
      x: paddleX,
      y: 0,
    },
    sizeXY: {
      x: width * paddleSizeXCoeff,
      y: height * paddleSizeYCoeff,
    },
    speed: 49
  }
  paddle = new Paddle(paddleStats.sizeXY, paddleStats.positionXY, paddleStats.speed, width);
  const styles = CreateStyles(width, height, paddleStats);
  //generate paddle
  // paddle = new Paddle();
  return (
    <SafeAreaView>
      <View style={styles.Background}>
        <View style={styles.paddle}>

        </View>
        {/* <View style={styles.ball}>

      </View> */}
      </View>
    </SafeAreaView>

  );
}