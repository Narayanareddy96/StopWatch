/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity
} from 'react-native';
import monemt from 'moment'

const instructions = Platform.select({
  ios: 'Press Cmd+R to reload,\n' +
    'Cmd+D or shake for dev menu',
  android: 'Double tap R on your keyboard to reload,\n' +
    'Shake or press menu button for dev menu',
});

type Props = {};
function Timer({interval,style}){
  const pad = (n) => n < 10 ? '0'+n:n
  const duration = monemt.duration(interval);
  const centiseconds = Math.floor(duration.milliseconds()/10);
  return (
    <View style={styles.timerContainer}>
      <Text style={style}>{pad(duration.minutes())}:</Text>
      <Text style={style}>{pad(duration.seconds())},</Text>
      <Text style={style}>{pad(centiseconds)}</Text>
    </View>
  )
}
function Lap({number,interval,fastest,slowest}){
  const styleText = [
    styles.lapText,
    fastest && styles.fastest,
    slowest && styles.slowest,
  ]
  return(
    <View style={styles.lap}>
      <Text style={styleText}>lap {number}</Text>
      <Timer style={styleText} interval={interval} />
    </View>
  )
}
function RoundButton({title,color,background,onPress,disabled}){
  return(
    <TouchableOpacity
    onPress={()=> !disabled && onPress()}
    style={[styles.button,{backgroundColor:background}]}
    activeOpacity = {disabled ? 0.1 : 0.6}
    >
      <View style={styles.buttonBorder}>
        <Text style={[styles.buttonStyle,{color:color}]}>{title}</Text>
      </View>
    </TouchableOpacity>
  )
}

function LapsTable({laps,timer}){
  const fineshedLaps = laps.slice(1)
  let min = Number.MAX_SAFE_INTEGER
  let max = Number.MIN_SAFE_INTEGER

  if(fineshedLaps.length >=2){
    fineshedLaps.forEach(lap =>{
      if(lap > max) max = lap
      if(lap < min) min = lap
    })
  }
  return (
    <ScrollView style={styles.scrollView}>
      {laps.map((lap,index)=>(
          <Lap number={laps.length - index}
          key={laps.length - index}
          interval={index === 0 ? timer - lap:lap}
          fastest = {lap === min}
          slowest = {lap === max}
           />
        )
      )}
    </ScrollView>
  )
}
function ButtonRow({children}){
  return(
    <View style={styles.buttonRow}>
      {children}
    </View>
  )
}

export default class App extends Component<Props> {
  constructor(props){
    super(props)
    this.state = {
      start :0,
      now:0,
      laps:[],
    }
  }
  componentWillUnmount(){
    clearInterval(this.timer);
  }
  lap = () =>{
    const timestamp = new Date().getTime()
    const {laps,now,start} = this.state
    const [firstLap,...others] = laps
    this.setState({
      laps:[0,firstLap+now - start,...others],
      start:timestamp,
      now:timestamp,
    })
  }
  stop = () =>{
    clearInterval(this.timer)
    const {laps,now,start} = this.state
    const [firstLap, ...others] = laps
    this.setState({
      laps:[firstLap + now - start, ...others],
      start:0,
      now:0,
    })
  }
  start = () =>{
    const now = new Date().getTime()
    this.setState({
      start:now,
      now,
      laps:[0],
    })
    this.timer = setInterval(()=>{
      this.setState({now:new Date().getTime()})
    },100);
  }
  reset = () =>{
    this.setState({
      laps:[],
      start:0,
      now:0,
    })

  }
  resume = () =>{
    const now = new Date().getTime()
    this.setState({
      start:now,
      now,
    })
    this.timer = setInterval(()=>{
      this.setState({now:new Date().getTime()})
    },100)

  }
  render() {
    const {start,now,laps} = this.state
    const timer = now - start
    return (
      <View style={styles.container}>
        <Timer interval={laps.reduce((total,curr)=>total+curr,0)+timer} style={styles.timer} />
        {laps.length === 0 && (
          <ButtonRow>
              <RoundButton title='Lap'
              color='#8B8B90'
              background='#151515'
              disabled
              />
              <RoundButton
              title='Start'
              color='#3380FF'
              background='#33FFE9'
              onPress = {this.start}
              />
          </ButtonRow>
        )}
        {start > 0 && (
          <ButtonRow>
              <RoundButton
              title='Lap'
              color='#000A09'
              background='#E5EDEC'
              onPress = {this.lap}
              />
              <RoundButton
              title='Stop'
              color='#E33935'
              background='#3C1715'
              onPress = {this.stop}
              />
          </ButtonRow>
        )}
        {laps.length > 0 && start ===0 && (
          <ButtonRow>
              <RoundButton
              title='Reset'
              color='#000A09'
              background='#E5EDEC'
              onPress = {this.reset}
              />
              <RoundButton
              title='Start'
              color='#3380FF'
              background='#33FFE9'
              onPress = {this.resume}
              />
          </ButtonRow>
        )}
          <LapsTable laps={laps} timer = {timer} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  //  justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0D0D0D',
    paddingTop:130,
  },
  timer:{
    color:'#FFFFFF',
    fontSize:76,
    fontWeight:'100',
    width:110,
  },
  timerContainer:{
    flexDirection:'row',
  },
  button:{
    width:80,
    height:80,
    borderRadius:40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonStyle:{
    fontSize:18,
  },
  buttonBorder:{
    width:76,
    height:76,
    borderRadius:38,
    borderWidth:2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonRow:{
    flexDirection:'row',
    alignSelf:'stretch',
    justifyContent: 'space-between',
    padding:30,
  },
  lapText:{
    color:'#FFFFFF',
    fontSize:18,
  },
  lap:{
    flexDirection:'row',
    justifyContent: 'space-between',
    borderColor:'#FFFFFF',
    borderTopWidth:1,
    paddingVertical:2,
  },
  scrollView:{
    alignSelf:'stretch',
    margin:20,
  },
  fastest:{
    color:'#4BC05F',
  },slowest:{
    color:'#CC3531',
  }
  // welcome: {
  //   fontSize: 20,
  //   textAlign: 'center',
  //   margin: 10,
  // },
  // instructions: {
  //   textAlign: 'center',
  //   color: '#333333',
  //   marginBottom: 5,
  // },
});
