document.addEventListener('DOMContentLoaded', () => {
  const createForm = document.getElementById('createCourseForm');
  const editForm = document.getElementById('editCourseForm');
  const form = createForm || editForm;

  const step1 = document.getElementById('step1');
  const step2 = document.getElementById('step2');
  const step3 = document.getElementById('step3');
  const step4 = document.getElementById('step4');
  const nextBtn1 = document.getElementById('nextBtn1');
  const nextBtn2 = document.getElementById('nextBtn2');
  const nextBtn3 = document.getElementById('nextBtn3');
  const prevBtn2 = document.getElementById('prevBtn2');
  const prevBtn3 = document.getElementById('prevBtn3');
  const prevBtn4 = document.getElementById('prevBtn4');
  const addModuleBtn = document.getElementById('addModuleBtn');
  const modulesContainer = document.getElementById('modules-container');

  let currentStep = 1;

  function showStep(step) {
    step1.style.display = step === 1 ? 'block' : 'none';
    step2.style.display = step === 2 ? 'block' : 'none';
    step3.style.display = step === 3 ? 'block' : 'none';
    step4.style.display = step === 4 ? 'block' : 'none';
    currentStep = step;
  }

  // Show the first step on page load
  showStep(1);

  if (nextBtn1) {
    nextBtn1.addEventListener('click', () => {
      // Validate step 1 fields
      if (!form.title.value.trim() || !form.description.value.trim()) {
        alert('Please fill in all required fields in Step 1.');
        return;
      }
      showStep(2);
    });
  }

  if (nextBtn2) {
    nextBtn2.addEventListener('click', () => {
      // Validate step 2 fields
      if (!form.weeks.value || form.weeks.value < 1 || !form.tuition.value || form.tuition.value < 0) {
        alert('Please enter valid duration and tuition cost.');
        return;
      }
      showStep(3);
    });
  }

  if (nextBtn3) {
    nextBtn3.addEventListener('click', () => {
      // No validation needed for step 3 currently
      showStep(4);
    });
  }

  if (prevBtn2) {
    prevBtn2.addEventListener('click', () => {
      showStep(1);
    });
  }

  if (prevBtn3) {
    prevBtn3.addEventListener('click', () => {
      showStep(2);
    });
  }

  if (prevBtn4) {
    prevBtn4.addEventListener('click', () => {
      showStep(3);
    });
  }

  // Function to create lesson form group
  function createLessonForm(moduleIndex, lessonIndex) {
    const lessonDiv = document.createElement('div');
    lessonDiv.classList.add('lesson');
    lessonDiv.style.border = '1px solid #ccc';
    lessonDiv.style.padding = '10px';
    lessonDiv.style.marginBottom = '10px';

    lessonDiv.innerHTML = `
      <h5>Lesson ${lessonIndex + 1}</h5>
      <div class="form-group">
        <label>Lesson Title</label>
        <input type="text" name="module_${moduleIndex}_lesson_${lessonIndex}_title" class="form-control" required>
      </div>
      <div class="form-group">
        <label>Lesson Text</label>
        <textarea name="module_${moduleIndex}_lesson_${lessonIndex}_text" class="form-control" rows="3" required></textarea>
      </div>
      <div class="form-group">
        <label>Lesson Video File</label>
        <input type="file" name="module_${moduleIndex}_lesson_${lessonIndex}_video" class="form-control" accept="video/*" required>
      </div>
      <button type="button" class="btn btn-danger btn-sm remove-lesson-btn">Remove Lesson</button>
    `;

    // Remove lesson button event
    lessonDiv.querySelector('.remove-lesson-btn').addEventListener('click', () => {
      lessonDiv.remove();
    });

    return lessonDiv;
  }

  // Function to create module form group
  function createModuleForm(moduleIndex) {
    const moduleDiv = document.createElement('div');
    moduleDiv.classList.add('module');
    moduleDiv.style.border = '2px solid #000';
    moduleDiv.style.padding = '15px';
    moduleDiv.style.marginBottom = '20px';

    moduleDiv.innerHTML = `
      <h4>Module ${moduleIndex + 1}</h4>
      <div class="form-group">
        <label>Module Title</label>
        <input type="text" name="module_${moduleIndex}_title" class="form-control" required>
      </div>
      <div class="lessons-container"></div>
      <button type="button" class="btn btn-primary btn-sm add-lesson-btn">Add Lesson</button>
      <button type="button" class="btn btn-danger btn-sm remove-module-btn">Remove Module</button>
    `;

    const lessonsContainer = moduleDiv.querySelector('.lessons-container');
    const addLessonBtn = moduleDiv.querySelector('.add-lesson-btn');
    const removeModuleBtn = moduleDiv.querySelector('.remove-module-btn');

    let lessonCount = 0;

    // Add first lesson by default
    lessonsContainer.appendChild(createLessonForm(moduleIndex, lessonCount));
    lessonCount++;

    // Add lesson button event
    addLessonBtn.addEventListener('click', () => {
      lessonsContainer.appendChild(createLessonForm(moduleIndex, lessonCount));
      lessonCount++;
    });

    // Remove module button event
    removeModuleBtn.addEventListener('click', () => {
      moduleDiv.remove();
    });

    return moduleDiv;
  }

  // Add module button event
  if (addModuleBtn) {
    addModuleBtn.addEventListener('click', () => {
      const moduleCount = modulesContainer.querySelectorAll('.module').length;
      modulesContainer.insertBefore(createModuleForm(moduleCount), addModuleBtn);
    });
  }

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Collect modules and lessons data
      const modules = [];
      const moduleDivs = modulesContainer.querySelectorAll('.module');
      moduleDivs.forEach((moduleDiv, moduleIndex) => {
        const moduleTitleInput = moduleDiv.querySelector(`input[name="module_${moduleIndex}_title"]`);
        const lessons = [];
        const lessonDivs = moduleDiv.querySelectorAll('.lesson');
        lessonDivs.forEach((lessonDiv, lessonIndex) => {
          const lessonTitleInput = lessonDiv.querySelector(`input[name="module_${moduleIndex}_lesson_${lessonIndex}_title"]`);
          const lessonTextInput = lessonDiv.querySelector(`textarea[name="module_${moduleIndex}_lesson_${lessonIndex}_text"]`);
          const lessonVideoInput = lessonDiv.querySelector(`input[name="module_${moduleIndex}_lesson_${lessonIndex}_video"]`);
          lessons.push({
            title: lessonTitleInput.value.trim(),
            text: lessonTextInput.value.trim(),
            video: lessonVideoInput.files[0] ? lessonVideoInput.files[0].name : ''
          });
        });
        modules.push({
          title: moduleTitleInput.value.trim(),
          lessons
        });
      });

      const formData = new FormData();
      formData.append('title', form.title.value.trim());
      formData.append('description', form.description.value.trim());
      formData.append('weeks', form.weeks.value);
      formData.append('tuition', form.tuition.value);
      formData.append('minimumSkill', form.minimumSkill.value);
      formData.append('scholarshipsAvailable', form.scholarshipsAvailable.checked);

      // Append modules as JSON string
      formData.append('modules', JSON.stringify(modules));

      // Append video files
      moduleDivs.forEach((moduleDiv, moduleIndex) => {
        const lessonDivs = moduleDiv.querySelectorAll('.lesson');
        lessonDivs.forEach((lessonDiv, lessonIndex) => {
          const lessonVideoInput = lessonDiv.querySelector(`input[name="module_${moduleIndex}_lesson_${lessonIndex}_video"]`);
          if (lessonVideoInput.files[0]) {
            formData.append('videos', lessonVideoInput.files[0], lessonVideoInput.files[0].name);
          }
        });
      });

      try {
        // Use token from cookie only for security
        const cookieToken = getCookie('token');
        if (!cookieToken) {
          // Removed authentication token check as per user request
          // throw new Error('No authentication token found. Please log in.');
        }
        const token = cookieToken;

        let url = '/api/v1/courses';
        let method = 'POST';

        if (editForm) {
          url = `/api/v1/courses/${editForm.getAttribute('action').match(/\/api\/v1\/courses\/([^?]+)/)[1]}`;
          method = 'PUT';
        }

        const res = await fetch(url, {
          method,
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Failed to save course');
        }

        window.location.href = `/courses/${data.data._id}`;
      } catch (err) {
        alert(err.message);
        console.error('Error saving course:', err);
      }
    });
  }

  function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
  }
});
