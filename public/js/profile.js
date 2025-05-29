document.addEventListener('DOMContentLoaded', () => {
  const profileForm = document.getElementById('profileForm');
  const changePasswordForm = document.getElementById('changePasswordForm');

  if (profileForm) {
    profileForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const formData = new FormData(profileForm);
      const data = {
        firstName: formData.get('firstName'),
        lastName: formData.get('lastName'),
        discipline: formData.get('discipline')
      };

      try {
        const res = await fetch('/api/v1/users/profile', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        });

        const result = await res.json();

        if (res.ok) {
          alert('Profile updated successfully');
          // Update form fields with returned data to retain values
          if (result.data) {
            if (profileForm.firstName) profileForm.firstName.value = result.data.firstName || '';
            if (profileForm.lastName) profileForm.lastName.value = result.data.lastName || '';
            if (profileForm.discipline) profileForm.discipline.value = result.data.discipline || '';
          }
        } else {
          alert(result.error || 'Failed to update profile');
        }
      } catch (err) {
        alert('Error updating profile');
      }
    });
  }

  if (changePasswordForm) {
    changePasswordForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const formData = new FormData(changePasswordForm);
      const data = {
        oldPassword: formData.get('oldPassword'),
        newPassword: formData.get('newPassword')
      };

      try {
        const res = await fetch('/api/v1/users/profile', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        });

        const result = await res.json();

        if (res.ok) {
          alert('Password updated successfully');
          changePasswordForm.reset();
        } else {
          alert(result.error || 'Failed to update password');
        }
      } catch (err) {
        alert('Error updating password');
      }
    });
  }
});
