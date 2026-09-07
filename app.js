'use strict';
const data=window.ATLAS_DATA,assets=data.assets;
const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const categories=['全部生物',...new Set(assets.map(a=>a.category))];
let category='全部生物',query='',visible=assets.slice(),current=null,opener=null;
$('categories').innerHTML=categories.map(c=>'<button class="cat '+(c===category?'active':'')+'" data-category="'+esc(c)+'" aria-pressed="'+(c===category)+'">'+esc(c)+'<span>'+String(c==='全部生物'?assets.length:assets.filter(a=>a.category===c).length).padStart(2,'0')+'</span></button>').join('');
function filterAssets(list,c,q){q=q.trim().toLowerCase();return list.filter(a=>(c==='全部生物'||a.category===c)&&(!q||[a.name,a.id,a.feature,a.reason,a.category,a.origin,a.environment,a.evidence].join(' ').toLowerCase().includes(q)))}
function render(){
 visible=filterAssets(assets,category,query);
 $('catalogTitle').textContent=category;
 $('resultCount').textContent='显示 '+visible.length+' / '+assets.length+' 类生物';
 $('empty').hidden=visible.length>0;
 $('reset').hidden=category==='全部生物'&&!query;
 $('catalog').innerHTML=visible.map(a=>'<article class="specimen"><button class="card-image" data-id="'+esc(a.id)+'" aria-label="查看 '+esc(a.name)+' 的大图与推演理由"><span class="card-code">'+esc(a.id)+'</span><img src="'+esc(a.file)+'" alt="'+esc(a.name)+'" loading="lazy" decoding="async"><span class="card-open" aria-hidden="true">↗</span></button><div class="card-copy"><div class="card-meta"><span class="tag">'+esc(a.category)+'</span><span>'+esc(a.origin)+'</span></div><h3><button class="title-button" data-id="'+esc(a.id)+'">'+esc(a.name)+'</button></h3><p class="feature">'+esc(a.feature)+'</p><p class="card-reason"><b>推演理由</b><span class="clamp">'+esc(a.reason)+'</span></p></div></article>').join('');
}
function syncControls(){document.querySelectorAll('.cat').forEach(b=>{const active=b.dataset.category===category;b.classList.toggle('active',active);b.setAttribute('aria-pressed',active)})}
function reset(){category='全部生物';query='';$('search').value='';syncControls();render()}
$('categories').onclick=e=>{const b=e.target.closest('[data-category]');if(!b)return;category=b.dataset.category;syncControls();render()};
$('search').oninput=e=>{query=e.target.value;render()};
$('reset').onclick=reset;$('emptyReset').onclick=reset;
$('catalog').onclick=e=>{const b=e.target.closest('[data-id]');if(b)openDetail(b.dataset.id,b)};
function openDetail(id,button=null){
 const a=assets.find(x=>x.id===id);if(!a)return;current=a;if(button)opener=button;
 $('detailCode').textContent=a.id;
 $('detailTitle').textContent=a.name;$('detailType').textContent=a.category+' · '+a.origin;
 $('detailSource').textContent='独立生物资产';
 $('detailImage').src=a.file;$('detailImage').alt=a.name;
 $('imageNote').textContent=a.width+' × '+a.height+' px · 黑色背景';
 $('download').href=a.file;$('download').download=a.id+'_'+a.name+'.png';$('fullImage').href=a.file;
 $('feature').textContent=a.feature;$('reason').textContent=a.reason;
 const scientific=Boolean(a.evidence);
 $('scienceDetail').hidden=!scientific;
 $('environment').textContent=a.environment||'';
 $('evidence').textContent=a.evidence||'';
 $('limits').textContent=a.limits||'';
 $('scienceSources').innerHTML=(a.sources||[]).map(s=>'<li><a href="'+esc(s.url)+'" target="_blank" rel="noopener">'+esc(s.title)+' ↗</a></li>').join('');
 $('detailDisclaimer').textContent=scientific?'来源支持地球生命机制；外星形态、体量与环境组合属于推演。':'以上功能是从形态出发的艺术设定。';
 $('reconstruction').textContent=a.note;
 $('referenceDetails').open=false;
 $('refLink').hidden=!a.reference_file;
 if(a.reference_file){$('refLink').href=a.reference_file;$('refImage').src=a.reference_file}
 else $('refImage').removeAttribute('src');
 $('referenceNote').textContent=a.reference_file?'点击查看原始参考图。名称为本图谱整理命名。':'原创生物，依据环境假设与形态逻辑设计。';
 if(!$('detail').open)$('detail').showModal();
 $('detail').scrollTop=0;document.body.style.overflow='hidden';
 const inList=visible.some(x=>x.id===id);$('prev').disabled=!inList||visible.length<2;$('next').disabled=!inList||visible.length<2;
}
function step(direction){if(!current||visible.length<2)return;const i=visible.findIndex(x=>x.id===current.id);if(i>=0)openDetail(visible[(i+direction+visible.length)%visible.length].id)}
$('prev').onclick=()=>step(-1);$('next').onclick=()=>step(1);
$('close').onclick=()=>$('detail').close();
$('detail').addEventListener('close',()=>{document.body.style.overflow='';if(opener?.isConnected)opener.focus()});
$('detail').addEventListener('click',e=>{if(e.target===$('detail')){const r=$('detail').getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)$('detail').close()}});
document.addEventListener('keydown',e=>{if(!$('detail').open||e.target.matches('input,textarea'))return;if(e.key==='ArrowLeft'){e.preventDefault();step(-1)}if(e.key==='ArrowRight'){e.preventDefault();step(1)}});
$('toTop').onclick=e=>{e.preventDefault();window.scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'})};
$('totalSpecies').textContent=assets.length;
$('exploreAll').onclick=()=>{reset();$('catalogTitle').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'})};
document.querySelectorAll('[data-science-id]').forEach(b=>b.onclick=()=>openDetail(b.dataset.scienceId,b));
render();
