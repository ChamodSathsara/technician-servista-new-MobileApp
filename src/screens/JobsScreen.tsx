import React, { useCallback, useMemo, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { api, ApiError } from '../api/client';
import { Empty, Loading } from '../components/Ui';
import { colors, spacing } from '../theme';
import { openJobLocation } from '../utils/maps';

type Kind = 'installation' | 'breakdown' | 'visit';
const config = {
  installation: { title: 'Installations', eyebrow: 'FIELD WORK', icon: '🛠️', load: api.installations },
  breakdown: { title: 'Breakdowns', eyebrow: 'URGENT SERVICE', icon: '⚡', load: api.breakdowns },
  visit: { title: 'Site visits', eyebrow: 'PLANNED SERVICE', icon: '📍', load: api.visits },
};
const pick = (o: any, keys: string[], fallback = '—') => keys.map(k => o?.[k]).find(v => v !== undefined && v !== null && v !== '') ?? fallback;
const statusTone = (status: string) => status === 'COMPLETED' ? '#DCFCE7' : status === 'STARTED' || status === 'IN_PROGRESS' ? '#DBEAFE' : status === 'CANCELLED' ? '#FEE2E2' : '#FEF3C7';

export function JobsScreen({ kind, navigation }: { kind: Kind; navigation: any }) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const load = useCallback(async (refresh = false) => {
    refresh ? setRefreshing(true) : setLoading(true); setError('');
    try { setItems(await config[kind].load()); }
    catch (e) { setError(e instanceof ApiError && e.status === 403 ? 'Your account cannot access these jobs.' : e instanceof Error ? e.message : 'Unable to load jobs'); }
    finally { setLoading(false); setRefreshing(false); }
  }, [kind]);
  useFocusEffect(useCallback(() => { load(); }, [load]));
  const active = useMemo(() => items.filter(item => !['COMPLETED', 'CANCELLED'].includes(String(pick(item, ['status'])))).length, [items]);
  if (loading) return <Loading />;

  return <ScrollView style={s.page} contentContainerStyle={s.content} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={colors.primary} />}>
    <View style={s.hero}><View style={s.heroTop}><View><Text style={s.eyebrow}>{config[kind].eyebrow}</Text><Text style={s.title}>{config[kind].title}</Text></View><View style={s.heroIcon}><Text style={s.heroEmoji}>{config[kind].icon}</Text></View></View><View style={s.stats}><View><Text style={s.statValue}>{items.length}</Text><Text style={s.statLabel}>Assigned</Text></View><View style={s.divider}/><View><Text style={s.statValue}>{active}</Text><Text style={s.statLabel}>Active</Text></View></View></View>
    {!!error && <View style={s.errorCard}><Text style={s.errorTitle}>Could not load jobs</Text><Text style={s.error}>{error}</Text><Pressable onPress={() => load()}><Text style={s.retry}>Try again</Text></Pressable></View>}
    {!error && items.length === 0 && <Empty text="You're all caught up. No jobs assigned." />}
    {items.map((item, i) => {
      const id = Number(pick(item, ['installationJobId', 'breakdownId', 'serviceScheduleId', 'jobId', 'scheduleId', 'id'], String(i)));
      const status = String(pick(item, ['status', 'jobStatus', 'scheduleStatus']));
      const reference = String(pick(item, ['jobNumber', 'breakdownNumber', 'agreementNumber'], `${config[kind].title} #${id}`));
      const machine = String(pick(item, ['machineReferenceNumber', 'invoiceNumber'], 'Machine pending'));
      const site = String(pick(item, ['siteName', 'customerName'], 'Site not specified'));
      const date = String(pick(item, ['expectedInstallDate', 'expectedVisitDate', 'scheduledDate', 'createdAt'], 'Date not set'));
      return <Pressable key={`${kind}-${id}`} onPress={() => navigation.navigate('Job detail', { kind, id, item })} style={({ pressed }) => [s.card, pressed && { opacity: .88, transform: [{ scale: .99 }] }]}>
        <View style={s.cardTop}><View style={s.referenceWrap}><Text style={s.reference}>{reference}</Text><Text style={s.machine}>{machine}</Text></View><View style={[s.status, { backgroundColor: statusTone(status) }]}><Text style={s.statusText}>{status.replaceAll('_', ' ')}</Text></View></View>
        <View style={s.infoRow}><Text style={s.infoIcon}>⌂</Text><View style={{ flex: 1 }}><Text style={s.infoLabel}>CUSTOMER SITE</Text><Text style={s.infoValue}>{site}</Text>{item.siteAddress ? <Text style={s.address} numberOfLines={2}>{item.siteAddress}</Text> : null}</View></View>
        <View style={s.infoRow}><Text style={s.infoIcon}>◷</Text><View><Text style={s.infoLabel}>SCHEDULE</Text><Text style={s.infoValue}>{date.slice(0, 10)}</Text></View></View>
        <View style={s.actions}><Pressable onPress={(event) => { event.stopPropagation(); openJobLocation(item); }} style={s.mapButton}><Text style={s.mapButtonText}>📍 Open in Maps</Text></Pressable><View style={s.detailsButton}><Text style={s.detailsText}>View job  ›</Text></View></View>
      </Pressable>;
    })}
  </ScrollView>;
}

const s = StyleSheet.create({
  page:{flex:1,backgroundColor:'#F4F7F6'},content:{padding:spacing.md,paddingBottom:110,gap:14},hero:{backgroundColor:colors.primaryDark,borderRadius:26,padding:22,marginBottom:4,shadowColor:'#062C27',shadowOpacity:.22,shadowRadius:16,shadowOffset:{width:0,height:8},elevation:7},heroTop:{flexDirection:'row',justifyContent:'space-between',alignItems:'center'},eyebrow:{fontSize:11,fontWeight:'800',letterSpacing:1.8,color:'#9CD5CE'},title:{fontSize:30,fontWeight:'900',color:'#fff',marginTop:5},heroIcon:{width:58,height:58,borderRadius:20,backgroundColor:'rgba(255,255,255,.12)',alignItems:'center',justifyContent:'center'},heroEmoji:{fontSize:29},stats:{flexDirection:'row',alignItems:'center',gap:24,marginTop:24},statValue:{fontSize:23,fontWeight:'900',color:'#fff'},statLabel:{fontSize:12,color:'#B7D6D2',marginTop:2},divider:{width:1,height:34,backgroundColor:'rgba(255,255,255,.2)'},card:{backgroundColor:'#fff',borderRadius:22,padding:18,borderWidth:1,borderColor:'#E3EBE9',shadowColor:'#183D37',shadowOpacity:.07,shadowRadius:12,shadowOffset:{width:0,height:5},elevation:2},cardTop:{flexDirection:'row',justifyContent:'space-between',alignItems:'flex-start',gap:10},referenceWrap:{flex:1},reference:{fontSize:18,fontWeight:'900',color:colors.text},machine:{fontSize:13,color:colors.muted,marginTop:3},status:{borderRadius:30,paddingHorizontal:10,paddingVertical:6},statusText:{fontSize:10,fontWeight:'900',color:'#33413F'},infoRow:{flexDirection:'row',gap:11,marginTop:18,alignItems:'flex-start'},infoIcon:{width:24,fontSize:20,color:colors.primary},infoLabel:{fontSize:10,fontWeight:'800',letterSpacing:1.2,color:'#8A9795'},infoValue:{fontSize:15,fontWeight:'700',color:colors.text,marginTop:2},address:{fontSize:13,lineHeight:18,color:colors.muted,marginTop:2},actions:{flexDirection:'row',gap:10,marginTop:18,paddingTop:15,borderTopWidth:1,borderTopColor:'#EDF2F1'},mapButton:{flex:1,minHeight:43,borderRadius:13,backgroundColor:'#E4F2F0',alignItems:'center',justifyContent:'center'},mapButtonText:{fontSize:13,fontWeight:'800',color:colors.primaryDark},detailsButton:{flex:1,minHeight:43,borderRadius:13,backgroundColor:colors.primary,alignItems:'center',justifyContent:'center'},detailsText:{fontSize:13,fontWeight:'800',color:'#fff'},errorCard:{padding:20,borderRadius:18,backgroundColor:'#FFF1F0',borderWidth:1,borderColor:'#FED7D3'},errorTitle:{fontSize:16,fontWeight:'800',color:colors.danger},error:{color:'#8E3939',marginTop:5},retry:{color:colors.primary,fontWeight:'800',marginTop:12}
});
