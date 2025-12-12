
let data=[
  {issue:'Broken Door', location:'Dorm', desc:'Door not closing', reporter:'Sam', status:'Pending', date:'2025-01-01', photo:''}
];
function render(){
  const table=document.getElementById('adminTable');
  table.innerHTML='<tr><th>Issue</th><th>Location</th><th>Status</th><th>Action</th></tr>'+
    data.map((d,i)=>`<tr>
      <td>${d.issue}</td>
      <td>${d.location}</td>
      <td>${d.status}</td>
      <td>
        <button onclick="setStatus(${i},'Pending')">Pending</button>
        <button onclick="setStatus(${i},'In Progress')">In Progress</button>
        <button onclick="setStatus(${i},'Completed')">Completed</button>
      </td>
    </tr>`).join('');
}
function setStatus(i,s){
  data[i].status=s;
  render();
}
render();
