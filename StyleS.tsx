// Styles.tsx
import { StyleProp, TextStyle } from 'react-native';


export const buttonStyles: StyleProp<TextStyle> = {
  backgroundColor: 'white',
  color: 'black',
  padding: 10,
  borderRadius: 5,
  fontSize: 16,
};
export const fontStyle1: StyleProp<TextStyle> = {
    color: 'white',
    fontSize: 16,
  };

export const safeAreaViewStyles: StyleProp<TextStyle> = {
  flex: 1,
  backgroundColor: 'black',
  alignItems: 'center',
  justifyContent: 'center',
};

export const textStyles: StyleProp<TextStyle> = {
  fontSize: 18,
  color: 'black',
  fontFamily: 'sans-serif',
  fontWeight: 'normal', // You can use 'bold' or 'normal'
};

export const h1Styles = {
    fontSize: 24,       // Adjust the font size as needed
    color: 'black',    // Set your desired text color
    fontFamily: 'sans-serif',
    fontWeight: 'bold', // You can use 'bold' or 'normal'
    backgroundColor: 'lightblue', // Set the background color
    borderRadius: '10px',   // Set the border radius
    padding: '10px',       
};

