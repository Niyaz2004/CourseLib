document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('testForm');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    console.log('Submitting test creation form via JS');

    const formData = new FormData(form);

    // Serialize form data into JSON structure
    const data = {
      title: formData.get('title'),
      description: formData.get('description'),
      passingScore: formData.get('passingScore'),
      questions: []
    };

    // Get all question divs
    const questionDivs = document.querySelectorAll('#questions-container .question-card');

    questionDivs.forEach((questionDiv, qIndex) => {
      const questionTextInput = questionDiv.querySelector(`input[name="questions[${qIndex}][questionText]"]`);
      const questionText = questionTextInput ? questionTextInput.value.trim() : '';

      const answers = [];
      const answerDivs = questionDiv.querySelectorAll('.answers-container .answer-group');

      answerDivs.forEach((answerDiv, aIndex) => {
        const answerTextInput = answerDiv.querySelector(`input[name="questions[${qIndex}][answers][${aIndex}][text]"]`);
        const answerText = answerTextInput ? answerTextInput.value.trim() : '';

        const isCorrectCheckbox = answerDiv.querySelector(`input[name="questions[${qIndex}][answers][${aIndex}][isCorrect]"]`);
        const isCorrect = isCorrectCheckbox ? isCorrectCheckbox.checked : false;

        if (answerText) {
          answers.push({
            text: answerText,
            isCorrect: isCorrect
          });
        }
      });

      if (questionText && answers.length > 0) {
        data.questions.push({
          questionText: questionText,
          answers: answers
        });
      }
    });

    // Validate minimum requirements
    if (!data.title) {
      alert('Please provide a test title.');
      return;
    }
    if (data.questions.length === 0) {
      alert('Please add at least one question with answers.');
      return;
    }

    try {
      const response = await fetch(form.action, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (result.success) {
        alert('Test created successfully!');
        if (result.redirectUrl) {
          window.location.href = result.redirectUrl;
        } else {
          window.location.href = '/';
        }
      } else {
        alert('Error: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      alert('Error submitting form: ' + error.message);
    }
  });
});
