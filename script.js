
function doGet() {
  return HtmlService.createHtmlOutputFromFile("Page")  // או "index" או איך שקראת ל-HTML
    .setTitle("שיבוץ מסז' ליעל זינמן");
}



function saveMassageReservation(date, time, name, phone, email) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("ממשק לבחירה");

  // הוספת שורה חדשה לסוף הגיליון
  sheet.appendRow([date, time, name, phone, email]);

  // שליחת מייל אישור רגיל
  MailApp.sendEmail({
    to: email,
    subject: "אישור הרשמה לעיסוי - מצוקי דרגות",
    body: `שלום ${name},

שמחים לאשר את הרשמתך לעיסוי במסגרת הנופש במצוקי דרגות.

פרטי השיבוץ:
תאריך: ${date}
שעה: ${time}

נפגש בקרוב!
צוות הנופש במצוקי דרגות`
  });

  // יצירת אירוע בלוח שנה עם זימון
  try {
    const [day, month] = date.split(".");
    const [hour, minute] = time.split(":");
    const eventDate = new Date(`2025-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${hour.padStart(2, '0')}:${minute.padStart(2, '0')}:00`);

    const calendar = CalendarApp.getDefaultCalendar();
    const event = calendar.createEvent(
      `עיסוי במצוקי דרגות`,
      eventDate,
      new Date(eventDate.getTime() + 30 * 60000),
      {
        description: `עיסוי לנרשם/ת: ${name}`,
        guests: email,
        sendInvites: true
      }
    );

    event.removeAllReminders();
    event.addPopupReminder(15);
  } catch (err) {
    Logger.log("שגיאה ביצירת אירוע ביומן: " + err.message);
  }

  return "OK";
}


function getFullSlots() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("הרשמה");
  const data = sheet.getDataRange().getValues();
  const fullSlots = [];

  for (let i = 1; i < data.length; i++) {
    const status = data[i][2]; // עמודה C - סטטוס
    const date = data[i][0];   // עמודה A - תאריך
    const time = data[i][1];   // עמודה B - שעה

    if (status && status.toString().trim() === "מלא!") {
      fullSlots.push(`${date} ${time}`);
    }
  }

  return fullSlots;
}
