document.addEventListener('DOMContentLoaded', () => {
  const createForm = document.getElementById('createCourseForm');
  const editForm = document.getElementById('editCourseForm');
  const form = createForm || editForm;
  const isEditForm = !!editForm;

  // Получаем элементы DOM
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

  // Получаем данные курса
  const courseData = window.courseData || {};
  const courseModules = courseData.modules || [];

  let currentStep = 1;

  // Функции для управления шагами формы
  function showStep(step) {
    step1.style.display = step === 1 ? 'block' : 'none';
    step2.style.display = step === 2 ? 'block' : 'none';
    step3.style.display = step === 3 ? 'block' : 'none';
    step4.style.display = step === 4 ? 'block' : 'none';
    currentStep = step;
  }

  // Инициализация шагов
  showStep(1);

  // Обработчики кнопок навигации
  if (nextBtn1) nextBtn1.addEventListener('click', () => {
    if (!form.title.value.trim() || !form.description.value.trim()) {
      alert('Please fill in all required fields in Step 1.');
      return;
    }
    showStep(2);
  });

  if (nextBtn2) nextBtn2.addEventListener('click', () => {
    if (!form.weeks.value || form.weeks.value < 1 || !form.tuition.value || form.tuition.value < 0) {
      alert('Please enter valid duration and tuition cost.');
      return;
    }
    showStep(3);
  });

  if (nextBtn3) nextBtn3.addEventListener('click', () => showStep(4));
  if (prevBtn2) prevBtn2.addEventListener('click', () => showStep(1));
  if (prevBtn3) prevBtn3.addEventListener('click', () => showStep(2));
  if (prevBtn4) prevBtn4.addEventListener('click', () => showStep(3));

  // Функция создания формы урока
  function createLessonForm(moduleIndex, lessonIndex, lessonData = {}) {
    const lessonDiv = document.createElement('div');
    lessonDiv.classList.add('lesson');
    lessonDiv.dataset.lessonIndex = lessonIndex;
    lessonDiv.style.border = '1px solid #ccc';
    lessonDiv.style.padding = '10px';
    lessonDiv.style.marginBottom = '10px';

    const videoField = lessonData.videoFile ? `
      <div class="existing-video">
        <p>Current video: ${lessonData.videoFile.filename}</p>
        <input type="hidden" name="module_${moduleIndex}_lesson_${lessonIndex}_existingVideo" value="${lessonData.video}">
      </div>
      <div class="form-group">
        <label>Replace Video File</label>
        <input type="file" name="module_${moduleIndex}_lesson_${lessonIndex}_video" class="form-control" accept="video/*">
      </div>
    ` : `
      <div class="form-group">
        <label>Lesson Video File</label>
        <input type="file" name="module_${moduleIndex}_lesson_${lessonIndex}_video" class="form-control" accept="video/*" ${isEditForm ? '' : 'required'}>
      </div>
    `;

    lessonDiv.innerHTML = `
      <h5>Lesson ${lessonIndex + 1}</h5>
      <div class="form-group">
        <label>Lesson Title</label>
        <input type="text" name="module_${moduleIndex}_lesson_${lessonIndex}_title" class="form-control" required value="${lessonData.title || ''}">
      </div>
      <div class="form-group">
        <label>Lesson Text</label>
        <textarea name="module_${moduleIndex}_lesson_${lessonIndex}_text" class="form-control" rows="3" required>${lessonData.text || ''}</textarea>
      </div>
      ${videoField}
      <button type="button" class="btn btn-danger btn-sm remove-lesson-btn">Remove Lesson</button>
    `;

    return lessonDiv;
  }

  // Функция создания формы модуля
  function createModuleForm(moduleIndex, moduleData = {}) {
    const moduleDiv = document.createElement('div');
    moduleDiv.classList.add('module');
    moduleDiv.dataset.moduleIndex = moduleIndex;
    moduleDiv.style.border = '2px solid #000';
    moduleDiv.style.padding = '15px';
    moduleDiv.style.marginBottom = '20px';

    moduleDiv.innerHTML = `
      <h4>Module ${moduleIndex + 1}</h4>
      <div class="form-group">
        <label>Module Title</label>
        <input type="text" name="module_${moduleIndex}_title" class="form-control" required value="${moduleData.title || ''}">
      </div>
      <div class="lessons-container"></div>
      <button type="button" class="btn btn-primary btn-sm add-lesson-btn">Add Lesson</button>
      <button type="button" class="btn btn-danger btn-sm remove-module-btn">Remove Module</button>
    `;

    const lessonsContainer = moduleDiv.querySelector('.lessons-container');
    
    // Добавляем существующие уроки
    if (moduleData.lessons && moduleData.lessons.length > 0) {
      moduleData.lessons.forEach((lesson, lessonIndex) => {
        lessonsContainer.appendChild(createLessonForm(moduleIndex, lessonIndex, lesson));
      });
    }

    return moduleDiv;
  }

  // Делегирование событий для кнопок
  document.addEventListener('click', (e) => {
    // Добавление урока
    if (e.target && e.target.classList.contains('add-lesson-btn')) {
      const moduleDiv = e.target.closest('.module');
      const moduleIndex = moduleDiv.dataset.moduleIndex;
      const lessonsContainer = moduleDiv.querySelector('.lessons-container');
      const lessonIndex = lessonsContainer.querySelectorAll('.lesson').length;
      
      lessonsContainer.appendChild(createLessonForm(moduleIndex, lessonIndex));
    }

    // Удаление урока
    if (e.target && e.target.classList.contains('remove-lesson-btn')) {
      e.target.closest('.lesson').remove();
    }

    // Удаление модуля
    if (e.target && e.target.classList.contains('remove-module-btn')) {
      const moduleToRemove = e.target.closest('.module');
      moduleToRemove.remove();

      // После удаления пересчитать индексы модулей и обновить отображение
      const modules = modulesContainer.querySelectorAll('.module');
      modules.forEach((moduleDiv, newIndex) => {
        moduleDiv.dataset.moduleIndex = newIndex;
        // Обновить заголовок модуля
        const header = moduleDiv.querySelector('h4');
        if (header) {
          header.textContent = `Module ${newIndex + 1}`;
        }
        // Обновить имя input для заголовка модуля
        const moduleTitleInput = moduleDiv.querySelector('input[name^="module_"][name$="_title"]');
        if (moduleTitleInput) {
          moduleTitleInput.name = `module_${newIndex}_title`;
        }
        // Обновить уроки внутри модуля
        const lessons = moduleDiv.querySelectorAll('.lesson');
        lessons.forEach((lessonDiv, lessonIndex) => {
          lessonDiv.dataset.lessonIndex = lessonIndex;
          // Обновить заголовок урока
          const lessonHeader = lessonDiv.querySelector('h5');
          if (lessonHeader) {
            lessonHeader.textContent = `Lesson ${lessonIndex + 1}`;
          }
          // Обновить имена input и textarea для урока
          const lessonTitleInput = lessonDiv.querySelector(`input[name^="module_"][name$="_title"]`);
          if (lessonTitleInput) {
            lessonTitleInput.name = `module_${newIndex}_lesson_${lessonIndex}_title`;
          }
          const lessonTextInput = lessonDiv.querySelector(`textarea[name^="module_"][name$="_text"]`);
          if (lessonTextInput) {
            lessonTextInput.name = `module_${newIndex}_lesson_${lessonIndex}_text`;
          }
          const lessonVideoInput = lessonDiv.querySelector(`input[type="file"][name^="module_"][name$="_video"]`);
          if (lessonVideoInput) {
            lessonVideoInput.name = `module_${newIndex}_lesson_${lessonIndex}_video`;
          }
          const existingVideoInput = lessonDiv.querySelector(`input[type="hidden"][name^="module_"][name$="_existingVideo"]`);
          if (existingVideoInput) {
            existingVideoInput.name = `module_${newIndex}_lesson_${lessonIndex}_existingVideo`;
          }
        });
      });
    }
  });

  // Обработчик кнопки добавления модуля
  if (addModuleBtn) {
    addModuleBtn.addEventListener('click', () => {
      const moduleCount = modulesContainer.querySelectorAll('.module').length;
      modulesContainer.insertBefore(createModuleForm(moduleCount), addModuleBtn);
    });
  }

  // Обработчик отправки формы
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

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
          const existingVideoInput = lessonDiv.querySelector(`input[name="module_${moduleIndex}_lesson_${lessonIndex}_existingVideo"]`);
          
          const lessonObj = {
            title: lessonTitleInput.value.trim(),
            text: lessonTextInput.value.trim()
          };

          if (existingVideoInput) {
            lessonObj.video = existingVideoInput.value;
          } else if (lessonVideoInput.files[0]) {
            lessonObj.video = lessonVideoInput.files[0].name;
          }

          lessons.push(lessonObj);
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
      formData.append('modules', JSON.stringify(modules));

      // Добавляем видеофайлы
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
        const cookieToken = document.cookie.replace(/(?:(?:^|.*;\s*)token\s*=\s*([^;]*).*$)|^.*$/, '$1');
        const method = isEditForm ? 'PUT' : 'POST';
        const url = isEditForm ? `/api/v1/courses/${editForm.getAttribute('action').match(/\/api\/v1\/courses\/([^?]+)/)[1]}` : '/api/v1/courses';

        const res = await fetch(url, {
          method,
          headers: {
            'Authorization': `Bearer ${cookieToken}`
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
});