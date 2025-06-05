// Login form submission
document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = loginForm.email.value.trim();
      const password = loginForm.password.value;
      if (!email || !password) {
        alert('Please fill in all fields');
        return;
      }
      try {
        const res = await fetch('/api/v1/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
          credentials: 'same-origin'
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Login failed');
        window.location.href = `/${data.user.role}/dashboard`;
      } catch (err) {
        alert(err.message);
      }
    });
  }

  // Register form submission
  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = registerForm.email.value.trim();
      const password = registerForm.password.value;
      const role = registerForm.role.value;
      const firstName = registerForm.firstName ? registerForm.firstName.value.trim() : '';
      const lastName = registerForm.lastName ? registerForm.lastName.value.trim() : '';
      const discipline = registerForm.discipline ? registerForm.discipline.value.trim() : '';
      if (!email || !password) {
        alert('Please fill in all fields');
        return;
      }
      if (role === 'teacher' && (!firstName || !lastName || !discipline)) {
        alert('Please fill in all teacher fields');
        return;
      }
      try {
        const res = await fetch('/api/v1/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, role, firstName, lastName, discipline }),
          credentials: 'same-origin'
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Registration failed');
        window.location.href = `/${data.user.role}/dashboard`;
      } catch (err) {
        alert(err.message);
      }
    });
  }

  // Logout button
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      try {
        const res = await fetch('/api/v1/auth/logout', {
          method: 'GET',
          credentials: 'same-origin'
        });
        if (!res.ok) throw new Error('Logout failed');
        window.location.href = '/login';
      } catch (err) {
        alert(err.message);
      }
    });
  }

  // Show/hide teacher fields based on role selection
  const roleSelect = document.getElementById('role');
  const teacherFields = document.getElementById('teacherFields');
  if (roleSelect && teacherFields) {
    roleSelect.addEventListener('change', () => {
      if (roleSelect.value === 'teacher') {
        teacherFields.style.display = 'block';
      } else {
        teacherFields.style.display = 'none';
      }
    });
  }
});
