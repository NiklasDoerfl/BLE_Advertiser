import React, { useState, useEffect } from 'react';
import { SafeAreaView, Button, Text } from 'react-native';
import BLEAdvertiser from 'react-native-ble-advertiser';
import { GoogleSignin, GoogleSigninButton, User, statusCodes } from '@react-native-google-signin/google-signin';
import { PermissionsAndroid } from 'react-native';
import WebSocket from 'react-native-websocket';
import DeviceInfo from 'react-native-device-info';
import VIForegroundService from '@voximplant/react-native-foreground-service';
import { Linking } from 'react-native';
import useWebSocket from 'react-native-use-websocket';

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

  useEffect(() => {
    const ws = new WebSocket('ws://10.13.252.253:3333/ws');
    ws.onopen = () => {
      // Connection opened
      console.log('WebSocket connection opened');
      ws.send('Hello, server!'); // Send a message to the server
    };
    ws.onmessage = (e:any) => {
      // Receive a message from the server
      console.log(e.data);
    };
    ws.onerror = (e:any) => {
      // An error occurred
      console.log(e.message);
    };
    ws.onclose = (e:any) => {
      // Connection closed
      console.log(e.code, e.reason);
    };
  }, []);

  const signIn = async () => {
    
    GoogleSignin.configure({webClientId:"1019647243767-o1clrpj0qch69isj5lbg170k34enp7kv.apps.googleusercontent.com",});
    try {
      setIsSigninInProgress(true);
      await GoogleSignin.hasPlayServices();
      const userData = await GoogleSignin.signIn();
      setIsSigninInProgress(false);
      setUserInfo(userData);

      
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
          <Text>{userInfo ? `Welcome, ${userInfo.user.name}` : 'Not Signed In'}</Text>
          <Button title={isAdvertising ? 'Stop Advertising' : 'Start Advertising'} onPress={toggleAdvertising} />
          <Button title="Logout" onPress={logOut} />
        </>
      )}
      <Text>{isAdvertising ? 'Advertising...' : 'Not Advertising'}</Text>
    </SafeAreaView>
  );
};

export default App;
