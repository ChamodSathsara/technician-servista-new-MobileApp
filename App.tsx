import React,{useEffect} from 'react';
import {StyleSheet,Text,View} from 'react-native';
import {NavigationContainer,DefaultTheme,createNavigationContainerRef} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {SafeAreaProvider,SafeAreaView} from 'react-native-safe-area-context';
import {StatusBar} from 'expo-status-bar';
import {AuthProvider,useAuth} from './src/auth/AuthContext';
import {Loading} from './src/components/Ui';
import {AppHeader} from './src/components/AppHeader';
import {LoginScreen} from './src/screens/LoginScreen';
import {DashboardScreen} from './src/screens/DashboardScreen';
import {DueScreen} from './src/screens/DueScreen';
import {JobsOverviewScreen} from './src/screens/JobsOverviewScreen';
import {JobDetailScreen} from './src/screens/JobDetailScreen';
import {EstimateScreen} from './src/screens/EstimateScreen';
import {ProfileScreen} from './src/screens/ProfileScreen';
import {colors} from './src/theme';
import {JobNotification,NotificationProvider,useNotifications} from './src/notifications/NotificationContext';

const Tab=createBottomTabNavigator();const Stack=createNativeStackNavigator();
const navigationRef=createNavigationContainerRef();
const icons:Record<string,string>={Dashboard:'⌂',Jobs:'▣',Due:'◷',Estimate:'▤',Profile:'●'};
function DueStack(){return <Stack.Navigator screenOptions={{headerTintColor:colors.primary,headerTitleStyle:{fontWeight:'800'},headerShadowVisible:false}}><Stack.Screen name="Due list" component={DueScreen} options={{headerShown:false}}/><Stack.Screen name="Job detail" component={JobDetailScreen} options={{title:'Assignment'}}/></Stack.Navigator>}
function JobsStack(){return <Stack.Navigator screenOptions={{headerTintColor:colors.primary,headerTitleStyle:{fontWeight:'800'},headerShadowVisible:false}}><Stack.Screen name="Jobs list" component={JobsOverviewScreen} options={{headerShown:false}}/><Stack.Screen name="Job detail" component={JobDetailScreen} options={{title:'Assignment'}}/></Stack.Navigator>}
function Main(){const {session,loading}=useAuth();const {tapped,consumeTap}=useNotifications();const openNotification=(notification:JobNotification)=>{if(navigationRef.isReady())(navigationRef as any).navigate('Due',{screen:'Job detail',params:{kind:notification.kind,id:notification.jobId,item:notification.item}})};useEffect(()=>{if(!tapped||!session)return;const open=()=>{if(!navigationRef.isReady())return false;openNotification(tapped);consumeTap();return true};if(open())return;const timer=setTimeout(open,300);return()=>clearTimeout(timer)},[tapped,session,consumeTap]);if(loading)return <Loading/>;if(!session)return <LoginScreen/>;return <SafeAreaView style={s.safe} edges={['top']}><AppHeader onOpenJob={openNotification}/><View style={s.body}><Tab.Navigator screenOptions={({route})=>({headerShown:false,tabBarActiveTintColor:colors.primary,tabBarInactiveTintColor:'#8A9795',tabBarLabelStyle:{fontSize:10,fontWeight:'800',marginTop:1},tabBarStyle:{height:72,paddingBottom:9,paddingTop:7,borderTopColor:'#E3EBE9',backgroundColor:'#fff'},tabBarIcon:({color})=><Text style={{fontSize:20,fontWeight:'900',color}}>{icons[route.name]}</Text>})}><Tab.Screen name="Dashboard" component={DashboardScreen}/><Tab.Screen name="Jobs" component={JobsStack}/><Tab.Screen name="Due" component={DueStack}/><Tab.Screen name="Estimate" component={EstimateScreen}/><Tab.Screen name="Profile" component={ProfileScreen}/></Tab.Navigator></View></SafeAreaView>}
export default function App(){return <SafeAreaProvider><AuthProvider><NotificationProvider><NavigationContainer ref={navigationRef} theme={{...DefaultTheme,colors:{...DefaultTheme.colors,background:'#F4F7F6',primary:colors.primary}}}><StatusBar style="dark"/><Main/></NavigationContainer></NotificationProvider></AuthProvider></SafeAreaProvider>}
const s=StyleSheet.create({safe:{flex:1,backgroundColor:'#fff'},body:{flex:1}});
