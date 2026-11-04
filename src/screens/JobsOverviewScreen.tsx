import {useFocusEffect} from '@react-navigation/native';
import React, {useCallback, useMemo, useState} from 'react';
import {Pressable, RefreshControl, ScrollView, StyleSheet, Text, View} from 'react-native';
import {api} from '../api/client';
import {Empty, Loading} from '../components/Ui';
import {colors} from '../theme';
import {openJobLocation} from '../utils/maps';

type Kind = 'installation' | 'breakdown' | 'visit';
type Data = {installations: any[]; breakdowns: any[]; visits: any[]};
const tabs: [Kind, string, string][] = [
  ['installation', 'Installations', 'LAST 7 DAYS'],
  ['breakdown', 'Breakdowns', 'LAST 7 DAYS'],
  ['visit', 'Site visits', 'THIS MONTH'],
];
const completeStatuses = ['COMPLETED', 'SUBMITTED', 'CLOSED'];
const activeStatuses = ['STARTED', 'IN_PROGRESS'];
const normalizeStatus = (status: unknown) => String(status ?? 'PENDING').toUpperCase();

export function JobsOverviewScreen({navigation}: {navigation: any}) {
  const [kind, setKind] = useState<Kind>('installation');
  const [data, setData] = useState<Data>({installations: [], breakdowns: [], visits: []});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const load = useCallback(async (refresh = false) => {
    refresh ? setRefreshing(true) : setLoading(true);
    setError('');
    try {
      const [installations, breakdowns, visits] = await Promise.all([
        api.recentInstallations(7), api.recentBreakdowns(7), api.currentMonthVisits(),
      ]);
      setData({installations, breakdowns, visits});
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to load jobs');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);
  useFocusEffect(useCallback(() => {load();}, [load]));
  const items = useMemo(
    () => kind === 'installation' ? data.installations : kind === 'breakdown' ? data.breakdowns : data.visits,
    [kind, data],
  );
  if (loading) return <Loading />;

  return <View style={s.page}>
    <View style={s.hero}>
      <Text style={s.eyebrow}>ASSIGNED WORK</Text><Text style={s.title}>Jobs</Text>
      <Text style={s.subtitle}>Recent jobs and this month's planned service visits.</Text>
    </View>
    <View style={s.tabs}>{tabs.map(([value, label, period]) => <Pressable key={value} onPress={() => setKind(value)} style={[s.tab, kind === value && s.activeTab]}>
      <Text style={[s.tabText, kind === value && s.activeText]}>{label}</Text>
      <Text style={[s.period, kind === value && s.activePeriod]}>{period}</Text>
      <View style={[s.badge, kind === value && s.activeBadge]}><Text style={[s.badgeText, kind === value && s.activeBadgeText]}>{value === 'installation' ? data.installations.length : value === 'breakdown' ? data.breakdowns.length : data.visits.length}</Text></View>
    </Pressable>)}</View>
    <ScrollView contentContainerStyle={s.list} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={colors.primary} />}>
      {!!error && <Text style={s.error}>{error}</Text>}
      {!error && items.length === 0 && <Empty text="No assignments for this period." />}
      {items.map((item, index) => {
        const id = Number(item.installationJobId ?? item.breakdownId ?? item.serviceScheduleId ?? index);
        const reference = item.jobNumber ?? item.breakdownNumber ?? item.agreementNumber ?? `Job #${id}`;
        const status = normalizeStatus(item.status);
        const complete = completeStatuses.includes(status);
        const active = activeStatuses.includes(status);
        return <Pressable
          key={`${kind}-${id}`}
          onPress={() => navigation.navigate('Job detail', {kind, id, item})}
          style={({pressed}) => [s.card, complete ? s.completedCard : active ? s.activeCard : s.pendingCard, pressed && s.pressed]}>
          <View style={s.row}><View style={{flex: 1}}>
            <Text style={s.reference}>{reference}</Text>
            <Text style={s.machine}>{item.machineReferenceNumber ?? item.invoiceNumber ?? 'Machine pending'}</Text>
          </View><View style={[s.status, complete ? s.completedStatus : active ? s.activeStatus : s.pendingStatus]}><Text style={s.statusText}>{status.replaceAll('_', ' ')}</Text></View></View>
          <Text style={s.site}>Customer site  •  {item.siteName ?? item.customerName ?? 'Not specified'}</Text>
          {item.siteAddress ? <Text style={s.address}>{item.siteAddress}</Text> : null}
          <View style={s.actions}><Pressable onPress={event => {event.stopPropagation(); openJobLocation(item);}} style={s.map}><Text style={s.mapText}>Open Maps</Text></Pressable><View style={s.open}><Text style={s.openText}>View job  ›</Text></View></View>
        </Pressable>;
      })}
    </ScrollView>
  </View>;
}

const s = StyleSheet.create({
  page:{flex:1,backgroundColor:'#F4F7F6'},hero:{margin:16,marginBottom:12,backgroundColor:colors.primaryDark,borderRadius:25,padding:21},eyebrow:{fontSize:10,fontWeight:'900',letterSpacing:1.6,color:'#9CD5CE'},title:{fontSize:30,fontWeight:'900',color:'#fff',marginTop:3},subtitle:{fontSize:13,lineHeight:19,color:'#B9D7D3',marginTop:5},tabs:{marginHorizontal:16,flexDirection:'row',backgroundColor:'#E5ECEA',padding:4,borderRadius:17,gap:3},tab:{flex:1,minHeight:61,borderRadius:14,alignItems:'center',justifyContent:'center'},activeTab:{backgroundColor:'#fff',elevation:2},tabText:{fontSize:10,fontWeight:'900',color:'#74827F'},activeText:{color:colors.primaryDark},period:{fontSize:7,fontWeight:'800',color:'#98A39F',marginTop:2},activePeriod:{color:colors.primary},badge:{position:'absolute',right:4,top:4,minWidth:17,height:17,borderRadius:9,alignItems:'center',justifyContent:'center',backgroundColor:'#CCD8D5'},activeBadge:{backgroundColor:colors.primary},badgeText:{fontSize:8,fontWeight:'900',color:'#6D7A77'},activeBadgeText:{color:'#fff'},list:{padding:16,paddingBottom:110,gap:12},card:{borderRadius:20,padding:17,borderWidth:1},completedCard:{backgroundColor:'#EFFAF3',borderColor:'#BDE5CA'},activeCard:{backgroundColor:'#EEF6FF',borderColor:'#C8DDF4'},pendingCard:{backgroundColor:'#FFF9EC',borderColor:'#F1DDAE'},pressed:{opacity:.86,transform:[{scale:.99}]},row:{flexDirection:'row',gap:10},reference:{fontSize:17,fontWeight:'900',color:colors.text},machine:{fontSize:12,color:colors.muted,marginTop:3},status:{borderRadius:20,paddingHorizontal:9,paddingVertical:6},completedStatus:{backgroundColor:'#CDEED8'},activeStatus:{backgroundColor:'#D6E9FC'},pendingStatus:{backgroundColor:'#F9E6B8'},statusText:{fontSize:9,fontWeight:'900',color:colors.primaryDark},site:{fontSize:14,fontWeight:'700',color:colors.text,marginTop:15},address:{fontSize:12,lineHeight:18,color:colors.muted,marginTop:3},actions:{flexDirection:'row',gap:9,marginTop:15},map:{flex:1,minHeight:40,borderRadius:12,backgroundColor:'rgba(255,255,255,.75)',alignItems:'center',justifyContent:'center'},mapText:{fontSize:12,fontWeight:'900',color:colors.primaryDark},open:{flex:1,minHeight:40,borderRadius:12,backgroundColor:colors.primary,alignItems:'center',justifyContent:'center'},openText:{fontSize:12,fontWeight:'900',color:'#fff'},error:{color:colors.danger,backgroundColor:'#FEECEC',padding:14,borderRadius:12},
});
