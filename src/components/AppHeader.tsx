import React from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../auth/AuthContext';
import { colors } from '../theme';

export function AppHeader() {
  const { session } = useAuth();
  const initials = session?.userName?.split(/\s+/).slice(0, 2).map(part => part[0]).join('').toUpperCase() || 'T';
  return <View style={s.header}>
    <View style={s.identity}><View style={s.avatar}><Text style={s.initials}>{initials}</Text></View><View><Text style={s.welcome}>WELCOME BACK</Text><Text style={s.name} numberOfLines={1}>{session?.userName || 'Technician'}</Text><Text style={s.role}>{session?.role?.replaceAll('_', ' ') || 'TECHNICIAN'}</Text></View></View>
    <Pressable accessibilityLabel="Notifications" onPress={() => Alert.alert('Notifications', 'You have no new notifications.')} style={({pressed}) => [s.bell, pressed && {opacity:.7}]}><Text style={s.bellIcon}>🔔</Text><View style={s.dot}/></Pressable>
  </View>;
}
const s=StyleSheet.create({header:{height:88,backgroundColor:'#fff',paddingHorizontal:18,flexDirection:'row',alignItems:'center',justifyContent:'space-between',borderBottomWidth:1,borderBottomColor:'#E7EEEC'},identity:{flexDirection:'row',alignItems:'center',gap:12,flex:1},avatar:{width:46,height:46,borderRadius:16,backgroundColor:colors.primary,alignItems:'center',justifyContent:'center'},initials:{color:'#fff',fontSize:16,fontWeight:'900',letterSpacing:.5},welcome:{fontSize:9,fontWeight:'900',letterSpacing:1.5,color:'#8A9795'},name:{fontSize:17,fontWeight:'900',color:colors.text,marginTop:1,maxWidth:220},role:{fontSize:10,fontWeight:'800',letterSpacing:1,color:colors.primary,marginTop:1},bell:{width:44,height:44,borderRadius:15,backgroundColor:'#F0F5F4',alignItems:'center',justifyContent:'center'},bellIcon:{fontSize:20},dot:{position:'absolute',right:8,top:8,width:8,height:8,borderRadius:4,backgroundColor:'#F5A524',borderWidth:2,borderColor:'#fff'}});
