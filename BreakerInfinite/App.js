import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { useWindowDimensions } from 'react-native';

const title = "Breaker: Infinite";

function UseStyles(){
  const {width,height} = useWindowDimensions();
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
    }
  });
}

export default function App() {
  //loading stylesheets in so they can make use of width/height dynamic dimensions
  const styles = UseStyles();
  return (
    <View style={styles.Background}>
      <Text style = {"color:#fff"}>{title}</Text>
      <View style={styles.paddle}>

      </View>
      {/* <StatusBar style="auto" /> */}
    </View>
  );
}