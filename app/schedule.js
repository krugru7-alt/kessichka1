// ==========================================
// РАСПИСАНИЕ КЭССИЧКИ
// ==========================================

export const weeklySchedule = {
  monday: [
    {
      time: "07:00",
      type: "morning",
      title: "Доброе утро ❤️",
      text: "Доброе утро, Любовь моя. Хорошего дня 😌",
    },
    {
      time: "12:10",
      type: "day",
      title: "ОБЭД 🌷",
      text: "Приятного аппетита ❤️",
    },
    {
      time: "16:30",
      type: "reminder",
      title: "Я просто напоминаю ❤️",
      text: "Буськаю",
    },
    {
      time: "23:00",
      type: "night",
      title: "Сладких снов 💤",
      text: "Сладких снов, Любовь моя. Если ты не вырубилась раньше ❤️",
    },
  ],

  tuesday: [
    {
      time: "07:00",
      type: "morning",
      title: "Доброе утро ☀️",
      text: "Доброе утро, бус. Новый день новый тьмок ❤️",
    },
    {
      time: "12:10",
      type: "day",
      title: "Обэд? 🌷",
      text: "Приятного аппетита котенок",
    },
    {
      time: "17:00",
      type: "reminder",
      title: "Маленький привет ❤️",
      text: "Просто пришёл сказать, что скучаю. Всё, можешь продолжать свои важные дела 😌",
    },
    {
      time: "23:30",
      type: "night",
      title: "Сладких снов 💤",
      text: "Спи сладко родная ❤️",
    },
  ],

  wednesday: [
    {
      time: "07:00",
      type: "morning",
      title: "Доброе утро ❤️",
      text: "Среда. Экватор недели уже рядом. Ты справишься, я в тебя верю.",
    },
    {
      time: "12:10",
      type: "day",
      title: "ОБЭЭД 🌷",
      text: "Кушаем, приятного аппетита.",
    },
    {
      time: "16:30",
      type: "reminder",
      title: "Ты умничка ❤️",
      text: "Если сегодня никто тебе этого ещё не сказал то я скажу.",
    },
    {
      time: "23:30",
      type: "night",
      title: "Сладких снов 💤",
      text: "Сладких снов, Любовь моя ❤️",
    },
  ],

  thursday: [
    {
      time: "07:00",
      type: "morning",
      title: "Доброе утро ☀️",
      text: "Доброе утро. Четверг уже здесь😌",
    },
    {
      time: "12:10",
      type: "day",
      title: "ОБЭД 🌷",
      text: "Кушать, приятного аппетита ❤️",
    },
    {
      time: "17:00",
      type: "reminder",
      title: "Я рядом ❤️",
      text: "Целую",
    },
    {
      time: "23:30",
      type: "night",
      title: "Сладких снов 💤",
      text: "Спокойной ночи, мой бус. До завтра ❤️",
    },
  ],

  friday: [
    {
      time: "07:00",
      type: "morning",
      title: "Доброе утро ❤️",
      text: "ПЯТНИЦА. Всё. 😌",
    },
    {
      time: "12:10",
      type: "day",
      title: "ОБЭД 🌷",
      text: "Приятного аппетита родная ❤️",
    },
    {
      time: "17:00",
      type: "reminder",
      title: "Просто так",
      text: "Горжусь тобой ❤️",
    },
    {
      time: "23:30",
      type: "night",
      title: "Сладких снов 💤",
      text: "Отдыхай, бус. Ты заслужила хороший сон ❤️",
    },
  ],

  saturday: [
    {
      time: "07:00",
      type: "morning",
      title: "Доброе утро ☀️",
      text: "Суббота! Доброе утро, Любовь моя ❤️",
    },
    {
      time: "12:10",
      type: "day",
      title: "ОБЭД 🌷",
      text: "Вкусного аппетита",
    },
    {
      time: "00:00",
      type: "night",
      title: "Сладких снов 💤",
      text: "Спокойной ночи, бус. Хорошенько отдыхай ❤️",
    },
  ],

  sunday: [
    {
      time: "12:30",
      type: "morning",
      title: "Доброе утро ☀️",
      text: "Официально разрешается поспать подольше ❤️",
    },
   
    {
      time: "18:00",
      type: "reminder",
      title: "Маленький привет ❤️",
      text: "Просто напоминаю: ты прекрасна. Всё, можешь дальше заниматься своими делами 😌",
    },
    {
      time: "23:30",
      type: "night",
      title: "Сладких снов 💤",
      text: "Спокойной ночи, Любовь моя. Завтра новый день ❤️",
    },
  ],
};

// ==========================================
// НАЗВАНИЯ ДНЕЙ
// ==========================================

export const dayNames = {
  monday: "Понедельник",
  tuesday: "Вторник",
  wednesday: "Среда",
  thursday: "Четверг",
  friday: "Пятница",
  saturday: "Суббота",
  sunday: "Воскресенье",
};

// ==========================================
// ПОЛУЧАЕМ ТЕКУЩИЙ ДЕНЬ
// ==========================================

export function getCurrentDay() {
  const days = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];

  return days[new Date().getDay()];
}

// ==========================================
// ПОЛУЧАЕМ ТЕКУЩЕЕ РАСПИСАНИЕ
// ==========================================

export function getTodaySchedule() {
  const day = getCurrentDay();

  return weeklySchedule[day] || [];
}

// ==========================================
// ПОЛУЧАЕМ АКТУАЛЬНОЕ СООБЩЕНИЕ
// ==========================================

export function getCurrentScheduleItem() {
  const schedule = getTodaySchedule();

  const now = new Date();

  const currentMinutes =
    now.getHours() * 60 + now.getMinutes();

  let currentItem = null;

  for (const item of schedule) {
    const [hours, minutes] = item.time
      .split(":")
      .map(Number);

    const itemMinutes =
      hours * 60 + minutes;

    if (itemMinutes <= currentMinutes) {
      currentItem = item;
    }
  }

  return currentItem;
}
