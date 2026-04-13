import data from './data.js?v=3';
import {
  createBookingState,
  getSelectedCategory,
  getSelectedClinic,
  getSelectedDateEntry,
  getSelectedDoctor,
  getSelectedService,
  renderBookingIntroScreen,
  renderClinicScreen,
  renderConfirmationScreen,
  renderDatetimeScreen,
  renderDoctorScreen,
  renderHomeScreen,
  renderServiceScreen,
} from './bookingFlow.js?v=3';
import {
  createDirectoryState,
  getDirectoryDetailMeta,
  renderDirectoryDetailScreen,
  renderDirectoryScreen,
} from './sections.js?v=3';

const store = {
  ...data,
  appointments: [...data.appointments],
};

const state = {
  route: 'home',
  booking: createBookingState(store),
  directory: createDirectoryState(),
  toast: null,
};

const refs = {
  header: document.querySelector('[data-header-slot]'),
  main: document.querySelector('[data-screen-root]'),
  nav: document.querySelector('[data-bottom-nav-slot]'),
  overlay: document.querySelector('[data-overlay-root]'),
  search: document.querySelector('[data-search-root]'),
};

let toastTimer = null;
let searchOpen = false;
let searchQuery = '';

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function icon(name, className = 'icon-mask') {
  return `<span class="${className}" style="--icon:url('./assets/svg/${name}.svg')" aria-hidden="true"></span>`;
}

function routeGroup(route) {
  if (route === 'directory' || route === 'directory-detail') {
    return 'directory';
  }

  if (route.startsWith('booking-')) {
    return 'booking';
  }

  return 'home';
}

function resetBooking() {
  state.booking = createBookingState(store);
}

function getRouteMeta() {
  if (state.route === 'directory-detail') {
    const detailMeta = getDirectoryDetailMeta(store, state.directory.detail);

    if (detailMeta) {
      return detailMeta;
    }
  }

  const meta = {
    home: {
      title: 'Dentique Care',
      subtitle: 'Удобная запись и спокойная навигация',
    },
    'booking-intro': {
      title: 'Запись на приём',
      subtitle: 'Пошаговый маршрут записи',
    },
    'booking-service': {
      title: 'Выбор услуги',
      subtitle: 'Шаг 1 из 5',
    },
    'booking-clinic': {
      title: 'Выбор клиники',
      subtitle: 'Шаг 2 из 5',
    },
    'booking-doctor': {
      title: 'Выбор врача',
      subtitle: 'Шаг 3 из 5',
    },
    'booking-datetime': {
      title: 'Дата и время',
      subtitle: 'Шаг 4 из 5',
    },
    'booking-confirm': {
      title: 'Подтверждение записи',
      subtitle: 'Шаг 5 из 5',
    },
    directory: {
      title: 'Разделы',
      subtitle: 'Клиники, врачи и профиль',
    },
    'directory-detail': {
      title: 'Профиль',
      subtitle: 'Информационный раздел',
    },
  };

  return meta[state.route] ?? meta.home;
}

function renderHeader() {
  if (state.route === 'home') {
    return `
      <header class="topbar topbar--home">
        <div class="topbar__search-row">
          <button class="search-input-bar" type="button" data-action="open-search" aria-label="Поиск">
            ${icon('icon-search', 'icon-mask icon-mask--sm')}
            <span class="search-input-bar__placeholder">Врач или адрес</span>
          </button>
          <button class="profile-button" type="button" data-action="show-directory-tab" data-tab="profile" aria-label="Профиль">
            ${icon('icon-profile', 'icon-mask icon-mask--sm')}
            <span class="profile-button__label">Профиль</span>
          </button>
        </div>
      </header>
    `;
  }

  const meta = getRouteMeta();

  return `
    <header class="topbar topbar--compact">
      <button class="nav-button nav-button--back" type="button" data-action="go-back" aria-label="Назад">
        ${icon('icon-arrow-right', 'icon-mask icon-mask--sm icon-mask--flip')}
      </button>
      <div class="topbar__meta">
        <h1 class="topbar__title">${escapeHtml(meta.title)}</h1>
        <p class="topbar__subtitle">${escapeHtml(meta.subtitle)}</p>
      </div>
      <button class="nav-button" type="button" data-route="home" aria-label="Главная">
        ${icon('icon-home', 'icon-mask icon-mask--sm')}
      </button>
    </header>
  `;
}

function renderBottomNav() {
  const currentGroup = routeGroup(state.route);
  const items = [
    { group: 'home', route: 'home', label: 'Главная', iconName: 'icon-home' },
    { group: 'booking', route: 'booking-intro', label: 'Запись', iconName: 'icon-appointment' },
    { group: 'directory', route: 'directory', label: 'Разделы', iconName: 'icon-sections' },
  ];

  return `
    <nav class="bottom-bar" aria-label="Основная навигация">
      <div class="bottom-bar__inner">
        ${items
          .map(
            (item) => `
              <button
                class="bottom-bar__item ${currentGroup === item.group ? 'is-active' : ''}"
                type="button"
                data-route="${escapeHtml(item.route)}"
              >
                <span class="bottom-bar__icon">${icon(item.iconName, 'icon-mask icon-mask--sm')}</span>
                <span class="bottom-bar__label">${escapeHtml(item.label)}</span>
              </button>
            `
          )
          .join('')}
      </div>
    </nav>
  `;
}

function renderToast() {
  if (!state.toast) {
    return '';
  }

  return `
    <div class="notification" role="status">
      <span class="notification__icon">${icon('icon-check', 'icon-mask icon-mask--sm')}</span>
      <div>
        <h3 class="notification__title">${escapeHtml(state.toast.title)}</h3>
        <p class="notification__text">${escapeHtml(state.toast.text)}</p>
      </div>
    </div>
  `;
}

function searchData(query) {
  const q = query.toLowerCase().trim();
  if (!q) return { clinics: [], doctors: [], services: [] };

  const clinics = store.clinics.filter(
    (c) =>
      c.name.toLowerCase().includes(q) ||
      c.address.toLowerCase().includes(q) ||
      (c.highlights || []).some((h) => h.toLowerCase().includes(q))
  );

  const doctors = store.doctors.filter(
    (d) =>
      d.fullName.toLowerCase().includes(q) ||
      d.specialization.toLowerCase().includes(q) ||
      (d.skills || []).some((s) => s.toLowerCase().includes(q))
  );

  const services = [];
  for (const category of store.serviceCategories) {
    for (const service of category.services) {
      if (
        service.title.toLowerCase().includes(q) ||
        category.title.toLowerCase().includes(q)
      ) {
        services.push({ ...service, categoryTitle: category.title, categoryId: category.id });
      }
    }
  }

  return { clinics: clinics.slice(0, 5), doctors: doctors.slice(0, 5), services: services.slice(0, 6) };
}

function renderSearchOverlay() {
  if (!searchOpen) return '';

  const results = searchData(searchQuery);
  const hasQuery = searchQuery.trim().length > 0;
  const hasResults = results.clinics.length || results.doctors.length || results.services.length;

  let resultsHtml = '';

  if (hasQuery && !hasResults) {
    resultsHtml = `
      <div class="search-empty">
        <p class="search-empty__text">Ничего не найдено по запросу «${escapeHtml(searchQuery)}»</p>
      </div>
    `;
  }

  if (results.clinics.length) {
    resultsHtml += `
      <div class="search-group">
        <h3 class="search-group__title">${icon('icon-clinic', 'icon-mask icon-mask--sm')} Клиники</h3>
        ${results.clinics
          .map(
            (c) => `
              <button class="search-result" type="button" data-action="search-go-clinic" data-clinic-id="${escapeHtml(c.id)}">
                <strong class="search-result__title">${escapeHtml(c.name)}</strong>
                <span class="search-result__text">${escapeHtml(c.address)}</span>
              </button>
            `
          )
          .join('')}
      </div>
    `;
  }

  if (results.doctors.length) {
    resultsHtml += `
      <div class="search-group">
        <h3 class="search-group__title">${icon('icon-doctor', 'icon-mask icon-mask--sm')} Врачи</h3>
        ${results.doctors
          .map(
            (d) => `
              <button class="search-result" type="button" data-action="search-go-doctor" data-doctor-id="${escapeHtml(d.id)}">
                <strong class="search-result__title">${escapeHtml(d.fullName)}</strong>
                <span class="search-result__text">${escapeHtml(d.specialization)}</span>
              </button>
            `
          )
          .join('')}
      </div>
    `;
  }

  if (results.services.length) {
    resultsHtml += `
      <div class="search-group">
        <h3 class="search-group__title">${icon('icon-appointment', 'icon-mask icon-mask--sm')} Услуги</h3>
        ${results.services
          .map(
            (s) => `
              <button class="search-result" type="button" data-action="search-go-service" data-service-id="${escapeHtml(s.id)}" data-service-category="${escapeHtml(s.categoryId)}">
                <strong class="search-result__title">${escapeHtml(s.title)}</strong>
                <span class="search-result__text">${escapeHtml(s.categoryTitle)}</span>
              </button>
            `
          )
          .join('')}
      </div>
    `;
  }

  if (!hasQuery) {
    resultsHtml = `
      <div class="search-hints">
        <p class="search-hints__label">Попробуйте найти</p>
        <div class="search-hints__chips">
          <button class="chip chip--soft" type="button" data-action="search-hint" data-hint="терапевт">Терапевт</button>
          <button class="chip chip--soft" type="button" data-action="search-hint" data-hint="имплант">Имплантация</button>
          <button class="chip chip--soft" type="button" data-action="search-hint" data-hint="чистка">Чистка зубов</button>
          <button class="chip chip--soft" type="button" data-action="search-hint" data-hint="детский">Детский приём</button>
          <button class="chip chip--soft" type="button" data-action="search-hint" data-hint="Белый Лист">Белый Лист</button>
          <button class="chip chip--soft" type="button" data-action="search-hint" data-hint="ортодонт">Ортодонт</button>
        </div>
      </div>
    `;
  }

  return `
    <div class="search-overlay" data-search-overlay>
      <div class="search-overlay__header">
        <div class="search-overlay__input-wrap">
          ${icon('icon-search', 'icon-mask icon-mask--sm')}
          <input
            class="search-overlay__input"
            type="text"
            placeholder="Врач, клиника или услуга"
            value="${escapeHtml(searchQuery)}"
            data-search-input
            autofocus
          />
          ${searchQuery ? `<button class="search-overlay__clear" type="button" data-action="search-clear" aria-label="Очистить">&times;</button>` : ''}
        </div>
        <button class="search-overlay__close" type="button" data-action="close-search">Отмена</button>
      </div>
      <div class="search-overlay__body">
        ${resultsHtml}
      </div>
    </div>
  `;
}

function openSearch() {
  searchOpen = true;
  searchQuery = '';
  refs.search.innerHTML = renderSearchOverlay();
  const input = refs.search.querySelector('[data-search-input]');
  if (input) input.focus();
}

function closeSearch() {
  searchOpen = false;
  searchQuery = '';
  refs.search.innerHTML = '';
}

function updateSearch(query) {
  searchQuery = query;
  const body = refs.search.querySelector('.search-overlay__body');
  if (!body) return;

  const results = searchData(searchQuery);
  const hasQuery = searchQuery.trim().length > 0;
  const hasResults = results.clinics.length || results.doctors.length || results.services.length;

  let resultsHtml = '';

  if (hasQuery && !hasResults) {
    resultsHtml = `
      <div class="search-empty">
        <p class="search-empty__text">Ничего не найдено по запросу «${escapeHtml(searchQuery)}»</p>
      </div>
    `;
  }

  if (results.clinics.length) {
    resultsHtml += `
      <div class="search-group">
        <h3 class="search-group__title">${icon('icon-clinic', 'icon-mask icon-mask--sm')} Клиники</h3>
        ${results.clinics.map((c) => `
          <button class="search-result" type="button" data-action="search-go-clinic" data-clinic-id="${escapeHtml(c.id)}">
            <strong class="search-result__title">${escapeHtml(c.name)}</strong>
            <span class="search-result__text">${escapeHtml(c.address)}</span>
          </button>
        `).join('')}
      </div>
    `;
  }

  if (results.doctors.length) {
    resultsHtml += `
      <div class="search-group">
        <h3 class="search-group__title">${icon('icon-doctor', 'icon-mask icon-mask--sm')} Врачи</h3>
        ${results.doctors.map((d) => `
          <button class="search-result" type="button" data-action="search-go-doctor" data-doctor-id="${escapeHtml(d.id)}">
            <strong class="search-result__title">${escapeHtml(d.fullName)}</strong>
            <span class="search-result__text">${escapeHtml(d.specialization)}</span>
          </button>
        `).join('')}
      </div>
    `;
  }

  if (results.services.length) {
    resultsHtml += `
      <div class="search-group">
        <h3 class="search-group__title">${icon('icon-appointment', 'icon-mask icon-mask--sm')} Услуги</h3>
        ${results.services.map((s) => `
          <button class="search-result" type="button" data-action="search-go-service" data-service-id="${escapeHtml(s.id)}" data-service-category="${escapeHtml(s.categoryId)}">
            <strong class="search-result__title">${escapeHtml(s.title)}</strong>
            <span class="search-result__text">${escapeHtml(s.categoryTitle)}</span>
          </button>
        `).join('')}
      </div>
    `;
  }

  if (!hasQuery) {
    resultsHtml = `
      <div class="search-hints">
        <p class="search-hints__label">Попробуйте найти</p>
        <div class="search-hints__chips">
          <button class="chip chip--soft" type="button" data-action="search-hint" data-hint="терапевт">Терапевт</button>
          <button class="chip chip--soft" type="button" data-action="search-hint" data-hint="имплант">Имплантация</button>
          <button class="chip chip--soft" type="button" data-action="search-hint" data-hint="чистка">Чистка зубов</button>
          <button class="chip chip--soft" type="button" data-action="search-hint" data-hint="детский">Детский приём</button>
          <button class="chip chip--soft" type="button" data-action="search-hint" data-hint="Белый Лист">Белый Лист</button>
          <button class="chip chip--soft" type="button" data-action="search-hint" data-hint="ортодонт">Ортодонт</button>
        </div>
      </div>
    `;
  }

  body.innerHTML = resultsHtml;
}

function renderScreen() {
  switch (state.route) {
    case 'home':
      return renderHomeScreen(store, state.booking);
    case 'booking-intro':
      return renderBookingIntroScreen(store, state.booking);
    case 'booking-service':
      return renderServiceScreen(store, state.booking);
    case 'booking-clinic':
      return renderClinicScreen(store, state.booking);
    case 'booking-doctor':
      return renderDoctorScreen(store, state.booking);
    case 'booking-datetime':
      return renderDatetimeScreen(store, state.booking);
    case 'booking-confirm':
      return renderConfirmationScreen(store, state.booking);
    case 'directory':
      return renderDirectoryScreen(store, state.directory);
    case 'directory-detail':
      return renderDirectoryDetailScreen(store, state.directory);
    default:
      return renderHomeScreen(store, state.booking);
  }
}

function render() {
  refs.header.innerHTML = renderHeader();
  refs.main.innerHTML = renderScreen();
  refs.nav.innerHTML = renderBottomNav();
  refs.overlay.innerHTML = renderToast();
}

function setRoute(route) {
  if (route === 'directory') {
    state.directory.detail = null;
  }

  state.route = route;
  render();
}

function showToast(title, text) {
  state.toast = { title, text };
  clearTimeout(toastTimer);
  refs.overlay.innerHTML = renderToast();
  toastTimer = window.setTimeout(() => {
    state.toast = null;
    refs.overlay.innerHTML = renderToast();
  }, 2600);
}

function goBack() {
  const backMap = {
    'booking-intro': 'home',
    'booking-service': 'booking-intro',
    'booking-clinic': 'booking-service',
    'booking-doctor': 'booking-clinic',
    'booking-datetime': 'booking-doctor',
    'booking-confirm': 'booking-datetime',
    directory: 'home',
    'directory-detail': 'directory',
  };

  setRoute(backMap[state.route] ?? 'home');
}

function commitBooking() {
  const selectedCategory = getSelectedCategory(store, state.booking);
  const selectedService = getSelectedService(store, state.booking);
  const selectedClinic = getSelectedClinic(store, state.booking);
  const selectedDoctor = getSelectedDoctor(store, state.booking);
  const selectedDay = getSelectedDateEntry(store, state.booking);

  if (!selectedCategory || !selectedService || !selectedClinic || !selectedDoctor || !state.booking.time) {
    return;
  }

  store.appointments.unshift({
    id: `appointment-${Date.now()}`,
    status: 'upcoming',
    type: 'Запись на приём',
    serviceId: selectedService.id,
    serviceName: selectedService.title,
    categoryId: selectedCategory.id,
    clinicId: selectedClinic.id,
    clinicName: selectedClinic.name,
    clinicAddress: selectedClinic.address,
    doctorId: selectedDoctor.id,
    doctorName: selectedDoctor.fullName,
    date: selectedDay?.date ?? state.booking.date,
    time: state.booking.time,
    price: selectedService.price,
    paid: 0,
    reminder: 'Push + SMS за 24 часа и за 2 часа до приёма',
    note: 'Запись подтверждена в приложении',
  });

  resetBooking();
  setRoute('home');
  showToast('Запись подтверждена', 'Визит добавлен на главную страницу и готов к напоминанию.');
}

function startConsultationFlow() {
  state.booking = createBookingState(store);
  state.booking.categoryId = 'consultation';
  setRoute('booking-service');
}

function repeatVisitFlow() {
  const baseAppointment =
    store.appointments.find((appointment) => appointment.status === 'completed') ??
    store.appointments.find((appointment) => appointment.status === 'upcoming');

  if (!baseAppointment) {
    showToast('Нет прошлой записи', 'Сначала нужен хотя бы один завершённый или запланированный визит.');
    return;
  }

  const doctor = store.doctors.find((item) => item.id === baseAppointment.doctorId) ?? null;

  state.booking = {
    categoryId: baseAppointment.categoryId,
    serviceId: baseAppointment.serviceId,
    clinicId: baseAppointment.clinicId,
    doctorId: baseAppointment.doctorId,
    date: doctor?.slotsByDate?.[0]?.date ?? null,
    time: null,
  };

  setRoute('booking-datetime');
  showToast('Маршрут подготовлен', 'Клиника и врач уже выбраны, осталось взять новое свободное время.');
}

function handleAction(target) {
  const actionElement = target.closest('[data-action]');

  if (!actionElement) {
    return false;
  }

  switch (actionElement.dataset.action) {
    case 'go-back':
      goBack();
      return true;
    case 'open-search':
      openSearch();
      return true;
    case 'close-search':
      closeSearch();
      return true;
    case 'search-clear':
      searchQuery = '';
      refs.search.innerHTML = renderSearchOverlay();
      { const input = refs.search.querySelector('[data-search-input]'); if (input) input.focus(); }
      return true;
    case 'search-hint': {
      const hint = actionElement.dataset.hint;
      searchQuery = hint;
      const input = refs.search.querySelector('[data-search-input]');
      if (input) input.value = hint;
      updateSearch(hint);
      return true;
    }
    case 'search-go-clinic':
      closeSearch();
      state.directory.tab = 'clinics';
      setRoute('directory');
      return true;
    case 'search-go-doctor':
      closeSearch();
      state.directory.tab = 'doctors';
      setRoute('directory');
      return true;
    case 'search-go-service': {
      closeSearch();
      state.booking = createBookingState(store);
      state.booking.categoryId = actionElement.dataset.serviceCategory;
      state.booking.serviceId = actionElement.dataset.serviceId;
      setRoute('booking-clinic');
      return true;
    }
    case 'show-directory-tab':
      state.directory.tab = actionElement.dataset.tab || 'clinics';
      state.directory.detail = null;
      setRoute('directory');
      return true;
    case 'open-directory-detail':
      state.directory.tab = 'profile';
      state.directory.detail = actionElement.dataset.detail || null;
      setRoute('directory-detail');
      return true;
    case 'start-consultation-flow':
      startConsultationFlow();
      return true;
    case 'repeat-visit-flow':
      repeatVisitFlow();
      return true;
    case 'set-directory-tab':
      state.directory.tab = actionElement.dataset.tab || 'clinics';
      state.directory.detail = null;
      render();
      return true;
    case 'select-category':
      state.booking.categoryId = actionElement.dataset.serviceCategory;
      state.booking.serviceId = null;
      state.booking.clinicId = null;
      state.booking.doctorId = null;
      state.booking.date = null;
      state.booking.time = null;
      render();
      return true;
    case 'choose-service':
      state.booking.categoryId = actionElement.dataset.serviceCategory;
      state.booking.serviceId = actionElement.dataset.serviceId;
      state.booking.clinicId = null;
      state.booking.doctorId = null;
      state.booking.date = null;
      state.booking.time = null;
      setRoute('booking-clinic');
      return true;
    case 'choose-clinic':
      state.booking.clinicId = actionElement.dataset.clinicId;
      state.booking.doctorId = null;
      state.booking.date = null;
      state.booking.time = null;
      setRoute('booking-doctor');
      return true;
    case 'choose-doctor': {
      const doctorId = actionElement.dataset.doctorId;
      const doctor = getSelectedDoctor({ ...store, doctors: store.doctors }, { doctorId });

      state.booking.doctorId = doctorId;
      state.booking.date = doctor?.slotsByDate?.[0]?.date ?? null;
      state.booking.time = null;
      setRoute('booking-datetime');
      return true;
    }
    case 'choose-date':
      state.booking.date = actionElement.dataset.date;
      state.booking.time = null;
      render();
      return true;
    case 'choose-time':
      state.booking.time = actionElement.dataset.time;
      render();
      return true;
    case 'confirm-booking':
      if (state.booking.time) {
        setRoute('booking-confirm');
      }
      return true;
    case 'finish-booking':
      commitBooking();
      return true;
    default:
      return false;
  }
}

document.addEventListener('click', (event) => {
  if (handleAction(event.target)) {
    return;
  }

  const routeElement = event.target.closest('[data-route]');

  if (!routeElement) {
    return;
  }

  const route = routeElement.dataset.route;

  if (route === 'booking-intro') {
    resetBooking();
  }

  setRoute(route);
});

document.addEventListener('input', (event) => {
  if (event.target.matches('[data-search-input]')) {
    updateSearch(event.target.value);
  }
});

render();
