// Data
const activities = [
{S_No:1, City:'Tokyo', Activity:'Visit Tokyo Skytree', Description:"World's tallest tower at 634m offering panoramic views; decks at 350m and 450m; shops, aquarium, restaurants.", How_to_reach:'Tokyo Skytree Stn or Asakusa', Cost:'¥1,800-2,700'},
{S_No:2, City:'Tokyo', Activity:'Explore Senso-ji Temple & Asakusa', Description:"Tokyo's oldest temple (645 AD); Nakamise shopping street; incense and omikuji.", How_to_reach:'Asakusa Stn (5 min)', Cost:'Free'},
{S_No:3, City:'Tokyo', Activity:'TeamLab Planets Digital Art Museum', Description:'Immersive digital art; walk through water; 4 large artworks + 2 gardens; barefoot.', How_to_reach:'Shin-Toyosu (1 min)', Cost:'¥3,800'},
// ... include items 4–100 exactly as provided earlier ...
];

// Utility: parse cost for estimate
function estimateCost(costStr){
if(!costStr || costStr.toLowerCase().includes('free')) return 0;
const nums = [...costStr.matchAll(/¥?([0-9,]+)/g)].map(m=>parseInt(m.replace(/,/g,'')));
if(nums.length===0) return 0;
if(nums.length===1) return nums;
// average range
return Math.round((nums+nums)/2);
}

const state = {
filterText: '', city: '', cost: '', selections: new Map() // key: S_No → 'Yes'|'No'|'Maybe'|''
};

function renderTable(){
const tbody = document.querySelector('#activitiesTable tbody');
tbody.innerHTML = '';
let data = activities.slice();

// Search filter
const q = state.filterText.toLowerCase();
if(q){
data = data.filter(a => [a.City,a.Activity,a.Description,a.How_to_reach,a.Cost].join(' ').toLowerCase().includes(q));
}
// City filter
if(state.city){
data = data.filter(a => a.City === state.city);
}
// Cost filter
if(state.cost){
data = data.filter(a=>{
const est = estimateCost(a.Cost);
if(state.cost==='free') return est===0;
if(state.cost==='under1k') return est>0 && est<1000;
if(state.cost==='1kto3k') return est>=1000 && est<=3000;
if(state.cost==='over3k') return est>3000;
return true;
});
}

for(const a of data){
const tr = document.createElement('tr');
tr.innerHTML = <td>${a.S_No}</td> <td><span class=\"badge\">${a.City}</span></td> <td>${a.Activity}</td> <td>${a.Description}</td> <td>${a.How_to_reach}</td> <td>${a.Cost}</td> <td class=\"select-cell\"> <select data-id=\"${a.S_No}\"> <option value=\"\">Select</option> <option value=\"Yes\">Yes</option> <option value=\"Maybe\">Maybe</option> <option value=\"No\">No</option> </select> </td> ;
tbody.appendChild(tr);
const sel = tr.querySelector('select');
sel.value = state.selections.get(a.S_No) || '';
sel.addEventListener('change', e => {
const val = e.target.value;
if(val) state.selections.set(a.S_No, val); else state.selections.delete(a.S_No);
updateSummary();
});
}
}

function updateSummary(){
const totalYes = [...state.selections.values()].filter(v=>v==='Yes').length;
const totalMaybe = [...state.selections.values()].filter(v=>v==='Maybe').length;
const totalNo = [...state.selections.values()].filter(v=>v==='No').length;
document.getElementById('countYes').textContent = totalYes;
document.getElementById('countMaybe').textContent = totalMaybe;
document.getElementById('countNo').textContent = totalNo;
document.getElementById('totalSelected').textContent = totalYes + totalMaybe + totalNo;

// Estimated cost for Yes + Maybe (avg)
const selected = activities.filter(a => {
const s = state.selections.get(a.S_No);
return s==='Yes' || s==='Maybe';
});
const est = selected.reduce((sum,a)=> sum + estimateCost(a.Cost), 0);
document.getElementById('estimatedCost').textContent = '¥' + est.toLocaleString();

// By city
const byCity = {};
for(const a of selected){
byCity[a.City] = (byCity[a.City]||0)+1;
}
const byCityDiv = document.getElementById('byCity');
byCityDiv.innerHTML = Object.keys(byCity).length ? Object.entries(byCity).map(([c,n])=>${c}: ${n}).join(' - ') : 'By city: —';
}

function exportSelected(){
const rows = activities.filter(a => {
const s = state.selections.get(a.S_No);
return s==='Yes' || s==='Maybe';
}).map(a => {
const s = state.selections.get(a.S_No) || '';
return ${a.S_No}. [${a.City}] ${a.Activity} — ${s}\n - ${a.Description}\n - How to reach: ${a.How_to_reach}\n - Cost: ${a.Cost};
}).join('\n\n');
const blob = new Blob([rows], {type:'text/plain;charset=utf-8'});
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url; a.download = 'selected-activities.txt';
document.body.appendChild(a); a.click(); a.remove();
URL.revokeObjectURL(url);
}

function init(){
document.getElementById('search').addEventListener('input', e => {
state.filterText = e.target.value; renderTable();
});
document.getElementById('cityFilter').addEventListener('change', e => {
state.city = e.target.value; renderTable();
});
document.getElementById('costFilter').addEventListener('change', e => {
state.cost = e.target.value; renderTable();
});
document.getElementById('clearFilters').addEventListener('click', ()=>{
state.filterText=''; state.city=''; state.cost='';
document.getElementById('search').value='';
document.getElementById('cityFilter').value='';
document.getElementById('costFilter').value='';
renderTable();
});
document.getElementById('exportBtn').addEventListener('click', exportSelected);
document.getElementById('selectAllInCity').addEventListener('click', ()=>{
const city = document.getElementById('cityFilter').value;
if(!city){ alert('Please choose a city filter first.'); return; }
for(const a of activities){ if(a.City===city){ state.selections.set(a.S_No,'Yes'); } }
renderTable(); updateSummary();
});

renderTable(); updateSummary();
}
document.addEventListener('DOMContentLoaded', init);