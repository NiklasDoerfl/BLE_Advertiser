/*import { TouchableOpacity, StyleSheet} from 'react-native';

import React from 'react';
import { View } from 'react-native';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons'; // Import icons of your choice

// Define the prop types for your component
interface CustomTaskbarProps {
    onSettings: () => void;
    onLogout: () => void;
    onStart: () => void;
    onBreak: () => void;
  }
  
  const CustomTaskbar: React.FC<CustomTaskbarProps> = ({ onSettings, onLogout, onStart, onBreak }) => {
    return (
      <View style={stylesw.taskbar}>
        <TouchableOpacity onPress={onSettings}>
          <FontAwesome name="cog" size={24} color="black" />
        </TouchableOpacity>
        <TouchableOpacity onPress={onLogout}>
          <FontAwesome name="sign-out" size={24} color="black"/>
        </TouchableOpacity>
        <TouchableOpacity onPress={onStart}>
          <MaterialIcons name="play-circle-filled" size={24} color="black" />
        </TouchableOpacity>
        <TouchableOpacity onPress={onBreak}>
          <MaterialIcons name="pause-circle-filled" size={24} color="black" />
        </TouchableOpacity>
      </View>
    );
  };
  
  const stylesw = StyleSheet.create({
    taskbar: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: 'lightgray',
      padding: 10,
      height: 50,
    },
  });
  
  export {CustomTaskbar};
  */