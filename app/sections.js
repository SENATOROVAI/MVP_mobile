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
  return `${new Intl.NumberFormat('ru-RU').format(Number(value) || 0)} ₽`;
}

function formatDate(dateStr) {
  const months = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
  const d = new Date(`${dateStr}T00:00:00`);
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

function renderModeBanner(options) {
  return `
    <article class="directory-mode">
      <div>
        <span class="directory-mode__label">${escapeHtml(options.label)}</span>
        <h2 class="directory-mode__title">${escapeHtml(options.title)}</h2>
        <p class="directory-mode__text">${escapeHtml(options.text)}</p>
      </div>
      <div class="directory-mode__stat">
        <span class="directory-mode__stat-label">${escapeHtml(options.statLabel)}</span>
        <strong class="directory-mode__stat-value">${escapeHtml(options.statValue)}</strong>
      </div>
    </article>
  `;
}

function getDetailSection(data, detailId) {
  return (data.profileSections || []).find((section) => section.id === detailId) ?? null;
}

function sortByDateDesc(items, getDateTime) {
  return [...items].sort((left, right) => getDateTime(right) - getDateTime(left));
}

function formatAppointmentStatus(appointment) {
  if (appointment.status === 'upcoming') {
    return 'Запланирован';
  }

  if (appointment.status === 'completed') {
    return 'Завершён';
  }

  return appointment.type || 'Приём';
}

function renderEmptyCard(text, iconName = 'icon-sections') {
  return `
    <article class="directory-card">
      <div class="summary-card__blank">
        <span class="summary-card__blank-icon">${icon(iconName, 'icon-mask icon-mask--sm')}</span>
        <p>${escapeHtml(text)}</p>
      </div>
    </article>
  `;
}

function renderClinicTab(data) {
  return `
    <div class="card-stack">
      ${renderModeBanner({
        label: 'Режим клиник',
        title: 'Сначала адрес и причины выбора',
        text: 'В этом режиме важны понятный филиал, график работы и аргументы, почему именно сюда удобно записаться.',
        statLabel: 'Клиник в сети',
        statValue: String(data.clinics.length),
      })}
      ${data.clinics
        .map(
          (clinic) => `
            <article class="directory-card">
              <div class="directory-card__head">
                <div class="identity-pill">
                  <span class="identity-pill__mark">${icon('icon-clinic', 'icon-mask icon-mask--sm')}</span>
                  <div>
                    <h3 class="selection-card__title">${escapeHtml(clinic.name)}</h3>
                    <p class="selection-card__text">${escapeHtml(clinic.address)}</p>
                  </div>
                </div>
                <span class="badge badge--rating">${escapeHtml(String(clinic.rating))}</span>
              </div>
              <div class="selection-card__meta">
                <span>${escapeHtml(clinic.workingHours)}</span>
                <span>${escapeHtml(`${clinic.reviewsCount} отзывов`)}</span>
              </div>
              <div class="chip-row">
                ${(clinic.highlights || []).map((item) => `<span class="chip chip--soft">${escapeHtml(item)}</span>`).join('')}
              </div>
              <details class="detail-block">
                <summary class="detail-block__summary">
                  <span>Подробнее о клинике</span>
                  <span class="detail-block__icon">${icon('icon-arrow-right', 'icon-mask icon-mask--xs')}</span>
                </summary>
                <div class="detail-block__body">
                  <p class="selection-card__text">${escapeHtml(clinic.description)}</p>
                  <div class="summary-card summary-card--plain">
                    <div class="summary-row">
                      <span>Телефон</span>
                      <strong>${escapeHtml(clinic.phone)}</strong>
                    </div>
                    <div class="summary-row">
                      <span>Направления</span>
                      <strong>${escapeHtml(String((clinic.services || []).length))}</strong>
                    </div>
                  </div>
                </div>
              </details>
              <div class="selection-card__footer">
                <span class="selection-card__hint">Можно перейти к записи в любой момент</span>
                <button class="button button--secondary" type="button" data-route="booking-intro">Записаться</button>
              </div>
            </article>
          `
        )
        .join('')}
    </div>
  `;
}

function renderDoctorTab(data) {
  const clinicsById = new Map(data.clinics.map((clinic) => [clinic.id, clinic]));
  const earliestDoctor = data.doctors.find((doctor) => doctor.slotsByDate?.length);

  return `
    <div class="card-stack">
      ${renderModeBanner({
        label: 'Режим врачей',
        title: 'Быстрое решение через доверие',
        text: 'Здесь акцент на стаже, основном фокусе и ближайшем свободном окне, чтобы врача было легче выбрать без длинного чтения.',
        statLabel: 'Ближайшее окно',
        statValue: earliestDoctor?.slotsByDate?.[0]?.label ?? 'По расписанию',
      })}
      ${data.doctors
        .map((doctor) => {
          const clinicNames = (doctor.clinicIds || [])
            .map((clinicId) => clinicsById.get(clinicId)?.name)
            .filter(Boolean)
            .join(' · ');
          const nextDay = doctor.slotsByDate?.[0];

          return `
            <article class="directory-card">
              <div class="directory-card__head">
                <div class="identity-pill">
                  <span class="identity-pill__mark">${icon('icon-doctor', 'icon-mask icon-mask--sm')}</span>
                  <div>
                    <h3 class="selection-card__title">${escapeHtml(doctor.fullName)}</h3>
                    <p class="selection-card__text">${escapeHtml(doctor.specialization)}</p>
                  </div>
                </div>
                <span class="badge badge--rating">${escapeHtml(String(doctor.rating))}</span>
              </div>
              <div class="selection-card__meta">
                <span>${escapeHtml(`${doctor.experienceYears} лет практики`)}</span>
                <span>${escapeHtml(clinicNames)}</span>
              </div>
              <div class="chip-row">
                ${(doctor.skills || []).slice(0, 3).map((item) => `<span class="chip chip--soft">${escapeHtml(item)}</span>`).join('')}
              </div>
              <details class="detail-block">
                <summary class="detail-block__summary">
                  <span>Ближайшее расписание</span>
                  <span class="detail-block__icon">${icon('icon-arrow-right', 'icon-mask icon-mask--xs')}</span>
                </summary>
                <div class="detail-block__body">
                  ${
                    nextDay
                      ? `
                        <div class="summary-card summary-card--plain">
                          <div class="summary-row">
                            <span>Ближайший день</span>
                            <strong>${escapeHtml(nextDay.label)}</strong>
                          </div>
                          <div class="summary-row">
                            <span>Свободные окна</span>
                            <strong>${escapeHtml((nextDay.slots || []).join(' · '))}</strong>
                          </div>
                        </div>
                      `
                      : '<p class="selection-card__text">Свободные окна появятся после выбора врача в записи.</p>'
                  }
                </div>
              </details>
              <div class="selection-card__footer">
                <span class="selection-card__hint">Профиль уже готов для сценария записи</span>
                <button class="button button--secondary" type="button" data-route="booking-intro">Перейти к записи</button>
              </div>
            </article>
          `;
        })
        .join('')}
    </div>
  `;
}

function renderProfileSectionLinks(data) {
  return `
    <div class="profile-link-list">
      ${(data.profileSections || [])
        .map(
          (section) => `
            <button
              class="directory-card profile-link-card"
              type="button"
              data-action="open-directory-detail"
              data-detail="${escapeHtml(section.id)}"
            >
              <div class="directory-card__head">
                <div class="identity-pill">
                  <span class="identity-pill__mark">${icon(section.iconName, 'icon-mask icon-mask--sm')}</span>
                  <div>
                    <h3 class="selection-card__title">${escapeHtml(section.title)}</h3>
                    <p class="selection-card__text">${escapeHtml(section.subtitle)}</p>
                  </div>
                </div>
                <span class="profile-link-card__icon">${icon('icon-arrow-right', 'icon-mask icon-mask--xs')}</span>
              </div>
            </button>
          `
        )
        .join('')}
    </div>
  `;
}

function renderProfileTab(data) {
  const completedVisits = data.appointments.filter((appointment) => appointment.status === 'completed');
  const upcomingVisits = data.appointments.filter((appointment) => appointment.status === 'upcoming');
  const nextVisit = upcomingVisits[0];
  const streak = data.profile.punctualityStreak;
  const visitsLeft = Math.max((streak?.target || 0) - (streak?.current || 0), 0);

  return `
    <div class="card-stack">
      <article class="profile-card">
        <div class="profile-card__head">
          <div class="profile-card__identity">
            <span class="profile-card__mark">${icon('icon-profile', 'icon-mask icon-mask--lg')}</span>
            <div>
              <h3 class="section-title">${escapeHtml(data.profile.fullName)}</h3>
              <p class="selection-card__text">${escapeHtml(data.profile.phone)}</p>
            </div>
          </div>
        </div>
        <div class="summary-card summary-card--plain" style="margin-top: 16px;">
          <div class="summary-row">
            <span>Дата рождения</span>
            <strong>${escapeHtml(formatDate(data.profile.birthDate))}</strong>
          </div>
          <div class="summary-row">
            <span>Пол</span>
            <strong>${escapeHtml(data.profile.gender)}</strong>
          </div>
          <div class="summary-row">
            <span>Регион</span>
            <strong>${escapeHtml(data.profile.region)}</strong>
          </div>
          <div class="summary-row">
            <span>Электронная почта</span>
            <strong>${escapeHtml(data.profile.email)}</strong>
          </div>
          ${
            data.profile.children.length
              ? `
                <div class="summary-row">
                  <span>Ребёнок в профиле</span>
                  <strong>${data.profile.children.map((child) => `${escapeHtml(child.name)}, ${escapeHtml(formatDate(child.birthDate))}`).join('; ')}</strong>
                </div>
              `
              : ''
          }
        </div>
        <div class="profile-grid" style="margin-top: 16px;">
          <article class="profile-stat">
            <span class="profile-stat__label">Визитов</span>
            <strong class="profile-stat__value">${escapeHtml(String(completedVisits.length))}</strong>
          </article>
          <article class="profile-stat">
            <span class="profile-stat__label">Бонусы</span>
            <strong class="profile-stat__value">${escapeHtml(String(data.profile.bonusBalance))}</strong>
          </article>
          <article class="profile-stat">
            <span class="profile-stat__label">Кэшбэк</span>
            <strong class="profile-stat__value">${escapeHtml(`${data.profile.cashbackPercent}%`)}</strong>
          </article>
        </div>
      </article>

      ${
        nextVisit
          ? `
            <article class="directory-card" style="border-left: 3px solid var(--accent);">
              <div class="directory-card__head">
                <div class="identity-pill">
                  <span class="identity-pill__mark" style="background: var(--accent-soft); color: var(--accent-strong);">${icon('icon-appointment', 'icon-mask icon-mask--sm')}</span>
                  <div>
                    <h3 class="selection-card__title">Следующая запись</h3>
                    <p class="selection-card__text">${escapeHtml(formatDate(nextVisit.date))} в ${escapeHtml(nextVisit.time)}</p>
                  </div>
                </div>
              </div>
              <div class="summary-card summary-card--plain" style="margin-top: 12px;">
                <div class="summary-row">
                  <span>Услуга</span>
                  <strong>${escapeHtml(nextVisit.serviceName)}</strong>
                </div>
                <div class="summary-row">
                  <span>Врач</span>
                  <strong>${escapeHtml(nextVisit.doctorName)}</strong>
                </div>
                <div class="summary-row">
                  <span>Клиника</span>
                  <strong>${escapeHtml(nextVisit.clinicName)}</strong>
                </div>
                <div class="summary-row">
                  <span>Адрес</span>
                  <strong>${escapeHtml(nextVisit.clinicAddress)}</strong>
                </div>
              </div>
            </article>
          `
          : ''
      }

      <article class="directory-card">
        <div class="directory-card__head">
          <div class="identity-pill">
            <span class="identity-pill__mark">${icon('icon-sections', 'icon-mask icon-mask--sm')}</span>
            <div>
              <h3 class="selection-card__title">Личные разделы</h3>
              <p class="selection-card__text">Простые информационные экраны без дополнительных действий внутри.</p>
            </div>
          </div>
        </div>
        <div class="summary-card summary-card--plain" style="margin-top: 12px;">
          <div class="summary-row">
            <span>Налоговый вычет</span>
            <strong>${escapeHtml(data.profile.medicalDeduction.status)}</strong>
          </div>
          <div class="summary-row">
            <span>До бонуса за пунктуальность</span>
            <strong>${escapeHtml(visitsLeft > 0 ? `${visitsLeft} визит${visitsLeft === 1 ? '' : visitsLeft < 5 ? 'а' : 'ов'}` : 'Награда уже доступна')}</strong>
          </div>
        </div>
        <p class="section-text" style="margin-top: 14px;">Откройте нужный раздел, чтобы посмотреть визиты, акции, отзывы и документы без лишней вложенности.</p>
        ${renderProfileSectionLinks(data)}
      </article>
    </div>
  `;
}

function renderAppointmentsHistoryDetail(data) {
  const appointments = sortByDateDesc(
    data.appointments,
    (appointment) => new Date(`${appointment.date}T${appointment.time || '00:00'}`)
  );

  if (!appointments.length) {
    return renderEmptyCard('История визитов появится здесь, как только в профиле будут записи.', 'icon-appointment');
  }

  return `
    <div class="card-stack">
      ${appointments
        .map(
          (appointment) => `
            <article class="directory-card">
              <div class="directory-card__head">
                <div>
                  <h3 class="selection-card__title">${escapeHtml(appointment.serviceName)}</h3>
                  <p class="selection-card__text">${escapeHtml(formatDate(appointment.date))}${appointment.time ? ` · ${escapeHtml(appointment.time)}` : ''}</p>
                </div>
                <span class="badge ${appointment.status === 'upcoming' ? 'badge--rating' : ''}">${escapeHtml(formatAppointmentStatus(appointment))}</span>
              </div>
              <div class="summary-card summary-card--plain" style="margin-top: 12px;">
                <div class="summary-row">
                  <span>Клиника</span>
                  <strong>${escapeHtml(appointment.clinicName)}</strong>
                </div>
                <div class="summary-row">
                  <span>Врач</span>
                  <strong>${escapeHtml(appointment.doctorName)}</strong>
                </div>
                <div class="summary-row">
                  <span>Сумма</span>
                  <strong>${escapeHtml(formatMoney(appointment.price))}</strong>
                </div>
              </div>
            </article>
          `
        )
        .join('')}
    </div>
  `;
}

function renderPromotionsDetail(data) {
  const clinicsById = new Map(data.clinics.map((clinic) => [clinic.id, clinic.name]));

  if (!(data.promos || []).length) {
    return renderEmptyCard('Актуальные акции появятся здесь, когда сеть подготовит предложения.', 'icon-check');
  }

  return `
    <div class="card-stack">
      ${data.promos
        .map(
          (promo) => `
            <article class="directory-card">
              <div class="directory-card__head">
                <div>
                  <h3 class="selection-card__title">${escapeHtml(promo.title)}</h3>
                  <p class="selection-card__text">${escapeHtml(promo.period)}</p>
                </div>
                <span class="badge badge--rating">${escapeHtml(promo.badge)}</span>
              </div>
              <p class="section-text">${escapeHtml(promo.description)}</p>
              <div class="summary-card summary-card--plain" style="margin-top: 12px;">
                <div class="summary-row">
                  <span>Клиники</span>
                  <strong>${escapeHtml((promo.clinics || []).map((clinicId) => clinicsById.get(clinicId)).filter(Boolean).join(' · '))}</strong>
                </div>
              </div>
            </article>
          `
        )
        .join('')}
    </div>
  `;
}

function collectReviewExamples(data) {
  const clinicReviews = data.clinics.flatMap((clinic) =>
    (clinic.reviews || []).map((review) => ({
      ...review,
      source: `Клиника · ${clinic.name}`,
    }))
  );

  const doctorReviews = data.doctors.flatMap((doctor) =>
    (doctor.reviews || []).map((review) => ({
      ...review,
      source: `Врач · ${doctor.fullName}`,
    }))
  );

  return sortByDateDesc([...clinicReviews, ...doctorReviews], (review) => new Date(`${review.date}T00:00:00`)).slice(0, 4);
}

function renderReviewsConsultationDetail(data) {
  const content = data.profileSectionContent?.reviewsConsultation ?? {};
  const reviews = collectReviewExamples(data);

  return `
    <div class="card-stack">
      <article class="directory-card">
        <div class="directory-card__head">
          <div class="identity-pill">
            <span class="identity-pill__mark">${icon('icon-search', 'icon-mask icon-mask--sm')}</span>
            <div>
              <h3 class="selection-card__title">Как устроена консультация</h3>
              <p class="selection-card__text">Простой сценарий связи без формы и без онлайн-чата внутри MVP.</p>
            </div>
          </div>
        </div>
        <p class="section-text">${escapeHtml(content.intro || '')}</p>
        <p class="section-text">${escapeHtml(content.adminNote || '')}</p>
        <div class="detail-list-card">
          <strong class="detail-list-card__title">${escapeHtml(content.faqTitle || 'Типовые вопросы')}</strong>
          <div class="chip-row" style="margin-top: 12px;">
            ${(data.chatQuickReplies || []).map((question) => `<span class="chip chip--soft">${escapeHtml(question)}</span>`).join('')}
          </div>
        </div>
      </article>

      <article class="directory-card">
        <h3 class="selection-card__title">${escapeHtml(content.reviewsTitle || 'Отзывы')}</h3>
        <div class="detail-list review-list">
          ${
            reviews.length
              ? reviews
                  .map(
                    (review) => `
                      <div class="detail-list__item review-snippet">
                        <div class="review-snippet__head">
                          <strong>${escapeHtml(review.author)}</strong>
                          <span class="badge badge--rating">${escapeHtml(String(review.rating))}</span>
                        </div>
                        <p class="selection-card__text">${escapeHtml(review.text)}</p>
                        <span class="review-snippet__meta">${escapeHtml(review.source)} · ${escapeHtml(formatDate(review.date))}</span>
                      </div>
                    `
                  )
                  .join('')
              : `
                <div class="detail-list__item">
                  <p class="selection-card__text">Первые отзывы появятся здесь после запуска сбора обратной связи.</p>
                </div>
              `
          }
        </div>
      </article>
    </div>
  `;
}

function renderTaxDeductionDetail(data) {
  const content = data.profileSectionContent?.taxDeduction ?? {};
  const deduction = data.profile.medicalDeduction ?? { documents: [] };

  return `
    <div class="card-stack">
      <article class="directory-card">
        <div class="directory-card__head">
          <div class="identity-pill">
            <span class="identity-pill__mark">${icon('icon-profile', 'icon-mask icon-mask--sm')}</span>
            <div>
              <h3 class="selection-card__title">Статус и базовая информация</h3>
              <p class="selection-card__text">Информационный раздел без отправки заявки.</p>
            </div>
          </div>
        </div>
        <p class="section-text">${escapeHtml(content.intro || '')}</p>
        <div class="summary-card summary-card--plain" style="margin-top: 12px;">
          <div class="summary-row">
            <span>Статус</span>
            <strong>${escapeHtml(deduction.status || 'Нет данных')}</strong>
          </div>
          <div class="summary-row">
            <span>Ставка вычета</span>
            <strong>${escapeHtml(`${deduction.taxRate || 0}%`)}</strong>
          </div>
        </div>
      </article>

      <article class="directory-card">
        <h3 class="selection-card__title">Документы</h3>
        <div class="detail-list">
          ${(deduction.documents || []).map((item) => `<div class="detail-list__item">${escapeHtml(item)}</div>`).join('')}
        </div>
      </article>

      <article class="directory-card">
        <h3 class="selection-card__title">Как оформить</h3>
        <ol class="detail-steps">
          ${(content.steps || []).map((step) => `<li class="detail-steps__item">${escapeHtml(step)}</li>`).join('')}
        </ol>
        <p class="section-text" style="margin-top: 14px;">${escapeHtml(content.note || '')}</p>
      </article>
    </div>
  `;
}

function renderDirectoryDetailContent(data, detailId) {
  switch (detailId) {
    case 'appointments-history':
      return renderAppointmentsHistoryDetail(data);
    case 'promotions':
      return renderPromotionsDetail(data);
    case 'reviews-consultation':
      return renderReviewsConsultationDetail(data);
    case 'tax-deduction':
      return renderTaxDeductionDetail(data);
    default:
      return renderEmptyCard('Раздел не найден. Вернитесь назад и выберите другой блок.', 'icon-sections');
  }
}

export function getDirectoryDetailMeta(data, detailId) {
  const section = getDetailSection(data, detailId);

  if (!section) {
    return null;
  }

  return {
    title: section.title,
    subtitle: section.subtitle,
  };
}

export function createDirectoryState() {
  return {
    tab: 'clinics',
    detail: null,
  };
}

export function renderDirectoryScreen(data, state = {}) {
  const currentTab = ['clinics', 'doctors', 'profile'].includes(state.tab) ? state.tab : 'clinics';

  const tabContent =
    currentTab === 'clinics'
      ? renderClinicTab(data)
      : currentTab === 'doctors'
        ? renderDoctorTab(data)
        : renderProfileTab(data);

  return `
    <section class="page">
      <article class="screen-card">
        <div class="section-head">
          <div>
            <span class="eyebrow eyebrow--muted">Разделы приложения</span>
            <h1 class="section-title section-title--large">Клиники, врачи и профиль в одном экране</h1>
          </div>
        </div>
        <p class="section-text">Сегменты переключаются мгновенно и не уводят пользователя в лишние маршруты.</p>
        <div class="segmented">
          <button class="segmented__item ${currentTab === 'clinics' ? 'is-active' : ''}" type="button" data-action="set-directory-tab" data-tab="clinics">
            <span class="segmented__icon">${icon('icon-clinic', 'icon-mask icon-mask--xs')}</span>
            Клиники
          </button>
          <button class="segmented__item ${currentTab === 'doctors' ? 'is-active' : ''}" type="button" data-action="set-directory-tab" data-tab="doctors">
            <span class="segmented__icon">${icon('icon-doctor', 'icon-mask icon-mask--xs')}</span>
            Врачи
          </button>
          <button class="segmented__item ${currentTab === 'profile' ? 'is-active' : ''}" type="button" data-action="set-directory-tab" data-tab="profile">
            <span class="segmented__icon">${icon('icon-profile', 'icon-mask icon-mask--xs')}</span>
            Профиль
          </button>
        </div>
      </article>
    </section>

    <section class="page page--dense">
      ${tabContent}
    </section>
  `;
}

export function renderDirectoryDetailScreen(data, state = {}) {
  const meta = getDirectoryDetailMeta(data, state.detail);

  if (!meta) {
    return renderDirectoryScreen(data, state);
  }

  return `
    <section class="page">
      <article class="screen-card">
        <div class="section-head">
          <div>
            <span class="eyebrow eyebrow--muted">Профиль</span>
            <h1 class="section-title section-title--large">${escapeHtml(meta.title)}</h1>
          </div>
        </div>
        <p class="section-text">${escapeHtml(meta.subtitle)}</p>
      </article>
    </section>

    <section class="page page--dense">
      ${renderDirectoryDetailContent(data, state.detail)}
    </section>
  `;
}
