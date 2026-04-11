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

function formatDate(dateStr) {
  const months = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
  const d = new Date(dateStr + 'T00:00:00');
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

function renderProfileTab(data) {
  const completedVisits = data.appointments.filter((a) => a.status === 'completed');
  const upcomingVisits = data.appointments.filter((a) => a.status === 'upcoming');
  const nextVisit = upcomingVisits[0];

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
          ${data.profile.children.length ? `
            <div class="summary-row">
              <span>Ребёнок в профиле</span>
              <strong>${data.profile.children.map((c) => `${escapeHtml(c.name)}, ${escapeHtml(formatDate(c.birthDate))}`).join('; ')}</strong>
            </div>
          ` : ''}
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

      ${nextVisit ? `
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
      ` : ''}

      <article class="directory-card">
        <div class="directory-card__head">
          <div class="identity-pill">
            <span class="identity-pill__mark">${icon('icon-appointment', 'icon-mask icon-mask--sm')}</span>
            <div>
              <h3 class="selection-card__title">История посещений</h3>
              <p class="selection-card__text">Прошлые визиты с диагнозами и рекомендациями</p>
            </div>
          </div>
        </div>
        ${completedVisits.length
          ? completedVisits.map((visit) => `
            <details class="detail-block" style="margin-top: 10px;">
              <summary class="detail-block__summary">
                <div style="min-width:0;">
                  <strong style="display:block; font-size:14px; font-weight:650; line-height:1.3;">${escapeHtml(visit.serviceName)}</strong>
                  <span style="display:block; margin-top:3px; color:var(--text-muted); font-size:12px; font-weight:500;">${escapeHtml(formatDate(visit.date))} · ${escapeHtml(visit.doctorName)}</span>
                </div>
                <span class="detail-block__icon">${icon('icon-arrow-right', 'icon-mask icon-mask--xs')}</span>
              </summary>
              <div class="detail-block__body">
                <div class="summary-card summary-card--plain">
                  <div class="summary-row">
                    <span>Клиника</span>
                    <strong>${escapeHtml(visit.clinicName)}</strong>
                  </div>
                  <div class="summary-row">
                    <span>Стоимость</span>
                    <strong>${escapeHtml(formatMoney(visit.price))}</strong>
                  </div>
                  <div class="summary-row">
                    <span>Оплачено</span>
                    <strong>${escapeHtml(formatMoney(visit.paid))}</strong>
                  </div>
                  ${visit.diagnosis ? `
                    <div class="summary-row" style="flex-direction:column; gap:6px;">
                      <span>Диагноз и заключение</span>
                      <strong style="text-align:left; font-weight:600; font-size:13px; line-height:1.5; color:var(--text-muted);">${escapeHtml(visit.diagnosis)}</strong>
                    </div>
                  ` : ''}
                  ${visit.note ? `
                    <div class="summary-row" style="flex-direction:column; gap:6px;">
                      <span>Примечание</span>
                      <strong style="text-align:left; font-weight:600; font-size:13px; line-height:1.5; color:var(--text-muted);">${escapeHtml(visit.note)}</strong>
                    </div>
                  ` : ''}
                </div>
              </div>
            </details>
          `).join('')
          : `<p class="selection-card__text" style="margin-top:12px;">Завершённых визитов пока нет.</p>`
        }
      </article>

      <article class="directory-card">
        <div class="directory-card__head">
          <div class="identity-pill">
            <span class="identity-pill__mark">${icon('icon-check', 'icon-mask icon-mask--sm')}</span>
            <div>
              <h3 class="selection-card__title">Документы и гарантии</h3>
              <p class="selection-card__text">Налоговый вычет, гарантии и бонусный счёт</p>
            </div>
          </div>
        </div>
        <div class="summary-card summary-card--plain" style="margin-top:12px;">
          <div class="summary-row">
            <span>Налоговый вычет</span>
            <strong>${escapeHtml(data.profile.medicalDeduction.status)}</strong>
          </div>
          ${(data.warranties || []).map((w) => `
            <div class="summary-row">
              <span>Гарантия: ${escapeHtml(w.title)}</span>
              <strong>${escapeHtml(w.status)} до ${escapeHtml(formatDate(w.validUntil))}</strong>
            </div>
          `).join('')}
          <div class="summary-row">
            <span>Бонусный счёт</span>
            <strong>${escapeHtml(formatMoney(data.profile.bonusBalance))}</strong>
          </div>
        </div>
      </article>
    </div>
  `;
}

export function createDirectoryState() {
  return {
    tab: 'clinics',
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
