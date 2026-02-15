import { useState, useEffect, useCallback, useContext, createContext } from "react";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  query, 
  where, 
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, db, storage } from './firebaseConfig';

// ─── CSS ──────────────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=DM+Sans:wght@300;400;500;600&display=swap');
:root{
  --bg:#0c0e14;--s1:#13151f;--s2:#1a1d2e;--s3:#22263d;
  --b:rgba(255,255,255,0.07);--ba:rgba(99,179,237,0.3);
  --t:#e8eaf0;--tm:rgba(232,234,240,0.5);--td:rgba(232,234,240,0.22);
  --a:#63b3ed;--a2:#68d391;--a3:#f6ad55;--dng:#fc8181;--pur:#b794f4;
  --r:10px;
}
*{box-sizing:border-box;margin:0;padding:0;}
html,body{min-height:100vh;background:var(--bg);color:var(--t);font-family:'DM Sans',sans-serif;}
::-webkit-scrollbar{width:4px;height:4px;}
::-webkit-scrollbar-thumb{background:var(--s3);border-radius:2px;}
input,select,textarea{width:100%;padding:10px 14px;background:var(--s2);border:1px solid var(--b);border-radius:var(--r);color:var(--t);font-family:'DM Sans',sans-serif;font-size:14px;transition:border-color .2s,box-shadow .2s;}
input:focus,select:focus,textarea:focus{outline:none;border-color:var(--a);box-shadow:0 0 0 3px rgba(99,179,237,0.1);}
input::placeholder,textarea::placeholder{color:var(--td);}
select option{background:#1a1d2e;}
textarea{resize:vertical;min-height:72px;}
label{display:block;font-size:11px;font-weight:600;letter-spacing:.07em;text-transform:uppercase;color:var(--tm);margin-bottom:5px;}
.btn{display:inline-flex;align-items:center;gap:7px;padding:9px 18px;border-radius:var(--r);border:none;cursor:pointer;font-family:'DM Sans',sans-serif;font-size:13px;font-weight:600;letter-spacing:.02em;transition:all .18s;white-space:nowrap;}
.btn:disabled{opacity:.4;cursor:not-allowed;transform:none!important;}
.bp{background:var(--a);color:#0c0e14;}.bp:hover{background:#90cdf4;transform:translateY(-1px);box-shadow:0 4px 16px rgba(99,179,237,.3);}
.bg2{background:var(--a2);color:#0c0e14;}.bg2:hover{background:#9ae6b4;transform:translateY(-1px);}
.bd{background:rgba(252,129,129,.1);color:var(--dng);border:1px solid rgba(252,129,129,.25);}.bd:hover{background:rgba(252,129,129,.2);}
.bgh{background:var(--s2);color:var(--t);border:1px solid var(--b);}.bgh:hover{background:var(--s3);}
.bo{background:transparent;color:var(--a);border:1px solid var(--ba);}.bo:hover{background:rgba(99,179,237,.08);}
.bsm{padding:6px 12px;font-size:12px;border-radius:8px;}
.bic{padding:7px;border-radius:8px;}
.card{background:var(--s1);border:1px solid var(--b);border-radius:14px;padding:20px;}
.csm{background:var(--s1);border:1px solid var(--b);border-radius:10px;padding:14px 16px;}
.badge{display:inline-flex;align-items:center;gap:4px;padding:3px 9px;border-radius:20px;font-size:11px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;}
.bbl{background:rgba(99,179,237,.12);color:var(--a);border:1px solid rgba(99,179,237,.25);}
.bgr{background:rgba(104,211,145,.12);color:var(--a2);border:1px solid rgba(104,211,145,.25);}
.bam{background:rgba(246,173,85,.12);color:var(--a3);border:1px solid rgba(246,173,85,.25);}
.brd{background:rgba(252,129,129,.12);color:var(--dng);border:1px solid rgba(252,129,129,.25);}
.bpu{background:rgba(183,148,244,.12);color:var(--pur);border:1px solid rgba(183,148,244,.25);}
.bgh2{background:rgba(255,255,255,.05);color:var(--tm);border:1px solid var(--b);}
.fr{margin-bottom:14px;}
.ptitle{font-family:'Fraunces',serif;font-weight:700;font-size:24px;letter-spacing:-.03em;}
.stitle{font-family:'Fraunces',serif;font-weight:600;font-size:17px;letter-spacing:-.02em;}
.pg-track{height:5px;background:rgba(255,255,255,.07);border-radius:3px;overflow:hidden;}
.pg-fill{height:100%;border-radius:3px;transition:width .7s cubic-bezier(.34,1.56,.64,1);}
.tbar{display:flex;gap:4px;background:var(--s1);border:1px solid var(--b);border-radius:12px;padding:4px;}
.titem{flex:1;padding:8px 10px;border-radius:9px;border:none;cursor:pointer;font-family:inherit;font-size:12px;font-weight:600;letter-spacing:.04em;transition:all .18s;display:flex;align-items:center;justify-content:center;gap:6px;color:var(--tm);background:transparent;}
.titem.on{background:var(--s2);color:var(--t);box-shadow:0 1px 4px rgba(0,0,0,.3);}
.modal-overlay{position:fixed;inset:0;background:rgba(12,14,20,.85);backdrop-filter:blur(6px);z-index:200;display:flex;align-items:center;justify-content:center;padding:20px;}
.modal-box{background:var(--s1);border:1px solid var(--b);border-radius:18px;padding:26px;width:100%;max-width:500px;max-height:90vh;overflow-y:auto;animation:fadeUp .25s ease;}
.dot-grid{position:fixed;inset:0;pointer-events:none;z-index:0;background-image:radial-gradient(circle,rgba(99,179,237,.05) 1px,transparent 1px);background-size:28px 28px;}
.orb{position:fixed;pointer-events:none;z-index:0;border-radius:50%;filter:blur(90px);opacity:.1;}
@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
.fu{animation:fadeUp .35s ease both;}
.fi{animation:fadeIn .25s ease both;}
`;

// ─── ICONS ────────────────────────────────────────────────────────────────────
const PATHS = {
  check:<polyline points="20 6 9 17 4 12"/>,
  x:<><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>,
  plus:<><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>,
  trash:<><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></>,
  eye:<><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>,
  layers:<><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></>,
  user:<><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></>,
  send:<><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></>,
  calendar:<><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></>,
  target:<><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></>,
  checkSquare:<><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></>,
  msg:<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>,
  settings:<><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></>,
  logout:<><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></>,
  info:<><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></>,
};
const Ic = ({n,s=18,c="currentColor"}) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">{PATHS[n]}</svg>
);

// ─── UTILS ────────────────────────────────────────────────────────────────────
const uid = () => Math.random().toString(36).slice(2,10);
const todayStr = () => new Date().toISOString().split("T")[0];
const COLORS = ["#63b3ed","#68d391","#f6ad55","#fc8181","#b794f4","#4fd1c5"];
const ICONS = ["📚","💻","🔬","📊","🎨","⚡","🧪","📝"];

// ─── TOAST ────────────────────────────────────────────────────────────────────
const ToastCtx = createContext(null);
function ToastProvider({children}) {
  const [toasts,setToasts] = useState([]);
  const push = useCallback((msg,type="success")=>{
    const id=uid();
    setToasts(p=>[...p,{id,msg,type}]);
    setTimeout(()=>setToasts(p=>p.filter(t=>t.id!==id)),3000);
  },[]);
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div style={{position:"fixed",bottom:24,right:24,zIndex:999,display:"flex",flexDirection:"column",gap:8}}>
        {toasts.map(t=>(
          <div key={t.id} className="fi" style={{
            padding:"11px 16px",borderRadius:10,display:"flex",alignItems:"center",gap:9,
            fontSize:13,fontWeight:500,backdropFilter:"blur(12px)",
            background:t.type==="success"?"rgba(104,211,145,.12)":t.type==="error"?"rgba(252,129,129,.12)":"rgba(99,179,237,.12)",
            border:`1px solid ${t.type==="success"?"rgba(104,211,145,.3)":t.type==="error"?"rgba(252,129,129,.3)":"rgba(99,179,237,.3)"}`,
            color:t.type==="success"?"#9ae6b4":t.type==="error"?"#feb2b2":"#90cdf4",
          }}>
            <Ic n={t.type==="success"?"check":t.type==="error"?"x":"info"} s={14}/>
            {t.msg}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}
const useToast = ()=>useContext(ToastCtx);

// ─── MODAL ────────────────────────────────────────────────────────────────────
function Modal({open,onClose,title,children,width=500}) {
  if(!open) return null;
  return (
    <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal-box" style={{maxWidth:width}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
          <div className="stitle" style={{fontSize:16}}>{title}</div>
          <button className="btn bgh bic bsm" onClick={onClose}><Ic n="x" s={15}/></button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── LOGIN SCREEN ─────────────────────────────────────────────────────────────
function LoginScreen() {
  const toast = useToast();
  const [mode,setMode] = useState("login"); // login | register
  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");
  const [name,setName] = useState("");
  const [photo,setPhoto] = useState(null);
  const [photoPreview,setPhotoPreview] = useState(null);
  const [loading,setLoading] = useState(false);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if(file) {
      if(file.size > 5*1024*1024) {
        toast("Photo must be under 5MB","error");
        return;
      }
      setPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleRegister = async () => {
    if(!email.trim()||!password.trim()||!name.trim()) {
      toast("Fill all required fields","error");
      return;
    }
    setLoading(true);
    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCred.user.uid;
      
      let photoURL = null;
      if(photo) {
        const photoRef = ref(storage, `profile-photos/${uid}/${photo.name}`);
        await uploadBytes(photoRef, photo);
        photoURL = await getDownloadURL(photoRef);
      }

      await setDoc(doc(db, 'users', uid), {
        email,
        name,
        profilePhotoURL: photoURL,
        role: 'student',
        createdAt: serverTimestamp()
      });

      toast("Account created!");
    } catch(err) {
      toast(err.message,"error");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if(!email.trim()||!password.trim()) {
      toast("Enter email and password","error");
      return;
    }
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast("Welcome back!");
    } catch(err) {
      toast("Invalid credentials","error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24,position:"relative"}}>
      <style>{CSS}</style>
      <div className="dot-grid"/>
      <div className="orb" style={{width:500,height:500,background:"#63b3ed",top:-150,right:-120}}/>
      <div className="orb" style={{width:350,height:350,background:"#b794f4",bottom:-100,left:-80}}/>
      <div className="fu" style={{width:"100%",maxWidth:400,position:"relative",zIndex:1}}>
        <div style={{textAlign:"center",marginBottom:36}}>
          <div style={{width:56,height:56,borderRadius:16,background:"linear-gradient(135deg,rgba(99,179,237,.2),rgba(183,148,244,.2))",border:"1px solid var(--ba)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 14px",color:"var(--a)"}}>
            <Ic n="layers" s={26}/>
          </div>
          <div style={{fontFamily:"'Fraunces',serif",fontSize:30,fontWeight:700,letterSpacing:-.5}}>UniPulse</div>
          <div style={{color:"var(--tm)",fontSize:13,marginTop:6}}>Your Daily Campus Companion</div>
        </div>
        <div className="card">
          <div className="tbar" style={{marginBottom:20}}>
            <button className={`titem ${mode==="login"?"on":""}`} onClick={()=>setMode("login")}>Login</button>
            <button className={`titem ${mode==="register"?"on":""}`} onClick={()=>setMode("register")}>Register</button>
          </div>

          {mode==="register" && (
            <>
              <div className="fr">
                <label>Name *</label>
                <input placeholder="Your full name" value={name} onChange={e=>setName(e.target.value)}/>
              </div>
              <div className="fr">
                <label>Profile Photo (Optional)</label>
                <input type="file" accept="image/*" onChange={handlePhotoChange} style={{padding:"8px 10px"}}/>
                {photoPreview && (
                  <div style={{marginTop:8,display:"flex",justifyContent:"center"}}>
                    <img src={photoPreview} alt="Preview" style={{width:80,height:80,borderRadius:40,objectFit:"cover",border:"2px solid var(--b)"}}/>
                  </div>
                )}
              </div>
            </>
          )}

          <div className="fr">
            <label>Email *</label>
            <input type="email" placeholder="you@college.edu" value={email} onChange={e=>setEmail(e.target.value)}/>
          </div>
          <div className="fr">
            <label>Password *</label>
            <input type="password" placeholder="••••••••" value={password} onChange={e=>setPassword(e.target.value)}/>
          </div>

          <button 
            className="btn bp" 
            style={{width:"100%",justifyContent:"center",padding:13}} 
            onClick={mode==="login"?handleLogin:handleRegister}
            disabled={loading}
          >
            {loading ? "Processing..." : mode==="login" ? "Login" : "Create Account"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
function AppShell() {
  const [user,setUser] = useState(null);
  const [userData,setUserData] = useState(null);
  const [loading,setLoading] = useState(true);
  const [page,setPage] = useState("schedule");
  const toast = useToast();

  useEffect(()=>{
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if(firebaseUser) {
        setUser(firebaseUser);
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if(userDoc.exists()) {
          setUserData(userDoc.data());
        }
      } else {
        setUser(null);
        setUserData(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  },[]);

  const handleLogout = async () => {
    if(window.confirm("Log out?")) {
      await signOut(auth);
      toast("Logged out");
    }
  };

  if(loading) return <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",color:"var(--tm)"}}>Loading...</div>;
  if(!user) return <LoginScreen/>;

  const navPages = [
    {id:"schedule",icon:"calendar",label:"Schedule"},
    {id:"goals",icon:"checkSquare",label:"Goals"},
    {id:"queries",icon:"msg",label:"Queries"},
  ];

  return (
    <div style={{minHeight:"100vh"}}>
      <style>{CSS}</style>
      <div className="dot-grid"/>
      <div className="orb" style={{width:500,height:500,background:"#63b3ed",top:-180,right:-130}}/>

      {/* NAV */}
      <header style={{position:"sticky",top:0,zIndex:50,background:"rgba(12,14,20,.88)",backdropFilter:"blur(20px)",borderBottom:"1px solid var(--b)"}}>
        <div style={{maxWidth:1000,margin:"0 auto",padding:"0 20px",height:58,display:"flex",alignItems:"center",justifyContent:"space-between",gap:12}}>
          <div style={{display:"flex",alignItems:"center",gap:9,flexShrink:0}}>
            <div style={{width:28,height:28,borderRadius:7,background:"linear-gradient(135deg,rgba(99,179,237,.2),rgba(183,148,244,.2))",border:"1px solid var(--ba)",display:"flex",alignItems:"center",justifyContent:"center",color:"var(--a)"}}><Ic n="layers" s={14}/></div>
            <span style={{fontFamily:"'Fraunces',serif",fontSize:15,fontWeight:700,letterSpacing:-.3}}>UniPulse</span>
          </div>

          <div style={{display:"flex",gap:3,flex:1,justifyContent:"center"}}>
            {navPages.map(p=>(
              <button key={p.id} onClick={()=>setPage(p.id)}
                style={{padding:"6px 14px",borderRadius:8,border:"none",cursor:"pointer",fontFamily:"inherit",fontSize:12,fontWeight:600,transition:"all .15s",display:"flex",alignItems:"center",gap:5,
                  background:page===p.id?"var(--s2)":"transparent",
                  color:page===p.id?"var(--t)":"var(--tm)",
                }}>
                <Ic n={p.icon} s={13}/>{p.label}
              </button>
            ))}
          </div>

          <div style={{display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
            <div style={{display:"flex",alignItems:"center",gap:7,padding:"5px 10px",background:"var(--s2)",borderRadius:8,border:"1px solid var(--b)"}}>
              {userData?.profilePhotoURL ? (
                <img src={userData.profilePhotoURL} alt="Profile" style={{width:22,height:22,borderRadius:11,objectFit:"cover"}}/>
              ) : (
                <div style={{width:22,height:22,borderRadius:11,background:"var(--s3)",border:"1px solid var(--b)",display:"flex",alignItems:"center",justifyContent:"center",color:"var(--tm)"}}><Ic n="user" s={12}/></div>
              )}
              <span style={{fontSize:12,color:"var(--tm)",maxWidth:80,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{userData?.name||"User"}</span>
              <button className="btn bgh bic" style={{padding:"4px",borderRadius:6}} onClick={handleLogout} title="Logout"><Ic n="logout" s={14}/></button>
            </div>
          </div>
        </div>
      </header>

      {/* PAGE */}
      <main style={{maxWidth:1000,margin:"0 auto",padding:"28px 20px",position:"relative",zIndex:1}}>
        {page==="schedule"&&<ScheduleSection userId={user.uid}/>}
        {page==="goals"&&<GoalsSection userId={user.uid}/>}
        {page==="queries"&&<QueriesSection userId={user.uid} userData={userData}/>}
      </main>
    </div>
  );
}

// ─── SCHEDULE SECTION ─────────────────────────────────────────────────────────
function ScheduleSection({userId}) {
  const toast = useToast();
  const [subjects,setSubjects] = useState([]);
  const [slots,setSlots] = useState([]);
  const [targetTheory,setTargetTheory] = useState(75);
  const [targetPractical,setTargetPractical] = useState(75);
  const [showAddSubject,setShowAddSubject] = useState(false);
  const [showAddSlot,setShowAddSlot] = useState(false);
  const [newSubject,setNewSubject] = useState({name:"",color:COLORS[0],icon:ICONS[0]});
  const [newSlot,setNewSlot] = useState({day:1,startTime:"09:00",endTime:"10:00",subjectId:"",type:"theory"});

  useEffect(()=>{
    const q = query(collection(db, 'subjects'), where('userId','==',userId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setSubjects(snapshot.docs.map(doc=>({id:doc.id,...doc.data()})));
    });
    return ()=>unsubscribe();
  },[userId]);

  useEffect(()=>{
    const q = query(collection(db, 'slots'), where('userId','==',userId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setSlots(snapshot.docs.map(doc=>({id:doc.id,...doc.data()})));
    });
    return ()=>unsubscribe();
  },[userId]);

  const addSubject = async () => {
    if(!newSubject.name.trim()) {toast("Enter subject name","error");return;}
    await addDoc(collection(db,'subjects'),{
      userId,
      name:newSubject.name.trim(),
      color:newSubject.color,
      icon:newSubject.icon
    });
    setNewSubject({name:"",color:COLORS[0],icon:ICONS[0]});
    setShowAddSubject(false);
    toast("Subject added");
  };

  const addSlot = async () => {
    if(!newSlot.subjectId) {toast("Select a subject","error");return;}
    await addDoc(collection(db,'slots'),{
      userId,
      dayOfWeek:newSlot.day,
      startTime:newSlot.startTime,
      endTime:newSlot.endTime,
      subjectId:newSlot.subjectId,
      type:newSlot.type
    });
    setNewSlot({day:1,startTime:"09:00",endTime:"10:00",subjectId:"",type:"theory"});
    setShowAddSlot(false);
    toast("Slot added");
  };

  const deleteSlot = async (id) => {
    if(window.confirm("Delete this slot?")) {
      await deleteDoc(doc(db,'slots',id));
      toast("Slot deleted");
    }
  };

  const DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  const slotsByDay = DAYS.map((_,i)=>slots.filter(s=>s.dayOfWeek===i));

  return (
    <div className="fu">
      <div style={{marginBottom:22}}>
        <div className="ptitle">Schedule</div>
        <div style={{color:"var(--tm)",fontSize:13,marginTop:4}}>Manage your weekly timetable</div>
      </div>

      <div style={{display:"flex",gap:10,marginBottom:20,flexWrap:"wrap"}}>
        <button className="btn bp" onClick={()=>setShowAddSubject(true)}><Ic n="plus" s={14}/> Add Subject</button>
        <button className="btn bg2" onClick={()=>setShowAddSlot(true)}><Ic n="plus" s={14}/> Add Slot</button>
      </div>

      {subjects.length===0 && (
        <div className="card" style={{textAlign:"center",padding:40}}>
          <div style={{color:"var(--tm)",marginBottom:14}}>Add subjects first to create your schedule</div>
          <button className="btn bp" onClick={()=>setShowAddSubject(true)}><Ic n="plus" s={14}/> Add Your First Subject</button>
        </div>
      )}

      {subjects.length>0 && (
        <>
          <div style={{marginBottom:20}}>
            <div className="stitle" style={{marginBottom:12}}>Your Subjects</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))",gap:10}}>
              {subjects.map(sub=>(
                <div key={sub.id} className="csm" style={{display:"flex",alignItems:"center",gap:10}}>
                  <div style={{fontSize:24}}>{sub.icon}</div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:13,fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{sub.name}</div>
                    <div style={{width:20,height:4,borderRadius:2,background:sub.color,marginTop:3}}/>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="stitle" style={{marginBottom:12}}>Weekly Timetable</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:10}}>
            {DAYS.map((day,i)=>{
              const daySlots = slotsByDay[i];
              return (
                <div key={i}>
                  <div style={{fontSize:12,fontWeight:700,color:"var(--a)",marginBottom:8,textAlign:"center"}}>{day}</div>
                  <div style={{display:"flex",flexDirection:"column",gap:6}}>
                    {daySlots.length===0 ? (
                      <div style={{fontSize:11,color:"var(--td)",textAlign:"center",padding:"20px 5px"}}>No classes</div>
                    ) : daySlots.sort((a,b)=>a.startTime.localeCompare(b.startTime)).map(slot=>{
                      const sub = subjects.find(s=>s.id===slot.subjectId);
                      return (
                        <div key={slot.id} className="csm" style={{padding:"8px",position:"relative",background:sub?.color+"15",borderColor:sub?.color+"40"}}>
                          <button onClick={()=>deleteSlot(slot.id)} style={{position:"absolute",top:2,right:2,background:"var(--s1)",border:"none",borderRadius:4,padding:"2px 4px",cursor:"pointer",opacity:.6}} title="Delete">
                            <Ic n="x" s={10} c="var(--dng)"/>
                          </button>
                          <div style={{fontSize:20,marginBottom:4}}>{sub?.icon}</div>
                          <div style={{fontSize:11,fontWeight:600,marginBottom:2,lineHeight:1.2}}>{sub?.name}</div>
                          <div style={{fontSize:9,color:"var(--tm)"}}>{slot.startTime}-{slot.endTime}</div>
                          <div style={{fontSize:9,color:"var(--tm)",marginTop:2}}>{slot.type==="theory"?"📖 Theory":"🔬 Practical"}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{marginTop:30}}>
            <div className="stitle" style={{marginBottom:12}}>Attendance Targets</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:14}}>
              <div className="csm">
                <label>Theory Target %</label>
                <input type="number" min={0} max={100} value={targetTheory} onChange={e=>setTargetTheory(Number(e.target.value))} />
              </div>
              <div className="csm">
                <label>Practical Target %</label>
                <input type="number" min={0} max={100} value={targetPractical} onChange={e=>setTargetPractical(Number(e.target.value))} />
              </div>
            </div>
          </div>
        </>
      )}

      <Modal open={showAddSubject} onClose={()=>setShowAddSubject(false)} title="Add Subject">
        <div className="fr">
          <label>Subject Name</label>
          <input placeholder="e.g. Data Structures" value={newSubject.name} onChange={e=>setNewSubject(p=>({...p,name:e.target.value}))}/>
        </div>
        <div className="fr">
          <label>Icon</label>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            {ICONS.map(icon=>(
              <div key={icon} onClick={()=>setNewSubject(p=>({...p,icon}))} style={{fontSize:24,cursor:"pointer",padding:4,border:newSubject.icon===icon?"2px solid var(--a)":"2px solid transparent",borderRadius:6}}>
                {icon}
              </div>
            ))}
          </div>
        </div>
        <div className="fr">
          <label>Color</label>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            {COLORS.map(c=>(
              <div key={c} onClick={()=>setNewSubject(p=>({...p,color:c}))} style={{width:26,height:26,borderRadius:6,background:c,cursor:"pointer",border:newSubject.color===c?"3px solid #fff":"2px solid transparent",transform:newSubject.color===c?"scale(1.15)":"scale(1)",transition:"all .15s"}}/>
            ))}
          </div>
        </div>
        <button className="btn bp" style={{width:"100%",justifyContent:"center"}} onClick={addSubject}>Add Subject</button>
      </Modal>

      <Modal open={showAddSlot} onClose={()=>setShowAddSlot(false)} title="Add Time Slot">
        <div className="fr">
          <label>Day</label>
          <select value={newSlot.day} onChange={e=>setNewSlot(p=>({...p,day:Number(e.target.value)}))}>
            {DAYS.map((day,i)=><option key={i} value={i}>{day}</option>)}
          </select>
        </div>
        <div className="fr">
          <label>Subject</label>
          <select value={newSlot.subjectId} onChange={e=>setNewSlot(p=>({...p,subjectId:e.target.value}))}>
            <option value="">Select subject</option>
            {subjects.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div className="fr">
          <label>Type</label>
          <select value={newSlot.type} onChange={e=>setNewSlot(p=>({...p,type:e.target.value}))}>
            <option value="theory">Theory</option>
            <option value="practical">Practical</option>
          </select>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
          <div>
            <label>Start Time</label>
            <input type="time" value={newSlot.startTime} onChange={e=>setNewSlot(p=>({...p,startTime:e.target.value}))}/>
          </div>
          <div>
            <label>End Time</label>
            <input type="time" value={newSlot.endTime} onChange={e=>setNewSlot(p=>({...p,endTime:e.target.value}))}/>
          </div>
        </div>
        <button className="btn bp" style={{width:"100%",justifyContent:"center"}} onClick={addSlot}>Add Slot</button>
      </Modal>
    </div>
  );
}

// ─── GOALS SECTION ────────────────────────────────────────────────────────────
function GoalsSection({userId}) {
  const toast = useToast();
  const [goals,setGoals] = useState([]);
  const [newGoal,setNewGoal] = useState("");
  const [selectedDate,setSelectedDate] = useState(todayStr());

  useEffect(()=>{
    const q = query(collection(db,'goals'),where('userId','==',userId),where('date','==',selectedDate));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setGoals(snapshot.docs.map(doc=>({id:doc.id,...doc.data()})));
    });
    return ()=>unsubscribe();
  },[userId,selectedDate]);

  const addGoal = async () => {
    if(!newGoal.trim()) {toast("Enter a goal","error");return;}
    await addDoc(collection(db,'goals'),{
      userId,
      description:newGoal.trim(),
      completed:false,
      date:selectedDate,
      createdAt:serverTimestamp()
    });
    setNewGoal("");
    toast("Goal added");
  };

  const toggleGoal = async (id,completed) => {
    await updateDoc(doc(db,'goals',id),{completed:!completed});
  };

  const deleteGoal = async (id) => {
    await deleteDoc(doc(db,'goals',id));
    toast("Goal deleted");
  };

  return (
    <div className="fu">
      <div style={{marginBottom:22}}>
        <div className="ptitle">Daily Goals</div>
        <div style={{color:"var(--tm)",fontSize:13,marginTop:4}}>Track your daily tasks</div>
      </div>

      <div className="fr">
        <label>Date</label>
        <input type="date" value={selectedDate} onChange={e=>setSelectedDate(e.target.value)}/>
      </div>

      <div style={{display:"flex",gap:10,marginBottom:20}}>
        <input placeholder="Add a new goal..." value={newGoal} onChange={e=>setNewGoal(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addGoal()}/>
        <button className="btn bp" onClick={addGoal}><Ic n="plus" s={14}/></button>
      </div>

      {goals.length===0 ? (
        <div className="card" style={{textAlign:"center",padding:40,color:"var(--tm)"}}>No goals for this day</div>
      ) : (
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {goals.map(goal=>(
            <div key={goal.id} className="csm" style={{display:"flex",alignItems:"center",gap:12}}>
              <button onClick={()=>toggleGoal(goal.id,goal.completed)} style={{width:24,height:24,borderRadius:6,border:"2px solid var(--a)",background:goal.completed?"var(--a)":"transparent",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",transition:"all .2s"}}>
                {goal.completed&&<Ic n="check" s={14} c="#0c0e14"/>}
              </button>
              <div style={{flex:1,fontSize:14,color:goal.completed?"var(--td)":"var(--t)",textDecoration:goal.completed?"line-through":"none"}}>{goal.description}</div>
              <button className="btn bd bic bsm" onClick={()=>deleteGoal(goal.id)}><Ic n="x" s={13}/></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── QUERIES SECTION ──────────────────────────────────────────────────────────
function QueriesSection({userId,userData}) {
  const toast = useToast();
  const [queries,setQueries] = useState([]);
  const [showRaise,setShowRaise] = useState(false);
  const [title,setTitle] = useState("");
  const [description,setDescription] = useState("");
  const [isPersonal,setIsPersonal] = useState(false);

  useEffect(()=>{
    const q = query(collection(db,'queries'),where('userId','==',userId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setQueries(snapshot.docs.map(doc=>({id:doc.id,...doc.data()})));
    });
    return ()=>unsubscribe();
  },[userId]);

  const raiseQuery = async () => {
    if(!title.trim()||!description.trim()) {toast("Fill all fields","error");return;}
    await addDoc(collection(db,'queries'),{
      userId,
      title:title.trim(),
      description:description.trim(),
      status:'pending',
      isPersonal,
      createdAt:serverTimestamp()
    });
    setTitle("");
    setDescription("");
    setShowRaise(false);
    toast("Query raised");
  };

  const statusBadge = s=>s==="pending"?"bam":s==="in-progress"?"bbl":"bgr";

  return (
    <div className="fu">
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20,flexWrap:"wrap",gap:12}}>
        <div>
          <div className="ptitle">Queries</div>
          <div style={{color:"var(--tm)",fontSize:13,marginTop:3}}>{queries.length} total queries</div>
        </div>
        <button className="btn bp" onClick={()=>setShowRaise(true)}><Ic n="send" s={14}/> Raise Query</button>
      </div>

      {queries.length===0 ? (
        <div className="card" style={{textAlign:"center",padding:40,color:"var(--tm)"}}>No queries yet</div>
      ) : (
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {queries.map(q=>(
            <div key={q.id} className="card" style={{borderLeft:`3px solid var(--${statusBadge(q.status).slice(1)}`}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:8,flexWrap:"wrap",gap:8}}>
                <div style={{fontWeight:600,fontSize:15}}>{q.title}</div>
                <span className={`badge ${statusBadge(q.status)}`}>{q.status}</span>
              </div>
              <div style={{fontSize:13,color:"var(--tm)",marginBottom:8}}>{q.description}</div>
              <div style={{fontSize:11,color:"var(--td)"}}>{q.isPersonal?"Personal Query":"Group Query"}</div>
            </div>
          ))}
        </div>
      )}

      <Modal open={showRaise} onClose={()=>setShowRaise(false)} title="Raise Query">
        <div className="fr">
          <label>Title</label>
          <input placeholder="Brief summary" value={title} onChange={e=>setTitle(e.target.value)}/>
        </div>
        <div className="fr">
          <label>Description</label>
          <textarea placeholder="Describe your query..." value={description} onChange={e=>setDescription(e.target.value)} rows={5}/>
        </div>
        <div style={{marginBottom:16}}>
          <label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer"}}>
            <input type="checkbox" checked={isPersonal} onChange={e=>setIsPersonal(e.target.checked)} style={{width:"auto"}}/>
            <span>Mark as personal</span>
          </label>
        </div>
        <button className="btn bp" style={{width:"100%",justifyContent:"center"}} onClick={raiseQuery}>Submit Query</button>
      </Modal>
    </div>
  );
}

export default function App() {
  return (
    <>
      <style>{CSS}</style>
      <ToastProvider><AppShell/></ToastProvider>
    </>
  );
}
