(() => {
  const dlg = document.getElementById('contactDialog');
  const openBtn = document.getElementById('openDialog');
  const closeBtn = document.getElementById('closeDialog');
  const form = document.getElementById('contactForm');
  const phone = document.getElementById('phone');

  let lastActive = null;
  let isDialogNative = typeof HTMLDialogElement === 'function' && typeof dlg.showModal === 'function';

  function showError(field, message) {
    field.setAttribute('aria-invalid', 'true');
    const err = document.getElementById(`${field.name}-error`);
    if (err) {
      err.hidden = false;
      err.textContent = message;
    }
  }

  function clearError(field) {
    field.removeAttribute('aria-invalid');
    const err = document.getElementById(`${field.name}-error`);
    if (err) {
      err.hidden = true;
      err.textContent = '';
    }
  }

  function openDialog() {
    if (!dlg) return;
    lastActive = document.activeElement;

    if (isDialogNative) {
      try {
        dlg.showModal();
      } catch (err) {
        dlg.setAttribute('open', '');
      }
    } else {
      dlg.setAttribute('open', '');
      dlg.classList.add('js-fallback-open');
      dlg.setAttribute('role', 'dialog');
    }

    const firstInput = dlg.querySelector('input, select, textarea, button');
    firstInput?.focus();
  }

  function closeDialog(result = 'cancel') {
    if (!dlg) return;
    if (isDialogNative && typeof dlg.close === 'function') {
      try {
        dlg.returnValue = result;
        dlg.close(result);
      } catch (err) {
        dlg.removeAttribute('open');
      }
    } else {
      dlg.classList.remove('js-fallback-open');
      dlg.removeAttribute('open');
    }
    lastActive?.focus?.();
  }

  function validateForm() {
    if (!form) return false;
    const fields = Array.from(form.querySelectorAll('input, select, textarea'));
    let valid = true;

    fields.forEach(field => {
      clearError(field);
      if (!field.checkValidity()) {
        valid = false;
        if (field.validity.valueMissing) {
          showError(field, 'Это поле обязательно');
        } else if (field.validity.typeMismatch && field.type === 'email') {
          showError(field, 'Введите корректный email');
        } else if (field.validity.patternMismatch) {
          showError(field, 'Неверный формат');
        } else {
          showError(field, 'Неверное значение');
        }
      }
    });

    if (!valid) {
      const firstInvalid = fields.find(f => !f.checkValidity());
      firstInvalid?.focus();
    }

    return valid;
  }

  function formatPhone(value) {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    const normalized = digits.replace(/^8/, '7');
    const parts = [];

    if (normalized.length === 0) return '';

    parts.push('+7');

    if (normalized.length >= 2) {
      const m = normalized.slice(1, 4);
      parts.push(' (' + m + ')');
    } else {
      if (normalized.length > 1) parts.push(' (' + normalized.slice(1) );
    }

    if (normalized.length >= 5) {
      parts.push(' ' + normalized.slice(4, 7));
    } else if (normalized.length > 4) {
      parts.push(' ' + normalized.slice(4));
    }

    if (normalized.length >= 8) {
      parts.push('-' + normalized.slice(7, 9));
    } else if (normalized.length > 7) {
      parts.push('-' + normalized.slice(7));
    }

    if (normalized.length >= 10) {
      parts.push('-' + normalized.slice(9, 11));
    } else if (normalized.length > 9) {
      parts.push('-' + normalized.slice(9));
    }

    return parts.join('');
  }

  function trapFocus(e) {
    if (!dlg || !dlg.hasAttribute('open')) return;
    const focusable = dlg.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])');
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.key === 'Tab') {
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      closeDialog('cancel');
    }
  }

  if (openBtn) {
    openBtn.addEventListener('click', (ev) => {
      ev.preventDefault();
      openDialog();
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', (ev) => {
      ev.preventDefault();
      closeDialog('cancel');
    });
  }

  if (dlg) {
    dlg.addEventListener('click', (e) => {
      if (isDialogNative && e.target === dlg) {
        closeDialog('cancel');
      }
    });
  }

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const fields = Array.from(form.querySelectorAll('input, select, textarea'));
      fields.forEach(clearError);

      if (!validateForm()) return;

      try {
        if (isDialogNative) dlg.returnValue = 'success';
      } catch (err) { }

      alert('Форма успешно отправлена!');
      closeDialog('success');
      form.reset();
    });
  }

  if (phone) {
    phone.addEventListener('input', (e) => {
      const cur = phone.selectionStart;
      const old = phone.value;
      const formatted = formatPhone(old);
      phone.value = formatted;
      phone.setSelectionRange(phone.value.length, phone.value.length);
    });

    phone.addEventListener('blur', () => {
    });
  }

  document.addEventListener('keydown', (e) => {
    if (!dlg || !dlg.hasAttribute('open')) return;
    trapFocus(e);
  });

  const main = document.querySelector('main');
  const setInert = (val) => {
    if (!main) return;
    if (val) {
      main.setAttribute('aria-hidden', 'true');
    } else {
      main.removeAttribute('aria-hidden');
    }
  };

  const observer = new MutationObserver(() => {
    setInert(dlg && dlg.hasAttribute('open'));
  });
  if (dlg) {
    observer.observe(dlg, { attributes: true, attributeFilter: ['open'] });
  }
})();
