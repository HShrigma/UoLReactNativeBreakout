import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { useWindowDimensions } from 'react-native';
import {Paddle} from './Paddle';
//import {Ball} from './Ball';
const title = "Breaker: Infinite";
const FPS = 60;
const DELTA = 1000/FPS;

const paddleStats = {
  positionXY: {
    x: 0,
    y: 0,
  },
  sizeXY: {
    x: 0,
    y: 0,
  },
  speed: 49
}

function CreateStyles(width,height){
  return StyleSheet.create({
    Background: {
      width: width,
      height: height,
      backgroundColor: '#000',
      alignItems: 'center',
      justifyContent: 'center',
    },
    paddle: {
      width: width/5,
      height: height/20,
      backgroundColor: "#fff"
    },
    ball: {
      width: width/10,
      height: height/25,
      backgroundColor: "#fff"
    },
    brick:
    {
      //tbd
    }
  });
}

export default function App() {
  //loading stylesheets in so they can make use of width/height dynamic dimensions
  const {width,height} = useWindowDimensions();
  const styles = CreateStyles(width,height);
  paddle = new Paddle(paddleStats.sizeXY, paddleStats.positionXY, paddleStats.speed, width);
  // paddle = new Paddle();
  return (
    <View style={styles.Background}>
      <Text style = {"color:#fff"}>{title}</Text>
      <View style={styles.paddle}>

      </View>
      <View style={styles.ball}>

      </View>
    </View>
  );
}