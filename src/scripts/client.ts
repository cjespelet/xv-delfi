import { initDiscoBalls } from './disco-balls';
import { initPlaylist } from './playlist';

type GuestDiet = { name: string; diet: string[]; note: string };

function dietOptions(box: HTMLElement): string[] {
  return (box.dataset.options ?? 'Ninguna').split('|').map((item) => item.trim()).filter(Boolean);
}

function formatAlimentacion(name: string, guests: GuestDiet[]): string {
  return guests
    .map((guest, index) => {
      const who = index === 0 ? name : guest.name.trim();
      const extras = guest.diet.filter((item) => item !== 'Ninguna');
      const diet = extras.length ? extras.join(', ') : 'Ninguna';
      const note = extras.length && guest.note.trim() ? `. Detalle: ${guest.note.trim()}` : '';
      return `Persona ${index + 1} (${who}): ${diet}${note}`;
    })
    .join('\n');
}

function digitsPhone(raw: string): string {
  return raw.replace(/\D/g, '');
}

function rsvpWhatsAppText(
  honoree: string,
  name: string,
  attending: boolean,
  count: string,
  guests: GuestDiet[],
  phrase: string,
): string {
  const lines = [
    `RSVP XV ${honoree}`,
    '',
    `Nombre: ${name}`,
    `Viene: ${attending ? 'Sí, va' : 'No puede ir'}`,
  ];
  if (attending) {
    lines.push(`Cuántos: ${count}`);
    lines.push('Alimentación:');
    lines.push(formatAlimentacion(name, guests));
  }
  if (phrase) lines.push(`Frase: ${phrase}`);
  return lines.join('\n');
}

function submitRsvp(
  form: HTMLFormElement,
  thanks: HTMLElement,
  error: HTMLElement | null,
  sendError: string,
  guests: GuestDiet[],
): void {
  const data = new FormData(form);
  const name = String(data.get('name') ?? '').trim();
  const coming = String(data.get('coming') ?? '');
  if (!name || !coming) {
    if (error) {
      error.textContent = error.dataset.required ?? error.textContent;
      error.classList.remove('hidden');
    }
    return;
  }

  const box = document.getElementById('rsvp-guests');
  if (coming === 'si' && box) {
    const missing = guests.findIndex((guest, index) => index > 0 && !guest.name.trim());
    if (missing > -1) {
      if (error) {
        error.textContent = `${box.dataset.missingName ?? 'Falta el nombre de la persona'} ${missing + 1}.`;
        error.classList.remove('hidden');
      }
      document.getElementById(`g${missing + 1}-name`)?.focus();
      return;
    }
  }

  const phone = digitsPhone(form.dataset.whatsapp ?? '');
  if (!phone) {
    if (error) {
      error.textContent = sendError;
      error.classList.remove('hidden');
    }
    return;
  }
  error?.classList.add('hidden');

  const attending = coming === 'si';
  const party = attending ? guests : [];
  const count = attending ? String(party.length || data.get('count') || '1') : '0';
  const phrase = String(data.get('phrase') ?? '').trim();
  const honoree = form.dataset.honoree?.trim() || 'Delfi';
  const url = `https://wa.me/${phone}?text=${encodeURIComponent(
    rsvpWhatsAppText(honoree, name, attending, count, party, phrase),
  )}`;

  const opened = window.open(url, '_blank', 'noopener');
  if (!opened) window.location.assign(url);

  form.classList.add('hidden');
  thanks.classList.remove('hidden');
}

function initReveal(): void {
  const els = document.querySelectorAll('.reveal');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) {
    els.forEach((el) => el.classList.add('is-visible'));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 },
  );
  els.forEach((el) => io.observe(el));
}

function initCountdown(): void {
  const root = document.getElementById('countdown-timer');
  if (!root) return;
  const iso = root.getAttribute('data-event-date');
  if (!iso) return;
  const target = new Date(iso).getTime();

  const set = (id: string, value: number) => {
    const node = document.getElementById(`cd-${id}`);
    if (node) node.textContent = String(Math.max(0, value)).padStart(2, '0');
  };

  const tick = () => {
    const diff = target - Date.now();
    if (diff <= 0) {
      set('days', 0);
      set('hours', 0);
      set('minutes', 0);
      set('seconds', 0);
      return;
    }
    set('days', Math.floor(diff / 86400000));
    set('hours', Math.floor((diff % 86400000) / 3600000));
    set('minutes', Math.floor((diff % 3600000) / 60000));
    set('seconds', Math.floor((diff % 60000) / 1000));
  };

  tick();
  window.setInterval(tick, 1000);
}

function initCopyAlias(): void {
  const btn = document.getElementById('copy-alias');
  if (!btn) return;
  const alias = btn.getAttribute('data-alias');
  const copied = btn.getAttribute('data-copied') ?? '¡Copiado!';
  const original = btn.textContent;
  btn.addEventListener('click', async () => {
    if (!alias) return;
    try {
      await navigator.clipboard.writeText(alias);
    } catch {
      /* clipboard can fail in some browsers; still show feedback */
    }
    btn.textContent = copied;
    window.setTimeout(() => {
      btn.textContent = original;
    }, 2000);
  });
}

function initRsvp(): void {
  const form = document.getElementById('rsvp-form');
  const thanks = document.getElementById('rsvp-thanks');
  const error = document.getElementById('rsvp-error');
  const yesBox = document.getElementById('rsvp-yes');
  const guestsBox = document.getElementById('rsvp-guests');
  const countSelect = document.getElementById('rsvp-count');
  if (!(form instanceof HTMLFormElement) || !thanks) return;
  const sendError = form.dataset.sendError ?? 'No se pudo enviar.';

  let guests: GuestDiet[] = [{ name: '', diet: ['Ninguna'], note: '' }];

  const renderGuests = () => {
    if (!guestsBox) return;
    const options = dietOptions(guestsBox);
    const person = guestsBox.dataset.person ?? 'Persona';
    guestsBox.replaceChildren();

    guests.forEach((guest, index) => {
      const n = index + 1;
      const wrap = document.createElement('div');
      wrap.className = 'rsvp-guest';

      const title = document.createElement('p');
      title.className = 'rsvp-guest-title';
      title.textContent = `${person} ${n}`;
      if (index === 0) {
        const tag = document.createElement('span');
        tag.textContent = guestsBox.dataset.you ?? ' · vos';
        title.appendChild(tag);
      }
      wrap.appendChild(title);

      if (index > 0) {
        const nameLabel = document.createElement('label');
        nameLabel.className = 'block';
        const nameHint = document.createElement('span');
        nameHint.className = 'eyebrow';
        nameHint.textContent = guestsBox.dataset.otherName ?? 'Nombre y apellido';
        const nameInput = document.createElement('input');
        nameInput.className = 'field mt-2';
        nameInput.type = 'text';
        nameInput.id = `g${n}-name`;
        nameInput.maxLength = 80;
        nameInput.placeholder = `${guestsBox.dataset.otherPlaceholder ?? 'Nombre de la persona'} ${n}`;
        nameInput.value = guest.name;
        nameInput.addEventListener('input', () => {
          guest.name = nameInput.value;
        });
        nameLabel.append(nameHint, nameInput);
        wrap.appendChild(nameLabel);
      }

      const fieldset = document.createElement('fieldset');
      const legend = document.createElement('span');
      legend.className = 'eyebrow';
      legend.id = `g${n}-lg`;
      legend.textContent =
        index === 0
          ? (guestsBox.dataset.question ?? '¿Tenés alguna restricción alimentaria?')
          : (guestsBox.dataset.questionOther ?? 'Restricción alimentaria');

      const choices = document.createElement('div');
      choices.className = 'rsvp-choices';
      choices.setAttribute('aria-labelledby', legend.id);

      const note = document.createElement('textarea');
      note.className = 'field min-h-20 resize-none';
      note.id = `g${n}-note`;
      note.maxLength = 200;
      note.placeholder = guestsBox.dataset.note ?? '';
      note.value = guest.note;
      note.hidden = !guest.diet.some((item) => item !== 'Ninguna');
      note.addEventListener('input', () => {
        guest.note = note.value;
      });

      const boxes: HTMLInputElement[] = [];
      options.forEach((option, optionIndex) => {
        const label = document.createElement('label');
        label.className = 'rsvp-choice';
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `g${n}-d${optionIndex}`;
        checkbox.value = option;
        checkbox.checked = guest.diet.includes(option);
        const text = document.createElement('span');
        text.textContent = option;
        label.append(checkbox, text);
        choices.appendChild(label);
        boxes.push(checkbox);
        checkbox.addEventListener('change', () => {
          if (option === 'Ninguna' && checkbox.checked) {
            boxes.forEach((other) => {
              if (other !== checkbox) other.checked = false;
            });
          }
          if (option !== 'Ninguna' && checkbox.checked) boxes[0].checked = false;
          if (!boxes.some((item) => item.checked)) boxes[0].checked = true;
          guest.diet = boxes.filter((item) => item.checked).map((item) => item.value);
          note.hidden = !guest.diet.some((item) => item !== 'Ninguna');
        });
      });

      fieldset.append(legend, choices, note);
      wrap.appendChild(fieldset);
      guestsBox.appendChild(wrap);
    });
  };

  const syncComing = () => {
    const attending = form.querySelector<HTMLInputElement>('input[name="coming"]:checked')?.value === 'si';
    form.querySelectorAll('input[name="coming"]').forEach((el) => {
      el.parentElement?.classList.toggle('is-on', el instanceof HTMLInputElement && el.checked);
    });
    if (yesBox) {
      yesBox.hidden = !attending;
      yesBox.classList.toggle('hidden', !attending);
    }
  };

  countSelect?.addEventListener('change', () => {
    const qty = Number(countSelect instanceof HTMLSelectElement ? countSelect.value : 1);
    const none = dietOptions(guestsBox ?? document.createElement('div'))[0] ?? 'Ninguna';
    while (guests.length < qty) guests.push({ name: '', diet: [none], note: '' });
    guests = guests.slice(0, qty);
    renderGuests();
  });

  form.querySelectorAll('input[name="coming"]').forEach((input) => {
    input.addEventListener('change', syncComing);
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    submitRsvp(form, thanks, error, sendError, guests);
  });

  renderGuests();
  syncComing();
}

initReveal();
initCountdown();
initCopyAlias();
initRsvp();
initPlaylist();
initDiscoBalls();
