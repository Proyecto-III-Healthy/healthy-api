const DayPlan = require('./../models/DayPlan.model');
const WeeklyMealPlan = require('./../models/WeeklyPlan.model');
const Meal = require('./../models/Meal.model');
const dayjs = require('dayjs');

const createWeeklyMealPlan = async (startDate, mealsByDay) => {
  const days = [];
  
  const dayPromises = mealsByDay.map((dayMeals, i) => {
    const date = dayjs(startDate).add(i, 'day').toDate();

    return Promise.all(dayMeals.map((meal) => {
      console.log({  meal})

      //antes de crear la meal, creo la receta y el id se lo paso al new Meal
      const newMeal = new Meal({...meal, recipe: });
      return newMeal.save().then(() => ({
        meal: newMeal._id,
        time: meal.time,
      }));
    }))
    .then((meals) => {
      const dayPlan = new DayPlan({ date, meals });
      return dayPlan.save().then(() => {
        days.push(dayPlan);
      });
    });
  });

  await Promise.all(dayPromises);
  const weeklyMealPlan = new WeeklyMealPlan({
    weekStart: startDate,
    days,
  });
  const weeklyMealPlan_1 = weeklyMealPlan.save();
  return weeklyMealPlan_1;
};


module.exports = createWeeklyMealPlan;