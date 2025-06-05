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
      let firstName = '';
      let lastName = '';
      let discipline = '';
      if (role === 'teacher') {
        firstName = document.getElementById('firstName') ? document.getElementById('firstName').value.trim() : '';
        lastName = document.getElementById('lastName') ? document.getElementById('lastName').value.trim() : '';
        discipline = registerForm.discipline ? registerForm.discipline.value.trim() : '';
      } else if (role === 'student') {
        firstName = document.getElementById('firstNameStudent') ? document.getElementById('firstNameStudent').value.trim() : '';
        lastName = document.getElementById('lastNameStudent') ? document.getElementById('lastNameStudent').value.trim() : '';
      }
      console.log('Registration attempt:', { email, role, firstName, lastName, discipline });
      if (!email || !password) {
        alert('Please fill in all fields');
        return;
      }
      if ((role === 'teacher' || role === 'student') && (!firstName || !lastName || (role === 'teacher' && !discipline))) {
        if (role === 'teacher') {
          alert('Please fill in all teacher fields');
        } else {
          alert('Please fill in all student fields');
        }
        return;
      }
      try {
        const bodyData = { email, password, role, firstName, lastName };
        if (role === 'teacher') {
          bodyData.discipline = discipline;
        }
        if (role === 'student') {
          bodyData.group = registerForm.group ? registerForm.group.value.trim() : '';
        }
        const res = await fetch('/api/v1/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bodyData),
          credentials: 'same-origin'
        });
        const data = await res.json();
        if (!res.ok) {
          alert(data.message || 'Registration failed');
          return;
        }
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

  // Show/hide teacher and student fields based on role selection
  const roleSelect = document.getElementById('role');
  const teacherFields = document.getElementById('teacherFields');
  const studentFields = document.getElementById('studentFields');
  if (roleSelect && teacherFields && studentFields) {
    const toggleFields = () => {
      if (roleSelect.value === 'teacher') {
        teacherFields.style.display = 'block';
        studentFields.style.display = 'none';
      } else if (roleSelect.value === 'student') {
        teacherFields.style.display = 'none';
        studentFields.style.display = 'block';
      } else {
        teacherFields.style.display = 'none';
        studentFields.style.display = 'none';
      }
    };
    roleSelect.addEventListener('change', toggleFields);
    // Trigger on page load
    toggleFields();
  }
});
