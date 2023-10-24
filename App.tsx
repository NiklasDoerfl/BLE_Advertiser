import React, { useState, useEffect } from 'react';
import { SafeAreaView, Button, Text } from 'react-native';
import BLEAdvertiser from 'react-native-ble-advertiser';
import { GoogleSignin, GoogleSigninButton, User, statusCodes } from '@react-native-google-signin/google-signin';
import { PermissionsAndroid } from 'react-native';
const WebSocket = global.WebSocket;
import DeviceInfo from 'react-native-device-info';
import VIForegroundService from '@voximplant/react-native-foreground-service';
import { Linking } from 'react-native';

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
  const [messages, setMessages] = useState([]);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [error, setError] = useState('');
  console.log(5);
  
  useEffect(() => {
    setError("3");
    const wsInstance = new WebSocket('ws://10.13.252.253:3333/ws');
    wsInstance.onopen = () => {
      // Connection opened
      console.log('WebSocket connection opened');
      wsInstance.send('Hello, server!'); // Send a message to the server
    };
    wsInstance.onmessage = (e:any) => {
      // Receive a message from the server
      console.log(e.data);
    };
    wsInstance.onerror = (e:any) => {
      console.log("error");
      setError("error");
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
      ws.send(JSON.stringify(user));
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

      
      const jsonData = JSON.stringify(userData);
     
      
    } catch (err) {
      console.log('Error:', err);
      setIsSigninInProgress(false);
      // Handle errors
    }
  };

  const toggleAdvertising = () => {
    if (isAdvertising) {
      BLEAdvertiser.stopBroadcast().then(() => {
        setIsAdvertising(false);
      });
      stopForgroundService();
    } else {
      //openBatteryOptimizationSettings();
      startForegroundService();
      requestLocationPermission();
      const UUID = '550e8400-e29b-41d4-a716-446655440000'; 
      
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
    } catch (err) {
      // Handle errors
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
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
          <Button title={isAdvertising ? 'Stop Advertising' : 'Start Advertising'} onPress={toggleAdvertising} />
          <Button title="Logout" onPress={logOut} />
          <Text style={{ color: 'red' }}>{error}</Text>
        </>
      )}
      <Text>{isAdvertising ? 'Advertising...' : 'Not Advertising'}</Text>
    </SafeAreaView>
  );
};

export default App;
