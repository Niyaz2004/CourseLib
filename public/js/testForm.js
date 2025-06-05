document.addEventListener('DOMContentLoaded', () => {
  const questionsContainer = document.getElementById('questions-container');
  const addQuestionBtn = document.querySelector('.add-question');

  // Function to create a new answer input block
  function createAnswerInput(questionIndex, answerIndex) {
    const answerGroup = document.createElement('div');
    answerGroup.classList.add('answer-group', 'mb-2');

    const inputGroup = document.createElement('div');
    inputGroup.classList.add('input-group');

    const answerInput = document.createElement('input');
    answerInput.type = 'text';
    answerInput.required = true;
    answerInput.placeholder = 'Answer text';
    answerInput.classList.add('form-control', 'answer-text');
    answerInput.name = `questions[${questionIndex}][answers][${answerIndex}][text]`;

    const inputGroupAppend = document.createElement('div');
    inputGroupAppend.classList.add('input-group-append');

    const inputGroupText = document.createElement('div');
    inputGroupText.classList.add('input-group-text');

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.classList.add('answer-correct');
    checkbox.name = `questions[${questionIndex}][answers][${answerIndex}][isCorrect]`;

    const labelText = document.createTextNode(' Correct');

    inputGroupText.appendChild(checkbox);
    inputGroupText.appendChild(labelText);
    inputGroupAppend.appendChild(inputGroupText);

    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.classList.add('btn', 'btn-outline-danger', 'remove-answer');
    removeBtn.textContent = '×';
    removeBtn.addEventListener('click', () => {
      answerGroup.remove();
      updateAnswerNames(questionIndex);
    });

    inputGroup.appendChild(answerInput);
    inputGroup.appendChild(inputGroupAppend);
    inputGroup.appendChild(removeBtn);

    answerGroup.appendChild(inputGroup);

    return answerGroup;
  }

  // Function to update answer input names after removal
  function updateAnswerNames(questionIndex) {
    const questionDiv = questionsContainer.querySelectorAll('.question-card')[questionIndex];
    const answersContainer = questionDiv.querySelector('.answers-container');
    const answers = answersContainer.querySelectorAll('.answer-group');

    answers.forEach((answerDiv, idx) => {
      const input = answerDiv.querySelector('.answer-text');
      const checkbox = answerDiv.querySelector('.answer-correct');

      input.name = `questions[${questionIndex}][answers][${idx}][text]`;
      checkbox.name = `questions[${questionIndex}][answers][${idx}][isCorrect]`;
    });
  }

  // Function to create a new question block
  function createQuestion(questionIndex) {
    const questionDiv = document.createElement('div');
    questionDiv.classList.add('question-card');

    const cardBody = document.createElement('div');
    cardBody.classList.add('card-body');

    const title = document.createElement('h5');
    title.classList.add('card-title');
    title.textContent = `Question ${questionIndex + 1}`;

    const questionGroup = document.createElement('div');
    questionGroup.classList.add('form-group', 'mb-3');

    const questionLabel = document.createElement('label');
    questionLabel.textContent = 'Question Text';

    const questionInput = document.createElement('input');
    questionInput.type = 'text';
    questionInput.required = true;
    questionInput.classList.add('form-control', 'question-text');
    questionInput.name = `questions[${questionIndex}][questionText]`;

    questionGroup.appendChild(questionLabel);
    questionGroup.appendChild(questionInput);

    const answersContainer = document.createElement('div');
    answersContainer.classList.add('answers-container', 'mb-3');

    // Add initial two answers
    answersContainer.appendChild(createAnswerInput(questionIndex, 0));
    answersContainer.appendChild(createAnswerInput(questionIndex, 1));

    const addAnswerBtn = document.createElement('button');
    addAnswerBtn.type = 'button';
    addAnswerBtn.classList.add('btn', 'btn-sm', 'btn-secondary', 'add-answer');
    addAnswerBtn.textContent = 'Add Answer';
    addAnswerBtn.dataset.questionIndex = questionIndex;
    addAnswerBtn.addEventListener('click', () => {
      const currentAnswers = answersContainer.querySelectorAll('.answer-group').length;
      answersContainer.appendChild(createAnswerInput(questionIndex, currentAnswers));
    });

    const removeQuestionBtn = document.createElement('button');
    removeQuestionBtn.type = 'button';
    removeQuestionBtn.classList.add('btn', 'btn-sm', 'btn-outline-danger', 'remove-question', 'float-right');
    removeQuestionBtn.textContent = 'Remove Question';
    removeQuestionBtn.addEventListener('click', () => {
      questionDiv.remove();
      updateQuestionLabels();
    });

    questionDiv.appendChild(cardBody);
    cardBody.appendChild(title);
    cardBody.appendChild(questionGroup);
    cardBody.appendChild(answersContainer);
    cardBody.appendChild(addAnswerBtn);
    cardBody.appendChild(removeQuestionBtn);

    return questionDiv;
  }

  // Function to update question labels and input names after removal
  function updateQuestionLabels() {
    const questions = questionsContainer.querySelectorAll('.question-card');
    questions.forEach((questionDiv, idx) => {
      const label = questionDiv.querySelector('h5.card-title');
      label.textContent = `Question ${idx + 1}`;

      const questionInput = questionDiv.querySelector('.question-text');
      questionInput.name = `questions[${idx}][questionText]`;

      const answersContainer = questionDiv.querySelector('.answers-container');
      answersContainer.id = `answers-container-${idx}`;

      const answers = answersContainer.querySelectorAll('.answer-group');
      answers.forEach((answerDiv, aIdx) => {
        const input = answerDiv.querySelector('.answer-text');
        const checkbox = answerDiv.querySelector('.answer-correct');

        input.name = `questions[${idx}][answers][${aIdx}][text]`;
        checkbox.name = `questions[${idx}][answers][${aIdx}][isCorrect]`;
      });

      const addAnswerBtn = questionDiv.querySelector('.add-answer');
      addAnswerBtn.dataset.questionIndex = idx;
    });
  }

  // Add event listener for adding new questions
  addQuestionBtn.addEventListener('click', () => {
    const currentQuestions = questionsContainer.querySelectorAll('.question-card').length;
    questionsContainer.appendChild(createQuestion(currentQuestions));
  });

  // Add event listeners for existing add-answer buttons
  const existingAddAnswerBtns = document.querySelectorAll('.add-answer');
  existingAddAnswerBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const questionIndex = parseInt(e.target.dataset.questionIndex, 10);
      const answersContainer = e.target.parentElement.querySelector('.answers-container');
      const currentAnswers = answersContainer.querySelectorAll('.answer-group').length;
      answersContainer.appendChild(createAnswerInput(questionIndex, currentAnswers));
    });
  });

  // Add event listeners for existing remove-answer buttons
  const existingRemoveAnswerBtns = document.querySelectorAll('.remove-answer');
  existingRemoveAnswerBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const answerDiv = e.target.closest('.answer-group');
      if (!answerDiv) return;
      const questionDiv = e.target.closest('.question-card');
      if (!questionDiv) return;
      const questionIndex = Array.from(questionsContainer.children).indexOf(questionDiv);
      if (questionIndex === -1) return;
      answerDiv.remove();
      updateAnswerNames(questionIndex);
    });
  });

  // Add event listeners for existing remove-question buttons
  const existingRemoveQuestionBtns = document.querySelectorAll('.remove-question');
  existingRemoveQuestionBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const questionDiv = e.target.closest('.question-card');
      questionDiv.remove();
      updateQuestionLabels();
    });
  });
});
