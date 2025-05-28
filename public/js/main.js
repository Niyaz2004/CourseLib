// DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  initCourseActions();
});

// Initialize Course Actions
function initCourseActions() {
  document.querySelectorAll('.delete-course').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      if (!confirm('Are you sure you want to delete this course?')) return;

      const courseId = e.target.dataset.courseId;
      try {
        const res = await fetch(`/api/v1/courses/${courseId}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'same-origin'
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || 'Failed to delete course');
        }

        showAlert('success', 'Course deleted successfully');
        setTimeout(() => window.location.reload(), 1000);
      } catch (err) {
        showAlert('error', err.message || 'Failed to delete course');
      }
    });
  });
}

// Improved Alert Function
function showAlert(type, message) {
  // Remove previous alerts
  document.querySelectorAll('.alert').forEach(alert => alert.remove());

  const alertDiv = document.createElement('div');
  alertDiv.className = `alert alert-${type}`;
  alertDiv.textContent = message;

  const container = document.querySelector('.container') || document.body;
  container.prepend(alertDiv);

  setTimeout(() => alertDiv.remove(), 5000);
}

