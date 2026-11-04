export type UserRole = 'TECHNICIAN' | 'COORDINATOR' | 'SALESMAN' | 'FINANCE' | 'ADMIN' | 'MACHINE';
export interface Session { accessToken:string; refreshToken:string; expiresAt:string; refreshTokenExpiresAt:string; userId:number; userName:string; email:string; role:UserRole }
export type JobKind = 'installation' | 'breakdown' | 'visit';
export interface Job { id:number; kind:JobKind; title:string; customer?:string; machine?:string; address?:string; scheduledAt?:string; status:string; raw:Record<string,unknown> }
