const form = document.getElementById('loginForm');
form?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const res = await fetch('/api/auth/login', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:email.value,password:password.value})});
  const data = await res.json();
  if(!res.ok) return msg.textContent=data.message;
  localStorage.setItem('token', data.session.access_token);
  localStorage.setItem('role', data.user.user_metadata.role);
  location.href = data.user.user_metadata.role === 'student' ? '/student.html' : '/dashboard.html';
});
