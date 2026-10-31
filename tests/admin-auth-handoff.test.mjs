import test from 'node:test';
import assert from 'node:assert/strict';
import {beginAdminLogin,pendingAdminLogin,clearAdminLogin,receiveAdminLogin,sendAdminLogin,isApprovedAdminEmail} from '../src/lib/admin-auth-handoff.ts';

function storage() { const map=new Map(); return {getItem:k=>map.get(k)??null,setItem:(k,v)=>map.set(k,v),removeItem:k=>map.delete(k)}; }
function channels() {
 const a={onmessage:null,closed:false,close(){this.closed=true},postMessage(data){queueMicrotask(()=>{if(!b.closed)b.onmessage?.({data})})}};
 const b={onmessage:null,closed:false,close(){this.closed=true},postMessage(data){queueMicrotask(()=>{if(!a.closed)a.onmessage?.({data})})}};
 return [a,b];
}
test('requests are tab-local, expiring, and contain no credentials',()=>{
 const s=storage();const id=beginAdminLogin(s,1000);
 assert.equal(pendingAdminLogin(s,1001),id);
 assert.equal(pendingAdminLogin(storage(),1001),null);
 assert.equal(pendingAdminLogin(s,1000+15*60*1000),null);
 assert.equal(pendingAdminLogin(s,999),null);
 clearAdminLogin(s);assert.equal(pendingAdminLogin(s,1001),null);
 assert.equal(isApprovedAdminEmail(' THRIVEINSIDE@protonmail.com '),true);
 assert.equal(isApprovedAdminEmail('attacker@example.com'),false);
});
test('handoff acknowledges only after verified session import, even on gate unmount',async()=>{
 const [a,b]=channels();let imported=false;let dispose;
 dispose=receiveAdminLogin(a,async tokens=>{assert.equal(tokens.access_token,'access');imported=true;dispose();return true});
 let stop;
 await new Promise(resolve=>{stop=sendAdminLogin(b,{access_token:'access',refresh_token:'refresh'},resolve)});
 stop();assert.equal(imported,true);assert.equal(a.closed,true);assert.equal(b.closed,true);
});
test('malformed messages and rejected sessions are not acknowledged',async()=>{
 const [a,b]=channels();let calls=0;let ack=false;
 const dispose=receiveAdminLogin(a,async()=>{calls++;return false});
 b.onmessage=()=>{ack=true};
 b.postMessage({type:'session',access_token:3});
 b.postMessage({type:'session',access_token:'access',refresh_token:'refresh'});
 await new Promise(resolve=>setTimeout(resolve,10));
 assert.equal(calls,1);assert.equal(ack,false);dispose();b.close();
});
