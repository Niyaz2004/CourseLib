document.addEventListener('DOMContentLoaded', () => {
  console.log('testDelete.js loaded');
  const deleteButtons = document.querySelectorAll('.delete-test-button');
  console.log(`Found ${deleteButtons.length} delete buttons`);
  deleteButtons.forEach(button => {
    console.log('Attaching click listener to delete button');
    button.addEventListener('click', async () => {
      console.log('Delete button clicked');
      if (!confirm('Are you sure you want to delete this test?')) return;
      const courseId = button.getAttribute('data-course-id');
      const testId = button.getAttribute('data-test-id');
      const url = `/courses/${courseId}/tests/${testId}`;
      try {
        const response = await fetch(url, { method: 'DELETE' });
        const result = await response.json();
        if (result.success) {
          alert('Test deleted successfully');
          window.location.reload();
        } else {
          alert('Error deleting test: ' + (result.error || 'Unknown error'));
        }
      } catch (err) {
        alert('Error deleting test: ' + err.message);
      }
    });
  });
});
