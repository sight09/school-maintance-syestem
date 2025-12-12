
const data=[
  {issue:'Broken Door', location:'Dorm', desc:'Door not closing', reporter:'Sam', status:'Pending', date:'2025-01-01', photo:''}
];
function render(){
  const table=document.getElementById('requestsTable');
  table.innerHTML='<tr><th>Issue</th><th>Location</th><th>Status</th></tr>'+
    data.map(d=>`<tr><td>${d.issue}</td><td>${d.location}</td><td>${d.status}</td></tr>`).join('');
}
render();
