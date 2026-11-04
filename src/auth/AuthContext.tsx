import React,{createContext,useContext,useEffect,useState} from 'react';
import { api,sessionStore } from '../api/client';
import type { Session } from '../types';
type AuthValue={session:Session|null;loading:boolean;login:(e:string,p:string)=>Promise<void>;logout:()=>Promise<void>};
const AuthContext=createContext<AuthValue|null>(null);
export function AuthProvider({children}:{children:React.ReactNode}){ const [session,setSession]=useState<Session|null>(null); const [loading,setLoading]=useState(true); useEffect(()=>{sessionStore.get().then(setSession).finally(()=>setLoading(false));},[]); const login=async(e:string,p:string)=>{const next=await api.login(e,p); if(next.role!=='TECHNICIAN') throw new Error('This app is available only for technician accounts.'); await sessionStore.set(next); setSession(next);}; const logout=async()=>{await sessionStore.clear();setSession(null);}; return <AuthContext.Provider value={{session,loading,login,logout}}>{children}</AuthContext.Provider> }
export const useAuth=()=>{const value=useContext(AuthContext);if(!value)throw new Error('AuthProvider missing');return value;};
