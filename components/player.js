import {useState} from 'react';


import {StyleSheet, Image, ImageBackground, Pressable } from 'react-native';

import {GIF_BASE_URL, URL_PLAYING, URL_PAUSED} from '../constants/AppConst';

export default function Player(props) {

  const [isPlaying, setIsPlaying] = useState(false);

  const { id, width, height } = props;

  const url = GIF_BASE_URL + id + (isPlaying ? URL_PLAYING : URL_PAUSED);
  
  console.log(isPlaying)
  
  return (
    <Pressable onPress={()=>setIsPlaying((isPlaying)=>!isPlaying)} style={styles.container}>
      <ImageBackground
        source={{uri: url}}
        style={{width, height, justifyContent: 'center', alignItems: 'center'}}
        imageStyle={{opacity: isPlaying ? 1.0 : 0.8}}
      >
        {!isPlaying ? (
              <Image style={{width: 40, height: 40}} source={require('../assets/play.png')}/>
            )
            : null
          }
      </ImageBackground>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10
  }
});
