
firebase.initializeApp({
  apiKey:"YOUR_API_KEY",
  authDomain:"YOUR_AUTH_DOMAIN",
  projectId:"YOUR_PROJECT_ID",
  storageBucket:"YOUR_STORAGE_BUCKET",
  messagingSenderId:"YOUR_SENDER_ID",
  appId:"YOUR_APP_ID"
});
const auth = firebase.auth(), db = firebase.firestore(), storage = firebase.storage();

function switchTab(tab){
  document.querySelectorAll('.tab').forEach(s=>s.classList.remove('active'));
  document.querySelector(`#${tab}`).classList.add('active');
  document.querySelectorAll('.nav-btn').forEach(b=>b.classList.toggle('active',b.dataset.tab===tab));
}
document.querySelectorAll('.nav-btn').forEach(b=>b.addEventListener('click',()=>switchTab(b.dataset.tab)));

auth.onAuthStateChanged(user=>{
  document.getElementById('auth').style.display = user?'none':'flex';
  if(user){
    document.getElementById('userInfo').innerText = `Вы: ${user.email}`;
    loadFeed(); loadNotifications(); loadProfile(user);
  }
});

document.getElementById('regBtn').onclick = ()=>{
  auth.createUserWithEmailAndPassword(email.value,password.value).catch(e=>alert(e));
};
document.getElementById('loginBtn').onclick = ()=>{
  auth.signInWithEmailAndPassword(email.value,password.value).catch(e=>alert(e));
};

document.getElementById('postBtn').onclick = async ()=>{
  const file = document.getElementById('photoInput').files[0];
  if(!file){alert("Выберите файл");return;}
  const ref = storage.ref(`photos/${auth.currentUser.uid}/${Date.now()}_${file.name}`);
  const task = ref.put(file);
  task.on('state_changed',snap=>uploadProgress.value = (snap.bytesTransferred/snap.totalBytes)*100);
  const snap = await task;
  const url = await snap.ref.getDownloadURL();
  await db.collection('posts').add({url,uid: auth.currentUser.uid, ts: Date.now()});
  loadFeed(); loadProfile(auth.currentUser);
};

async function loadFeed(){
  const feed = document.getElementById('feed'); feed.innerHTML='';
  const snaps = await db.collection('posts').orderBy('ts','desc').get();
  snaps.forEach(d=>{
    const e = document.createElement('div');
    e.innerHTML = `<img src="${d.data().url}"><p>Пост от пользователя ${d.data().uid}</p>`;
    feed.appendChild(e);
  });
}

async function loadNotifications(){
  document.getElementById('notifs').innerHTML = '<li>Добро пожаловать!</li>';
}

async function loadProfile(user){
  const phu = document.getElementById('userPhotos'); phu.innerHTML='';
  const snaps = await db.collection('posts').where('uid','==',user.uid).orderBy('ts','desc').get();
  snaps.forEach(d=>{
    const img = document.createElement('img'); img.src = d.data().url;
    phu.appendChild(img);
  });
}
