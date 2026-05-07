function authHeader(){return {Authorization:`Bearer ${localStorage.getItem('token')}`,'Content-Type':'application/json'}}
function logout(){localStorage.clear();location.href='/' }
