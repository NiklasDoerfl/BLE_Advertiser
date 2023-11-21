import React, { useState, useEffect } from 'react';
import { SafeAreaView, Button, Text, View } from 'react-native';
import BLEAdvertiser from 'react-native-ble-advertiser';
import { GoogleSignin, GoogleSigninButton, User} from '@react-native-google-signin/google-signin';
import { PermissionsAndroid } from 'react-native';
const WebSocket = global.WebSocket;
import DeviceInfo from 'react-native-device-info';
import VIForegroundService from '@voximplant/react-native-foreground-service';
import { Linking } from 'react-native';
import Modal from 'react-native-modal';
import * as Styles from './StyleS';
import {CustomTaskbar} from './Taskbar';
var u = '';



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
        //setError(u);
        toggleModal();
        setTimeout(function(){toggleAdvertising();},2000);
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
    <SafeAreaView style={Styles.safeAreaViewStyles}>
      <CustomTaskbar
      onSettings={() => {
        getPermissions();
      }}
      onLogout={() => {
        // Handle logout click
      }}
      onStart={() => {
        // Handle start click
      }}
      onBreak={() => {
        // Handle break click
      }}
     />
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
          <Text style={Styles.buttonStyles} onPress={logOut}>Logout</Text>
          <Text style={Styles.buttonStyles} onPress={getPermissions}>Allow Permissions</Text>
          <Modal isVisible={isModalVisible}>
            <View style={Styles.safeAreaViewStyles}>
              <Text style={Styles.textStyles}>If you haven't already, allow all permissions by pressing the "Allow Permissions" Button</Text>
              <Button title="Schließen" onPress={toggleModal} />
            </View>
          </Modal>
        </>
      )}
      <Text>{isAdvertising ? 'Advertising...' : 'Not Advertising'}</Text>
    </SafeAreaView>
  );
};

export default App;
