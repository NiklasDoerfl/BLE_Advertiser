import React, { useState, useEffect } from 'react';
import { SafeAreaView, Button, Text, View } from 'react-native';
import BLEAdvertiser from 'react-native-ble-advertiser';
import { GoogleSignin, GoogleSigninButton, User} from '@react-native-google-signin/google-signin';
import { PermissionsAndroid } from 'react-native';
const WebSocket = global.WebSocket;
import DeviceInfo from 'react-native-device-info';
import VIForegroundService from '@voximplant/react-native-foreground-service';
import { Linking } from 'react-native';
//import Modal from 'react-native-modal';
//import {styles} from './StyleS';
import { StyleSheet } from 'react-native';
//import {CustomTaskbar} from './Taskbar';
var u = '';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    padding: 10,
    backgroundColor: 'blue',
    color: 'white',
    marginTop: 10,
  },
});



async function startForegroundService() {
  const notificationConfig = {
      channelId: 'channelId', // Notification channel id
      id: 3456,                // Unique notification id
      title: 'Title',          // Notification title
      text: 'Some text',       // Notification text
      icon: 'ic_icon',         // Icon name
      button: 'Some text',     // Button text (optional)
  };
  
  try {
      await VIForegroundService.getInstance().startService(notificationConfig);
  } catch (e) {
      console.error(e);
  }
}

function startsWithUUIDPrefix(inputString: string): boolean {
  return inputString.startsWith("uuid:");
}


async function stopForgroundService(){
  await VIForegroundService.getInstance().stopService();
}

const channelConfig = {
  id: 'channelId',
  name: 'Channel name',
  description: 'Channel description',
  enableVibration: false
};

const openBatteryOptimizationSettings = () => {
  const packageName = DeviceInfo.getBundleId();

  Linking.openSettings()
    .catch(err => console.error('Error opening battery optimization settings: ', err));
};



async function requestLocationPermission() {
    await VIForegroundService.getInstance().createNotificationChannel(channelConfig);
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
            title: "Location Permission",
            message: "Your app needs location access for BLE.",
            buttonNeutral: "Ask Me Later",
            buttonNegative: "Cancel",
            buttonPositive: "OK"
        }
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log("Location permission granted");
      } else {
        console.log("Location permission denied");
      }
    } catch (err) {
        console.warn(err);
    }
}

const App: React.FC = () => {
  const [isAdvertising, setIsAdvertising] = useState<boolean>(false);
  const [userInfo, setUserInfo] = useState<null | User>(null);
  const [isSigninInProgress, setIsSigninInProgress] = useState(false); 
  const [getUUID, setUUID] = useState('');
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [getError, setError] = useState('');
  const [isModalVisible, setModalVisible] = useState(false);
  console.log(5);
  
  useEffect(() => {
    const wsInstance = new WebSocket('ws://ec2-35-171-255-162.compute-1.amazonaws.com/ws');
    wsInstance.onopen = () => {
      // Connection opened
      console.log('WebSocket connection opened');
      wsInstance.send('Hello, server!'); // Send a message to the server
    };
    wsInstance.onmessage = (e:any) => {
      if(startsWithUUIDPrefix(e.data)){
        setUUID(e.data);
        u = e.data;
      }
   
      //WriteFile(e.data);
    };
    wsInstance.onerror = (e:any) => {
      console.log("error");
      setError(e.data);
      console.log(e);
    };
    wsInstance.onclose = (e:any) => {
      // Connection closed
      console.log(e.code, e.reason);
    };

    setWs(wsInstance);


  }, []);


  const sendMessage = (userData: any) => {
    if(ws){
      let user = userData.user;
      ws.send("$$LOGIN$"+JSON.stringify(user));
    }
  }

  const signIn = async () => {
    GoogleSignin.configure({webClientId:"1019647243767-o1clrpj0qch69isj5lbg170k34enp7kv.apps.googleusercontent.com",});
    try {
      setIsSigninInProgress(true);
      await GoogleSignin.hasPlayServices();
      const userData = await GoogleSignin.signIn();
      setIsSigninInProgress(false);
      setUserInfo(userData);
      sendMessage(userData);
     
      
     
    } catch (err) {
      console.log('Error:', err);
      setIsSigninInProgress(false);
      // Handle errors
    }


  };

  const getPermissions = () =>{
    Linking.openSettings()
    .catch(err => console.error('Error opening optimization settings: ', err));
  };

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };
  

  const toggleAdvertising = () => {
    setError(getUUID);
    if (isAdvertising) {
      BLEAdvertiser.stopBroadcast().then(() => {
        setIsAdvertising(false);
      });
      stopForgroundService();
    } else {
      //openBatteryOptimizationSettings();
      startForegroundService();
      requestLocationPermission();
      const UUID = u.substring(5); 
      console.log(UUID);
      BLEAdvertiser.setCompanyId(0x04);
      BLEAdvertiser.broadcast(UUID, [], {}).then(() => {
        setIsAdvertising(true);
      });
    }
  };

  const logOut = async () => {
    try {
      await GoogleSignin.revokeAccess();
      await GoogleSignin.signOut();
      setUserInfo(null);
      setUUID('');
      toggleAdvertising();
    } catch (err) {
      // Handle errors
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <GoogleSigninButton 
        size={GoogleSigninButton.Size.Wide}
        color={GoogleSigninButton.Color.Dark}
        onPress={signIn}
        disabled={isSigninInProgress} />;
        <Text>{userInfo ? `Welcome, ${userInfo.user.name}` : 'Not Signed In'}</Text>
      <Button title={isAdvertising ? 'Stop Advertising' : 'Start Advertising'} onPress={toggleAdvertising} />
      <Text>{isAdvertising ? 'Advertising...' : 'Not Advertising'}</Text>
    </SafeAreaView>
  );
  

  /*return (
    <View style={styles.container} >
      
      {!userInfo ? (
        <GoogleSigninButton
          size={GoogleSigninButton.Size.Wide}
          color={GoogleSigninButton.Color.Dark}
          onPress={signIn}
          disabled={isSigninInProgress}
        />
      ) : (
        <>
          <Text>{userInfo ? `Servus, ${userInfo.user.name}` : 'Not Signed In'}</Text>
          <Text style={styles.button} onPress={toggleAdvertising}>start</Text>
          <Text style={styles.button} onPress={logOut}>Logout</Text>
          <Text style={styles.button} onPress={getPermissions}>Allow Permissions</Text>
          
        </>
      )}
      <Text>{isAdvertising ? 'Advertising...' : 'Not Advertising'}</Text>
    </View>
  );*/
};

export default App;
