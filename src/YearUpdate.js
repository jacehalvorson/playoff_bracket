function CurrentYear()
{
   var year = new Date().getFullYear();
   // Temporary change of year.
   var d = new Date();
   d.setFullYear(d.getFullYear(), d.getMonth() + 6);
   year = d.getFullYear();
   return year;
}

function FootballYearStarts() {
   var gameStarted = new Date("01/Jan/2025 12:00:00");
   // Temporary change of day as these have been hid except your own.
   gameStarted = new Date("01/Jan/2024 12:00:00");
   if (new Date() > gameStarted) {
      return true;
   }
   return false;
}

export { CurrentYear, FootballYearStarts };

