import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import type { Session } from '../types';

const fallback = Platform.OS === 'android' ? 'http://10.0.2.2:8080' : 'http://localhost:8080';
export const API_URL = (process.env.EXPO_PUBLIC_API_URL || fallback).replace(/\/$/, '');
const SESSION_KEY = '@servvista/session';

export class ApiError extends Error { constructor(public status:number, message:string, public body?:unknown){ super(message); } }
export const sessionStore = { get: async()=>{ const value=await AsyncStorage.getItem(SESSION_KEY); return value ? JSON.parse(value) as Session : null; }, set:(s:Session)=>AsyncStorage.setItem(SESSION_KEY,JSON.stringify(s)), clear:()=>AsyncStorage.removeItem(SESSION_KEY) };

async function request<T>(path:string, init:RequestInit={}, retry=true):Promise<T>{
  let session=await sessionStore.get();
  const headers:Record<string,string>={Accept:'application/json',...(init.body?{'Content-Type':'application/json'}:{}),...((init.headers||{}) as Record<string,string>)};
  if(session) headers.Authorization=`Bearer ${session.accessToken}`;
  const response=await fetch(`${API_URL}${path}`,{...init,headers});
  if(response.status===401 && session && retry){
    const refresh=await fetch(`${API_URL}/api/auth/refresh`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({refreshToken:session.refreshToken,deviceLabel:'ServVista Technician Mobile'})});
    if(refresh.ok){ session=await refresh.json(); await sessionStore.set(session!); return request<T>(path,init,false); }
    await sessionStore.clear();
  }
  const text=await response.text(); let body:unknown=text; try{ body=text?JSON.parse(text):undefined; }catch{}
  if(!response.ok) throw new ApiError(response.status, typeof body==='object' && body && 'message' in body ? String((body as {message:unknown}).message) : `Request failed (${response.status})`,body);
  return body as T;
}

export const api={
  login:(email:string,password:string)=>request<Session>('/api/auth/login',{method:'POST',body:JSON.stringify({email,password,deviceLabel:'ServVista Technician Mobile'})}),
  installations:()=>request<unknown[]>('/api/technician/me/installation-jobs'),
  installationStatus:(id:number,status:string,note?:string)=>request(`/api/technician/me/installation-jobs/${id}/status`,{method:'PATCH',body:JSON.stringify({status,note})}),
  completeInstallation:(id:number,payload:unknown)=>request(`/api/technician/me/installation-jobs/${id}/complete`,{method:'POST',body:JSON.stringify(payload)}),
  breakdowns:()=>request<unknown[]>('/api/technician/me/breakdowns'),
  startBreakdown:(id:number,payload:unknown)=>request(`/api/technician/me/breakdowns/${id}/start`,{method:'PATCH',body:JSON.stringify(payload)}),
  completeBreakdown:(id:number,payload:unknown)=>request(`/api/technician/me/breakdowns/${id}/complete`,{method:'PATCH',body:JSON.stringify(payload)}),
  visits:()=>request<unknown[]>('/api/technician/me/service-schedules'),
  startVisit:(id:number,payload:unknown)=>request(`/api/technician/me/service-schedules/${id}/start`,{method:'PATCH',body:JSON.stringify(payload)}),
  completeVisit:(id:number,payload:unknown)=>request(`/api/technician/me/service-schedules/${id}/complete`,{method:'PATCH',body:JSON.stringify(payload)}),
  createEstimate:(payload:unknown)=>request('/api/technician/me/estimates',{method:'POST',body:JSON.stringify(payload)}),
  meterReadings:(ref:string)=>request<unknown[]>(`/api/meter-readings/machine/${encodeURIComponent(ref)}`),
  changePassword:(payload:unknown)=>request('/api/technician/me/password',{method:'PATCH',body:JSON.stringify(payload)})
};
