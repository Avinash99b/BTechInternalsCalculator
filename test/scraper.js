const VignanInternals = require("./VignanInternals");

(async () => {
  const Internals = new VignanInternals("25fe5a0509", "25FE5A0509");
  
  await Internals.login();
  
  const marks = await Internals.getMidMarks(3, 1); // Sem 3, MID-II
  console.log(marks);
})();
