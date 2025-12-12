
document.getElementById('photo').addEventListener('change', e=>{
  const file=e.target.files[0];
  if(file){
    const img=document.getElementById('preview');
    img.src=URL.createObjectURL(file);
    img.style.display='block';
  }
});
