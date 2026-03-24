const createApp = require("./app");
const createReservationService = require("./infrastructure/composition/createReservationService");

const port = Number(process.env.PORT || 3000);
const app = createApp({
  reservationService: createReservationService()
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});