// ==========================================
// РАСПИСАНИЕ КЭССИЧКИ
// ВРЕМЕННАЯ ЗОНА — МИНСК
// ==========================================

export const TIME_ZONE = "Europe/Minsk";

export const weeklySchedule = {
  monday: [
    {
      time: "06:45",
      type: "morning",
      title: "Доброе утро ❤️",
      text: "Доброе утро, Любовь моя. Пусть этот понедельник будет легким 😌",
    },
    {
      time: "12:10",
      type: "day",
      title: "ОБЭД 🌷",
      text: "Пряитного аппетита маленькая ❤️",
    },
    {
      time: "16:30",
      type: "reminder",
      title: "Я просто напоминаю ❤️",
      text: "Тьмок",
    },

    {
      time: "00:00",
      type: "night",
      title: "Сладких снов 💤",
      text: "Сладких снов, Любовь моя.  ❤️",
    },
  ],

  tuesday: [
    {
      time: "06:45",
      type: "morning",
      title: "Доброе утро ☀️",
      text: "Доброе утро, бус. Сегодня новый день, а значит, новая возможность сделать его немного приятнее ❤️",
    },
    {
      time: "12:10",
      type: "day",
      title: "ОБЭД 🌷",
      text: "Приятного аппетита солнце",
    },
    {
      time: "17:00",
      type: "reminder",
      title: "Маленький привет ❤️",
      text: "Просто пришёл сказать, что скучаю. Всё, можешь продолжать свои важные дела 😌",
    },
    {
      time: "00:00",
      type: "night",
      title: "Сладких снов 💤",
      text: "Спокойной ночи, мой бус. Отдыхай и набирайся сил ❤️",
    },
  ],

  wednesday: [
    {
      time: "06:45",
      type: "morning",
      title: "Доброе утро ❤️",
      text: "Среда. Экватор недели уже рядом.",
    },
    {
      time: "12:10",
      type: "day",
      title: "ОБЭД 🌷",
      text: "Кушаем, приятного",
    },
    {
      time: "16:30",
      type: "reminder",
      title: "Ты умничка ❤️",
      text: "Если сегодня никто тебе этого ещё не сказал то да.",
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
      time: "06:45",
      type: "morning",
      title: "Доброе утро ☀️",
      text: "Доброе утро. Четверг уже здесь 😌",
    },
    {
      time: "12:10",
      type: "day",
      title: "ОБЭД 🌷",
      text: "Приятного аппетитка ❤️",
    },
    {
      time: "17:00",
      type: "reminder",
      title: "Я рядом ❤️",
    },
    {
      time: "00:00",
      type: "night",
      title: "Сладких снов 💤",
      text: "Спокойной ночи, мой бус. До завтра ❤️",
    },
  ],

  friday: [
    {
      time: "06:45",
      type: "morning",
      title: "Доброе утро ❤️",
      text: "ПЯТНИЦА. Всё.  😌",
    },
    {
      time: "12:10",
      type: "day",
      title: "ОБЭД 🌷",
      text: "Вкусненького обеда❤️",
    },
    {
      time: "00:00",
      type: "night",
      title: "Сладких снов 💤",
      text: "Отдыхай, бус. Ты заслужила хороший сон ❤️",
    },
  ],

  saturday: [
    {
      time: "06:45",
      type: "morning",
      title: "Доброе утро ☀️",
      text: "Доброе утро, Любовь моя ❤️",
    },
    {
      time: "12:10",
      type: "day",
      title: "ОБЭД 🌷",
      text: "Ням-ням приятного",
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
      text: "Проснулась радость ❤️",
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
// ПОЛУЧАЕМ ТЕКУЩИЕ ДАТУ И ВРЕМЯ ПО МИНСКУ
// ==========================================

export function getMinskDateParts() {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: TIME_ZONE,
    weekday: "long",
    hour: "numeric",
    minute: "2-digit",
    hourCycle: "h23",
  });

  const parts = formatter.formatToParts(new Date());

  const result = {};

  for (const part of parts) {
    if (part.type !== "literal") {
      result[part.type] = part.value;
    }
  }

  return result;
}

// ==========================================
// ТЕКУЩИЙ ДЕНЬ НЕДЕЛИ ПО МИНСКУ
// ==========================================

export function getCurrentDay() {
  const dayMap = {
    Monday: "monday",
    Tuesday: "tuesday",
    Wednesday: "wednesday",
    Thursday: "thursday",
    Friday: "friday",
    Saturday: "saturday",
    Sunday: "sunday",
  };

  const parts = getMinskDateParts();

  return dayMap[parts.weekday];
}

// ==========================================
// ТЕКУЩЕЕ ВРЕМЯ В МИНСКЕ
// В МИНУТАХ ОТ НАЧАЛА СУТОК
// ==========================================

export function getMinskMinutes() {
  const parts = getMinskDateParts();

  return (
    Number(parts.hour) * 60 +
    Number(parts.minute)
  );
}

// ==========================================
// РАСПИСАНИЕ НА СЕГОДНЯ
// ==========================================

export function getTodaySchedule() {
  const day = getCurrentDay();

  return weeklySchedule[day] || [];
}

// ==========================================
// АКТУАЛЬНОЕ СООБЩЕНИЕ ПО МИНСКОМУ ВРЕМЕНИ
// ==========================================

// ==========================================
// АКТУАЛЬНОЕ СООБЩЕНИЕ
// ТОЛЬКО ИЗ СЕГОДНЯШНЕГО РАСПИСАНИЯ
// ==========================================

export function getCurrentScheduleItem() {
  const day = getCurrentDay();
  const schedule = weeklySchedule[day] || [];
  const currentMinutes = getMinskMinutes();

  for (let i = 0; i < schedule.length; i++) {
    const current = schedule[i];

    const [hours, minutes] = current.time
      .split(":")
      .map(Number);

    const startMinutes =
      hours * 60 + minutes;

    // 00:00 в расписании означает
    // начало следующего календарного дня.
    if (startMinutes === 0) {
      continue;
    }

    let endMinutes = 24 * 60;

    if (i + 1 < schedule.length) {
      const next = schedule[i + 1];

      const [nextHours, nextMinutes] =
        next.time.split(":").map(Number);

      const nextMinutesTotal =
        nextHours * 60 + nextMinutes;

      // Если следующее сообщение в 00:00,
      // текущее действует до полуночи.
      if (nextMinutesTotal !== 0) {
        endMinutes = nextMinutesTotal;
      }
    }

    if (
      currentMinutes >= startMinutes &&
      currentMinutes < endMinutes
    ) {
      return current;
    }
  }

  return null;
}
