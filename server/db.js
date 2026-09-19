// החיבור למסד הנתונים MongoDB

const mongoose = require("mongoose");

async function connectToDatabase() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("התחברנו בהצלחה למסד הנתונים");
  } catch (error) {
    console.log("שגיאה בהתחברות למסד הנתונים:", error.message);
    // אם אין מסד נתונים אין טעם שהשרת ימשיך לרוץ
    process.exit(1);
  }
}

module.exports = connectToDatabase;
