const moneyFormatter = new Intl.NumberFormat('ru-RU');

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

function formatMoney(value = 0) {
  return `${moneyFormatter.format(Number(value) || 0)} ₽`;
}

function formatSlotLabel(slotDay) {
  return slotDay?.label ?? slotDay?.date ?? '';
}

function getClinicReasons(clinic) {
  const highlights = clinic.highlights || [];
  const reasons = [...highlights];

  if (clinic.reviewsCount) {
    reasons.push(`${clinic.reviewsCount} отзывов пациентов`);
  }

  if (clinic.doctorIds?.length) {
    reasons.push(`${clinic.doctorIds.length} врачей в этом филиале`);
  }

  return reasons.slice(0, 3);
}

function getDoctorFitText(doctor) {
  const specialization = doctor.specialization.toLowerCase();

  if (specialization.includes('детский')) {
    return 'подходит для детского приёма';
  }

  if (specialization.includes('ортодонт')) {
    return 'подходит для длительного плана коррекции';
  }

  if (specialization.includes('хирург') || specialization.includes('имплант')) {
    return 'подходит для сложных клинических случаев';
  }

  if (specialization.includes('ортопед')) {
    return 'подходит для восстановления и протезирования';
  }

  if (specialization.includes('гигиен')) {
    return 'подходит для профилактики и регулярного ухода';
  }

  return 'подходит для первичного обращения и лечения';
}

function renderProgress(step) {
  const steps = [
    { route: 'booking-service', label: 'Услуга' },
    { route: 'booking-clinic', label: 'Клиника' },
    { route: 'booking-doctor', label: 'Врач' },
    { route: 'booking-datetime', label: 'Время' },
    { route: 'booking-confirm', label: 'Подтверждение' },
  ];

  return `
    <div class="progress" aria-label="Шаги записи">
      ${steps
        .map(
          (item, index) => `
            <span class="progress__step ${index + 1 === step ? 'is-current' : ''}">
              <span class="progress__dot"></span>
              ${escapeHtml(item.label)}
            </span>
          `
        )
        .join('')}
    </div>
  `;
}

function getFeatureCards(data) {
  return [
    {
      title: 'Клиники сети',
      text: `${data.clinics.length} адреса с единым качеством сервиса и понятным графиком работы.`,
      action: 'show-directory-tab',
      tab: 'clinics',
      label: 'Открыть раздел',
      iconName: 'icon-clinic',
    },
    {
      title: 'Команда врачей',
      text: `${data.doctors.length} специалистов с рейтингом, стажем и ближайшими свободными окнами.`,
      action: 'show-directory-tab',
      tab: 'doctors',
      label: 'Выбрать врача',
      iconName: 'icon-doctor',
    },
    {
      title: 'Личный профиль',
      text: 'Бонусы, ребёнок в профиле, налоговый вычет и история завершённых визитов в одном месте.',
      action: 'show-directory-tab',
      tab: 'profile',
      label: 'Посмотреть данные',
      iconName: 'icon-profile',
    },
  ];
}

function renderFeatureCard(item) {
  return `
    <article class="feature-card">
      <div class="feature-card__head">
        <span class="feature-card__icon">${icon(item.iconName, 'icon-mask icon-mask--sm')}</span>
        <button
          class="button button--quiet"
          type="button"
          data-action="${escapeHtml(item.action)}"
          data-tab="${escapeHtml(item.tab)}"
        >
          ${escapeHtml(item.label)}
        </button>
      </div>
      <h3 class="feature-card__title">${escapeHtml(item.title)}</h3>
      <p class="feature-card__text">${escapeHtml(item.text)}</p>
    </article>
  `;
}

function renderServiceCard(service, selectedCategoryId, isSelected) {
  return `
    <button
      class="selection-card selection-card--service ${isSelected ? 'is-selected' : ''}"
      type="button"
      data-action="choose-service"
      data-service-id="${escapeHtml(service.id)}"
      data-service-category="${escapeHtml(selectedCategoryId)}"
    >
      <div class="selection-card__top">
        <span class="selection-card__icon">${icon('icon-appointment', 'icon-mask icon-mask--sm')}</span>
        <div class="selection-card__top-right">
          ${isSelected ? '<span class="selection-card__status">Выбрано</span>' : ''}
          <span class="selection-card__price">${escapeHtml(formatMoney(service.price))}</span>
        </div>
      </div>
      <div class="selection-card__content">
        <h3 class="selection-card__title">${escapeHtml(service.title)}</h3>
        <p class="selection-card__text">${escapeHtml(service.description)}</p>
      </div>
      <div class="selection-card__meta">
        <span>${escapeHtml(`${service.duration} минут`)}</span>
        <span>${escapeHtml('Онлайн-подтверждение')}</span>
      </div>
    </button>
  `;
}

function renderClinicCard(clinic, isSelected) {
  const reasons = getClinicReasons(clinic);

  return `
    <article class="selection-card selection-card--entity ${isSelected ? 'is-selected' : ''}">
      <div class="selection-card__row">
        <div class="identity-pill">
          <span class="identity-pill__mark">${icon('icon-clinic', 'icon-mask icon-mask--sm')}</span>
          <div>
            <h3 class="selection-card__title">${escapeHtml(clinic.name)}</h3>
            <p class="selection-card__text">${escapeHtml(clinic.address)}</p>
          </div>
        </div>
        <span class="badge badge--rating">${escapeHtml(String(clinic.rating))}</span>
      </div>
      <div class="selection-card__trust">
        ${reasons
          .map(
            (reason) => `
              <div class="selection-card__trust-item">
                <span class="selection-card__trust-label">Почему сюда</span>
                <strong class="selection-card__trust-value">${escapeHtml(reason)}</strong>
              </div>
            `
          )
          .join('')}
      </div>
      <div class="selection-card__meta">
        <span>Режим работы: ${escapeHtml(clinic.workingHours)}</span>
        <span>Телефон: ${escapeHtml(clinic.phone)}</span>
      </div>
      <div class="chip-row">
        ${(clinic.highlights || []).map((item) => `<span class="chip chip--soft">${escapeHtml(item)}</span>`).join('')}
      </div>
      <div class="selection-card__footer">
        <span class="selection-card__hint">${escapeHtml(`${clinic.reviewsCount} отзывов`)}</span>
        <button class="button button--primary" type="button" data-action="choose-clinic" data-clinic-id="${escapeHtml(clinic.id)}">
          Выбрать клинику
        </button>
      </div>
    </article>
  `;
}

function renderDoctorCard(doctor, clinicsById, isSelected) {
  const clinicNames = doctor.clinicIds
    .map((clinicId) => clinicsById.get(clinicId)?.name)
    .filter(Boolean)
    .join(' · ');
  const nextSlot = doctor.slotsByDate?.[0];
  const trustItems = [
    {
      label: 'Ближайшее окно',
      value: nextSlot ? formatSlotLabel(nextSlot) : 'По расписанию клиники',
    },
    {
      label: 'Основной фокус',
      value: doctor.skills?.[0] ?? doctor.specialization,
    },
    {
      label: 'Подходит для',
      value: getDoctorFitText(doctor),
    },
  ];

  return `
    <article class="selection-card selection-card--entity ${isSelected ? 'is-selected' : ''}">
      <div class="selection-card__row">
        <div class="identity-pill">
          <span class="identity-pill__mark">${icon('icon-doctor', 'icon-mask icon-mask--sm')}</span>
          <div>
            <h3 class="selection-card__title">${escapeHtml(doctor.fullName)}</h3>
            <p class="selection-card__text">${escapeHtml(doctor.specialization)}</p>
          </div>
        </div>
        <span class="badge badge--rating">${escapeHtml(String(doctor.rating))}</span>
      </div>
      <div class="selection-card__trust">
        ${trustItems
          .map(
            (item) => `
              <div class="selection-card__trust-item">
                <span class="selection-card__trust-label">${escapeHtml(item.label)}</span>
                <strong class="selection-card__trust-value">${escapeHtml(item.value)}</strong>
              </div>
            `
          )
          .join('')}
      </div>
      <div class="selection-card__meta">
        <span>${escapeHtml(`${doctor.experienceYears} лет практики`)}</span>
        <span>${escapeHtml(clinicNames)}</span>
      </div>
      <div class="chip-row">
        ${(doctor.skills || []).slice(0, 3).map((item) => `<span class="chip chip--soft">${escapeHtml(item)}</span>`).join('')}
      </div>
      <div class="selection-card__footer">
        <span class="selection-card__hint">${escapeHtml(nextSlot ? `Ближайшее окно: ${formatSlotLabel(nextSlot)}` : 'Свободные окна доступны')}</span>
        <button class="button button--primary" type="button" data-action="choose-doctor" data-doctor-id="${escapeHtml(doctor.id)}">
          Выбрать врача
        </button>
      </div>
    </article>
  `;
}

function renderEmptyState(title, text, route, buttonLabel) {
  return `
    <section class="page">
      <div class="empty-state">
        <span class="empty-state__icon">${icon('icon-appointment', 'icon-mask icon-mask--lg')}</span>
        <h2 class="empty-state__title">${escapeHtml(title)}</h2>
        <p class="empty-state__text">${escapeHtml(text)}</p>
        <button class="button button--primary" type="button" data-route="${escapeHtml(route)}">${escapeHtml(buttonLabel)}</button>
      </div>
    </section>
  `;
}

export function createBookingState(data = {}) {
  return {
    categoryId: data.serviceCategories?.[0]?.id ?? null,
    serviceId: null,
    clinicId: null,
    doctorId: null,
    date: null,
    time: null,
  };
}

export function getSelectedCategory(data, state) {
  return data.serviceCategories.find((category) => category.id === state.categoryId) ?? data.serviceCategories[0] ?? null;
}

export function getSelectedService(data, state) {
  const selectedCategory = getSelectedCategory(data, state);

  return selectedCategory?.services.find((service) => service.id === state.serviceId) ?? null;
}

export function getSelectedClinic(data, state) {
  return data.clinics.find((clinic) => clinic.id === state.clinicId) ?? null;
}

export function getSelectedDoctor(data, state) {
  return data.doctors.find((doctor) => doctor.id === state.doctorId) ?? null;
}

export function getSelectedDateEntry(data, state) {
  const doctor = getSelectedDoctor(data, state);

  return doctor?.slotsByDate.find((slotDay) => slotDay.date === state.date) ?? doctor?.slotsByDate?.[0] ?? null;
}

export function renderHomeScreen(data) {
  const upcomingAppointment = data.appointments.find((appointment) => appointment.status === 'upcoming') ?? null;
  const featureCards = getFeatureCards(data);

  return `
    <section class="page">
      <article class="hero hero--home">
        <div class="hero__copy">
          <span class="eyebrow">Личная запись в клинику</span>
          <h1 class="hero__title">Спокойный путь от выбора услуги до подтверждения приёма</h1>
          <p class="hero__text">
            Здесь сразу видно клинику, врача, время и итог записи. Интерфейс построен так, чтобы всё можно было пройти одной рукой.
          </p>
          <div class="hero__actions">
            <button class="button button--primary" type="button" data-route="booking-intro">Записаться</button>
            <button class="button button--secondary" type="button" data-action="show-directory-tab" data-tab="clinics">Смотреть разделы</button>
          </div>
        </div>
        <div class="hero__art-wrap">
          <img class="hero__art" src="./assets/svg/hero-smile.svg" alt="" />
        </div>
      </article>
    </section>

    <section class="page page--dense">
      <div class="metric-grid">
        <article class="metric-card">
          <span class="metric-card__value">24/7</span>
          <span class="metric-card__label">запись без звонка</span>
        </article>
        <article class="metric-card">
          <span class="metric-card__value">${escapeHtml(String(data.profile.bonusBalance))}</span>
          <span class="metric-card__label">бонусов в профиле</span>
        </article>
        <article class="metric-card">
          <span class="metric-card__value">${escapeHtml(String(data.clinics.length))}</span>
          <span class="metric-card__label">клиники в сети</span>
        </article>
      </div>
    </section>

    <section class="page page--dense">
      <div class="section-head">
        <div>
          <span class="eyebrow eyebrow--muted">Ближайшая запись</span>
          <h2 class="section-title">Что уже выбрано</h2>
        </div>
      </div>
      ${
        upcomingAppointment
          ? `
            <article class="appointment-ticket">
              <div class="appointment-ticket__head">
                <div>
                  <span class="appointment-ticket__eyebrow">Подтверждённый визит</span>
                  <h3 class="appointment-ticket__title">${escapeHtml(upcomingAppointment.serviceName)}</h3>
                </div>
                <span class="badge badge--rating">${escapeHtml(upcomingAppointment.time)}</span>
              </div>
              <div class="appointment-ticket__grid">
                <div class="appointment-ticket__cell">
                  <span class="appointment-ticket__label">Клиника</span>
                  <strong class="appointment-ticket__value">${escapeHtml(upcomingAppointment.clinicName)}</strong>
                </div>
                <div class="appointment-ticket__cell">
                  <span class="appointment-ticket__label">Врач</span>
                  <strong class="appointment-ticket__value">${escapeHtml(upcomingAppointment.doctorName)}</strong>
                </div>
                <div class="appointment-ticket__cell">
                  <span class="appointment-ticket__label">Дата</span>
                  <strong class="appointment-ticket__value">${escapeHtml(upcomingAppointment.date)}</strong>
                </div>
                <div class="appointment-ticket__cell">
                  <span class="appointment-ticket__label">Напоминание</span>
                  <strong class="appointment-ticket__value">${escapeHtml(upcomingAppointment.reminder)}</strong>
                </div>
              </div>
            </article>
          `
          : `
            <article class="appointment-ticket appointment-ticket--empty">
              <div class="summary-card__blank">
                <span class="summary-card__blank-icon">${icon('icon-appointment', 'icon-mask icon-mask--sm')}</span>
                <p>Ближайшая запись появится здесь сразу после подтверждения.</p>
              </div>
            </article>
          `
      }
    </section>

    <section class="page page--dense">
      <div class="section-head">
        <div>
          <span class="eyebrow eyebrow--muted">Навигация по продукту</span>
          <h2 class="section-title">Быстрые переходы</h2>
        </div>
      </div>
      <div class="feature-grid">
        ${featureCards.map(renderFeatureCard).join('')}
      </div>
    </section>
  `;
}

export function renderBookingIntroScreen(data, state) {
  const favoriteClinic = data.clinics.find((clinic) => clinic.id === data.profile.favoriteClinicId) ?? data.clinics[0];
  const selectedService = getSelectedService(data, state);
  const repeatVisit = data.appointments.find((appointment) => appointment.status === 'completed') ?? data.appointments[0] ?? null;

  return `
    <section class="page">
      <article class="hero hero--booking">
        <div class="hero__copy">
          <span class="eyebrow">Запись на приём</span>
          <h1 class="hero__title">Сначала зафиксируем направление, а затем соберём весь визит по шагам</h1>
          <p class="hero__text">
            Вы последовательно выберете услугу, клинику, врача, свободное окно и увидите итог перед подтверждением.
          </p>
        </div>
        <div class="hero__art-wrap hero__art-wrap--compact">
          <img class="hero__art hero__art--compact" src="./assets/svg/hero-smile.svg" alt="" />
        </div>
      </article>
    </section>

    <section class="page page--dense">
      <article class="step-card">
        ${renderProgress(1)}
        <div class="step-card__grid">
          <div class="step-card__item">
            <strong>Шаг 1</strong>
            <span>Выбор направления и конкретной услуги</span>
          </div>
          <div class="step-card__item">
            <strong>Шаг 2</strong>
            <span>Подбор подходящей клиники сети</span>
          </div>
          <div class="step-card__item">
            <strong>Шаг 3</strong>
            <span>Выбор врача и свободного времени</span>
          </div>
        </div>
      </article>
    </section>

    <section class="page page--dense">
      <div class="section-head">
        <div>
          <span class="eyebrow eyebrow--muted">Быстрый вход</span>
          <h2 class="section-title">Можно начать по двум готовым сценариям</h2>
        </div>
      </div>
      <div class="shortcut-grid">
        <article class="shortcut-card">
          <span class="shortcut-card__icon">${icon('icon-appointment', 'icon-mask icon-mask--sm')}</span>
          <h3 class="shortcut-card__title">Записаться на консультацию</h3>
          <p class="shortcut-card__text">Сразу открываем направление консультаций, чтобы сократить первый выбор.</p>
          <button class="button button--primary" type="button" data-action="start-consultation-flow">Начать с консультации</button>
        </article>
        <article class="shortcut-card shortcut-card--soft">
          <span class="shortcut-card__icon">${icon('icon-check', 'icon-mask icon-mask--sm')}</span>
          <h3 class="shortcut-card__title">Повторить прошлый маршрут</h3>
          <p class="shortcut-card__text">
            ${
              repeatVisit
                ? escapeHtml(`Подставим врача и клинику из визита «${repeatVisit.serviceName}».`)
                : 'Если в истории уже был визит, можно быстро собрать похожую запись.'
            }
          </p>
          <button class="button button--secondary" type="button" data-action="repeat-visit-flow">Повторить маршрут</button>
        </article>
      </div>
    </section>

    <section class="page page--dense">
      <div class="feature-grid feature-grid--double">
        <article class="feature-card feature-card--soft">
          <div class="feature-card__head">
            <span class="feature-card__icon">${icon('icon-clinic', 'icon-mask icon-mask--sm')}</span>
          </div>
          <h3 class="feature-card__title">Предпочтительная клиника</h3>
          <p class="feature-card__text">${escapeHtml(favoriteClinic.name)} · ${escapeHtml(favoriteClinic.address)}</p>
        </article>
        <article class="feature-card feature-card--soft">
          <div class="feature-card__head">
            <span class="feature-card__icon">${icon('icon-check', 'icon-mask icon-mask--sm')}</span>
          </div>
          <h3 class="feature-card__title">Напоминание о визите</h3>
          <p class="feature-card__text">После подтверждения запись остаётся в приложении, а напоминание придёт заранее.</p>
        </article>
      </div>
      <div class="callout">
        <div>
          <span class="callout__label">Текущее состояние</span>
          <p class="callout__text">
            ${escapeHtml(selectedService ? `Сейчас в фокусе услуга «${selectedService.title}».` : 'Вы ещё не выбрали услугу. Начните с направления приёма.')}
          </p>
        </div>
        <button class="button button--primary" type="button" data-route="booking-service">Продолжить</button>
      </div>
    </section>
  `;
}

export function renderServiceScreen(data, state) {
  const selectedCategory = getSelectedCategory(data, state);
  const selectedService = getSelectedService(data, state);

  return `
    <section class="page">
      <article class="screen-card">
        ${renderProgress(1)}
        <div class="section-head">
          <div>
            <span class="eyebrow eyebrow--muted">Шаг 1 из 5</span>
            <h1 class="section-title section-title--large">Выберите услугу</h1>
          </div>
        </div>
        <p class="section-text">Сначала задаём направление, затем конкретную процедуру. После этого откроем клиники, где можно записаться.</p>
      </article>
    </section>

    <section class="page page--dense">
      <article class="selection-spotlight">
        <div>
          <span class="selection-spotlight__label">${escapeHtml(selectedCategory?.title ?? 'Услуги')}</span>
          <h2 class="selection-spotlight__title">
            ${escapeHtml(selectedService ? selectedService.title : 'Сначала направление, потом конкретная услуга')}
          </h2>
          <p class="selection-spotlight__text">
            ${escapeHtml(
              selectedService
                ? `${selectedService.duration} минут · стоимость от ${formatMoney(selectedService.price)}`
                : selectedCategory?.description ?? 'Выберите категорию, чтобы сфокусировать список услуг.'
            )}
          </p>
        </div>
        ${selectedService ? '<span class="selection-spotlight__badge">Текущий выбор</span>' : ''}
      </article>
    </section>

    <section class="page page--dense">
      <div class="chip-row chip-row--scroll">
        ${data.serviceCategories
          .map(
            (category) => `
              <button
                class="chip ${category.id === selectedCategory?.id ? 'is-active' : ''}"
                type="button"
                data-action="select-category"
                data-service-category="${escapeHtml(category.id)}"
              >
                ${escapeHtml(category.title)}
              </button>
            `
          )
          .join('')}
      </div>
    </section>

    <section class="page page--dense">
      <div class="section-head">
        <div>
          <span class="eyebrow eyebrow--muted">${escapeHtml(selectedCategory?.title ?? 'Услуги')}</span>
          <h2 class="section-title">${escapeHtml(selectedService ? 'Можно выбрать другую услугу' : 'Доступные варианты')}</h2>
        </div>
      </div>
      <div class="card-stack">
        ${(selectedCategory?.services ?? []).map((service) => renderServiceCard(service, selectedCategory.id, service.id === selectedService?.id)).join('')}
      </div>
    </section>
  `;
}

export function renderClinicScreen(data, state) {
  const selectedCategory = getSelectedCategory(data, state);
  const selectedService = getSelectedService(data, state);

  if (!selectedCategory || !selectedService) {
    return renderEmptyState('Нужно начать с услуги', 'Сначала выберите направление и конкретную процедуру, чтобы подобрать подходящую клинику.', 'booking-service', 'Перейти к выбору услуги');
  }

  const availableClinics = data.clinics.filter((clinic) => (clinic.services || []).includes(selectedCategory.id));

  return `
    <section class="page">
      <article class="screen-card">
        ${renderProgress(2)}
        <div class="section-head">
          <div>
            <span class="eyebrow eyebrow--muted">Шаг 2 из 5</span>
            <h1 class="section-title section-title--large">Выберите клинику</h1>
          </div>
        </div>
        <p class="section-text">Показываем только те адреса, где доступно выбранное направление и есть подходящие специалисты.</p>
      </article>
    </section>

    <section class="page page--dense">
      <article class="summary-card">
        <div class="summary-row">
          <span>Услуга</span>
          <strong>${escapeHtml(selectedService.title)}</strong>
        </div>
        <div class="summary-row">
          <span>Категория</span>
          <strong>${escapeHtml(selectedCategory.title)}</strong>
        </div>
        <div class="summary-row">
          <span>Стоимость от</span>
          <strong>${escapeHtml(formatMoney(selectedService.price))}</strong>
        </div>
      </article>
    </section>

    <section class="page page--dense">
      <div class="card-stack">
        ${availableClinics.map((clinic) => renderClinicCard(clinic, clinic.id === state.clinicId)).join('')}
      </div>
    </section>
  `;
}

export function renderDoctorScreen(data, state) {
  const selectedClinic = getSelectedClinic(data, state);
  const selectedService = getSelectedService(data, state);

  if (!selectedClinic || !selectedService) {
    return renderEmptyState('Сначала выберите клинику', 'После выбора клиники откроются врачи, которые ведут приём по нужному направлению.', 'booking-clinic', 'Вернуться к клиникам');
  }

  const clinicsById = new Map(data.clinics.map((clinic) => [clinic.id, clinic]));
  const clinicDoctors = data.doctors.filter((doctor) => (doctor.clinicIds || []).includes(selectedClinic.id));

  return `
    <section class="page">
      <article class="screen-card">
        ${renderProgress(3)}
        <div class="section-head">
          <div>
            <span class="eyebrow eyebrow--muted">Шаг 3 из 5</span>
            <h1 class="section-title section-title--large">Выберите врача</h1>
          </div>
        </div>
        <p class="section-text">У каждого врача видны специализация, стаж, свободные окна и клиники, где он ведёт приём.</p>
      </article>
    </section>

    <section class="page page--dense">
      <article class="summary-card">
        <div class="summary-row">
          <span>Клиника</span>
          <strong>${escapeHtml(selectedClinic.name)}</strong>
        </div>
        <div class="summary-row">
          <span>Адрес</span>
          <strong>${escapeHtml(selectedClinic.address)}</strong>
        </div>
        <div class="summary-row">
          <span>Услуга</span>
          <strong>${escapeHtml(selectedService.title)}</strong>
        </div>
      </article>
    </section>

    <section class="page page--dense">
      <div class="card-stack">
        ${clinicDoctors.map((doctor) => renderDoctorCard(doctor, clinicsById, doctor.id === state.doctorId)).join('')}
      </div>
    </section>
  `;
}

export function renderDatetimeScreen(data, state) {
  const selectedClinic = getSelectedClinic(data, state);
  const selectedDoctor = getSelectedDoctor(data, state);
  const selectedService = getSelectedService(data, state);

  if (!selectedClinic || !selectedDoctor || !selectedService) {
    return renderEmptyState('Ещё не собран весь визит', 'Нужно последовательно выбрать услугу, клинику и врача, чтобы открыть свободные слоты.', 'booking-service', 'Начать заново');
  }

  const selectedDay = getSelectedDateEntry(data, state);

  return `
    <section class="page">
      <article class="screen-card">
        ${renderProgress(4)}
        <div class="section-head">
          <div>
            <span class="eyebrow eyebrow--muted">Шаг 4 из 5</span>
            <h1 class="section-title section-title--large">Дата и время</h1>
          </div>
        </div>
        <p class="section-text">Сначала выбирается день, затем конкретное окно приёма. Итог сразу собирается в сводке ниже.</p>
      </article>
    </section>

    <section class="page page--dense">
      <article class="summary-card">
        <div class="summary-row">
          <span>Услуга</span>
          <strong>${escapeHtml(selectedService.title)}</strong>
        </div>
        <div class="summary-row">
          <span>Клиника</span>
          <strong>${escapeHtml(selectedClinic.name)}</strong>
        </div>
        <div class="summary-row">
          <span>Врач</span>
          <strong>${escapeHtml(selectedDoctor.fullName)}</strong>
        </div>
      </article>
    </section>

    <section class="page page--dense">
      <div class="section-head">
        <div>
          <span class="eyebrow eyebrow--muted">Доступные дни</span>
          <h2 class="section-title">График врача</h2>
        </div>
      </div>
      <div class="date-strip">
        ${(selectedDoctor.slotsByDate || [])
          .map(
            (slotDay) => `
              <button
                class="date-pill ${slotDay.date === selectedDay?.date ? 'is-active' : ''}"
                type="button"
                data-action="choose-date"
                data-date="${escapeHtml(slotDay.date)}"
              >
                <span class="date-pill__label">${escapeHtml(formatSlotLabel(slotDay).split(',')[0])}</span>
                <strong class="date-pill__value">${escapeHtml(slotDay.date.split('-')[2])}</strong>
                <span class="date-pill__meta">${escapeHtml(`${slotDay.slots.length} окна`)}</span>
              </button>
            `
          )
          .join('')}
      </div>
    </section>

    <section class="page page--dense">
      <div class="section-head">
        <div>
          <span class="eyebrow eyebrow--muted">Свободные окна</span>
          <h2 class="section-title">${escapeHtml(formatSlotLabel(selectedDay))}</h2>
        </div>
      </div>
      <div class="slot-grid">
        ${(selectedDay?.slots ?? [])
          .map(
            (slot) => `
              <button
                class="slot-card ${slot === state.time ? 'is-active' : ''}"
                type="button"
                data-action="choose-time"
                data-time="${escapeHtml(slot)}"
              >
                <span class="slot-card__time">${escapeHtml(slot)}</span>
                <span class="slot-card__meta">${slot === state.time ? 'выбрано' : 'свободно'}</span>
              </button>
            `
          )
          .join('')}
      </div>
      ${
        state.time
          ? `
            <div class="timing-preview">
              <div>
                <span class="timing-preview__label">Выбранное окно</span>
                <strong class="timing-preview__value">${escapeHtml(formatSlotLabel(selectedDay))} · ${escapeHtml(state.time)}</strong>
              </div>
              <span class="timing-preview__icon">${icon('icon-check', 'icon-mask icon-mask--sm')}</span>
            </div>
          `
          : ''
      }
      <div class="sticky-actions">
        <button class="button button--primary" type="button" data-action="confirm-booking" ${state.time ? '' : 'disabled'}>
          Перейти к подтверждению
        </button>
      </div>
    </section>
  `;
}

export function renderConfirmationScreen(data, state) {
  const selectedCategory = getSelectedCategory(data, state);
  const selectedService = getSelectedService(data, state);
  const selectedClinic = getSelectedClinic(data, state);
  const selectedDoctor = getSelectedDoctor(data, state);
  const selectedDay = getSelectedDateEntry(data, state);

  if (!selectedCategory || !selectedService || !selectedClinic || !selectedDoctor || !state.time) {
    return renderEmptyState('Нужно завершить выбор времени', 'Когда дата и слот будут выбраны, здесь появится финальная сводка записи.', 'booking-datetime', 'Вернуться к расписанию');
  }

  return `
    <section class="page">
      <article class="confirm-card">
        ${renderProgress(5)}
        <div class="confirm-card__hero">
          <span class="confirm-card__mark">${icon('icon-check', 'icon-mask icon-mask--lg')}</span>
          <div>
            <span class="eyebrow eyebrow--muted">Проверьте детали</span>
            <h1 class="section-title section-title--large">Запись готова к подтверждению</h1>
            <p class="section-text">Вся информация уже собрана. После подтверждения визит сразу появится на главной странице.</p>
          </div>
        </div>

        <div class="summary-card summary-card--plain">
          <div class="summary-row">
            <span>Услуга</span>
            <strong>${escapeHtml(selectedService.title)}</strong>
          </div>
          <div class="summary-row">
            <span>Категория</span>
            <strong>${escapeHtml(selectedCategory.title)}</strong>
          </div>
          <div class="summary-row">
            <span>Клиника</span>
            <strong>${escapeHtml(selectedClinic.address)}</strong>
          </div>
          <div class="summary-row">
            <span>Врач</span>
            <strong>${escapeHtml(selectedDoctor.fullName)}</strong>
          </div>
          <div class="summary-row">
            <span>Дата и время</span>
            <strong>${escapeHtml(formatSlotLabel(selectedDay))} · ${escapeHtml(state.time)}</strong>
          </div>
          <div class="summary-row">
            <span>Стоимость от</span>
            <strong>${escapeHtml(formatMoney(selectedService.price))}</strong>
          </div>
        </div>

        <div class="confirm-list">
          <div class="confirm-list__item">
            <span class="confirm-list__icon">${icon('icon-check', 'icon-mask icon-mask--sm')}</span>
            <span>Напоминание придёт заранее, чтобы визит не потерялся.</span>
          </div>
          <div class="confirm-list__item">
            <span class="confirm-list__icon">${icon('icon-check', 'icon-mask icon-mask--sm')}</span>
            <span>Запись останется в приложении вместе с клиникой, врачом и временем.</span>
          </div>
          <div class="confirm-list__item">
            <span class="confirm-list__icon">${icon('icon-check', 'icon-mask icon-mask--sm')}</span>
            <span>Маршрут можно быстро повторить снова без переобучения пользователя.</span>
          </div>
        </div>

        <div class="hero__actions">
          <button class="button button--primary" type="button" data-action="finish-booking">Подтвердить запись</button>
          <button class="button button--secondary" type="button" data-route="booking-datetime">Изменить время</button>
        </div>
      </article>
    </section>
  `;
}
