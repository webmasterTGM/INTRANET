/* hlavní javascriptové funkce */
function infoBox(message, type) {
  return new Promise(resolve => {
    const dlg = document.getElementById('infoDlg');
    document.getElementById('infoMsg').textContent = message;
    document.getElementById('status-' + type + '-info').style.display = '';
    dlg.addEventListener('close', function onClose() {
      dlg.removeEventListener('close', onClose);
      resolve(dlg.returnValue === 'true');
    });

    dlg.showModal();
  });
}

function confirmBox(message) {
  return new Promise(resolve => {
    const dlg = document.getElementById('confirmDlg');
    document.getElementById('confirmMsg').textContent = message;

    dlg.addEventListener('close', function onClose() {
      dlg.removeEventListener('close', onClose);
      resolve(dlg.returnValue === 'true');
    });

    dlg.showModal();
  });
}

function showPreloader(text) {
  const el = document.getElementById('preloader');
  const t = document.getElementById('preloaderText');
  if (t) t.textContent = text || 'Načítám ...';
  if (el) {
    el.classList.remove('hidden');
    el.setAttribute('aria-hidden', 'false');
  }
}

function hidePreloader() {
  const el = document.getElementById('preloader');
  if (el) {
    el.classList.add('hidden');
    el.setAttribute('aria-hidden', 'true');
  }
}

function showElement(elementId) {
  const elm = document.getElementById(elementId);
  if(elm) {
    elm.style.display = '';
    elm.classList.remove('hidden');
  }
}

function hideElement(elementId) {
  const elm = document.getElementById(elementId);
  if(elm) {
    elm.style.display = 'none';
    elm.classList.add('hidden');
  }
}

function showDataElement(element) {
  const elements = document.querySelectorAll('[data-element="' + element + '"]');
  elements.forEach(elm => {
    elm.style.display = '';
    elm.classList.remove('hidden');
  });
}

function hideDataElement(element) {
  const elements = document.querySelectorAll('[data-element="' + element + '"]');
  elements.forEach(elm => {
    elm.style.display = 'none';
    elm.classList.add('hidden');
  });
}

function parseName(name) {
  const parts = [];
  name.replace(/([^\[\]]+)|\[(.*?)\]/g, (_, normal, bracket) => {
    parts.push(normal || bracket);
  });
  return parts;
}

function setDeep(target, path, value) {
  let current = target;

  path.forEach((key, index) => {
    const isLast = index === path.length - 1;

    if (isLast) {
      current[key] = value;
    } else {
      if (!current[key] || typeof current[key] !== 'object') {
        current[key] = {};
      }
      current = current[key];
    }
  });
}

function serializeForm(formId) {
  const form = document.getElementById(formId);
  if (!form) return {};
  const obj = {};

  form.querySelectorAll('[name]').forEach(el => {
    const name = el.name;
    const path = parseName(name);

    let value;

    if (el.type === 'checkbox') {
      value = el.checked ? (el.value || '1') : '';
    } else if (el.type === 'radio') {
      if (!el.checked) return;
      value = el.value;
    } else {
      value = el.value;
    }

    setDeep(obj, path, value);
  });

  return obj;
}

function applyDataToForm(formId, data) {
  if (!data) return;

  const form = document.getElementById(formId);

  if (!form) {
    console.warn('Formulář nebyl nalezen:', formId);
    return;
  }

  // Převod vnořených objektů na názvy typu workplace[tgm]
  const flatData = flattenDataForForm(data);

  Object.keys(flatData).forEach(k => {
    const value = flatData[k];

    const selector = `[name="${escapeAttr(k)}"]`;
    const el = form.querySelector(selector);

    if (!el) return;

    if (el.type === 'checkbox') {
      el.checked = isCheckedValue(value);
    }

    else if (el.type === 'radio') {
      const r = form.querySelector(
        `[name="${escapeAttr(k)}"][value="${escapeAttr(value)}"]`
      );

      if (r) r.checked = true;
    }

    else if (el.tagName === 'SELECT') {
      if (el.multiple) {
        const selectedValues = Array.isArray(value)
          ? value.map(String)
          : String(value ?? '').split(',').map(v => v.trim());

        Array.from(el.options).forEach(option => {
          option.selected = selectedValues.includes(option.value);
        });
      } else {
        el.value = String(value ?? '');
      }
    }

    else if (el.type === 'datetime-local') {
      el.value = toDateTimeLocalValue(value);
    }

    else if (el.type === 'date') {
      el.value = toDateValue(value);
    }

    else {
      el.value = value ?? '';
    }
  });
}

function flattenDataForForm(data, prefix = '') {
  const result = {};

  Object.keys(data).forEach(key => {
    const value = data[key];

    const fieldName = prefix
      ? `${prefix}[${key}]`
      : key;

    if (
      value &&
      typeof value === 'object' &&
      !Array.isArray(value) &&
      !(value instanceof Date)
    ) {
      Object.assign(result, flattenDataForForm(value, fieldName));
    } else {
      result[fieldName] = value;
    }
  });

  return result;
}

function toDateValue(value) {
  if (!value) return '';

  const stringValue = String(value).trim();
  // Formát: 2026-05-25
  if (/^\d{4}-\d{2}-\d{2}$/.test(stringValue)) {
    return stringValue;
  }
  // Formát s časem: 2026-05-25T20:00
  if (/^\d{4}-\d{2}-\d{2}T/.test(stringValue)) {
    return stringValue.slice(0, 10);
  }
  // Formát: 25.05.2026
  // Případně: 25.05.2026 20:00:00
  const match = stringValue.match(
    /^(\d{1,2})\.(\d{1,2})\.(\d{4})(?:\s+\d{1,2}:\d{2}(?::\d{2})?)?$/
  );
  if (!match) return '';
  const [, day, month, year] = match;

  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

function isCheckedValue(value) {
  return value === '1' || value === 1 || value === true || value === 'true';
}

function escapeAttr(value) {
  return String(value)
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"');
}

function clearForm(formId) {
  const form = document.getElementById(formId);

  if(!form)
    return;

  form.querySelectorAll('input, textarea, select').forEach(el => {
    switch (el.type) {
      case 'checkbox':
      case 'radio':
        el.checked = false;
        break;

      case 'select-one':
      case 'select-multiple':
        el.selectedIndex = -1;
        break;

      case 'button':
      case 'submit':
      case 'reset':
        break;

      default:
        el.value = '';
    }
  });
}

function closeViewDocumentPopupWindow() {
  document.getElementById('viewDocumentDialog').close();
}
/*
function openAddNewAndEditPopupWindow() {
  document.getElementById('addNewAndEditTaskForm').showModal();
}

function closeAddNewAndEditPopupWindow() {
  document.getElementById('addNewAndEditTaskForm').close();
}
*/

function openModalPopupWindow(modalWindowId) {
  document.getElementById(modalWindowId).showModal();
}

function closeModalPopupWindow(modalWindowId) {
  document.getElementById(modalWindowId).close();
}

function setElementValue(elementId, value) {
  const input = document.getElementById(elementId);

  if(!input)
    return;

  input.value = value;
}

function setElementText(elementId, value) {
  const input = document.getElementById(elementId);

  if(!input)
    return;

  input.textContent = value;
}

function esc(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
  
  //return String(s||'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
}

function linkifyText(text) {
  const escapedText = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

  const urlRegex = /(https?:\/\/[^\s]+)/g;

  return escapedText.replace(urlRegex, (url) => {
    return `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`;
  });
}
