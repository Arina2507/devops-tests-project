const path = require("path");

const createApp = require("./app");
const createReservationService = require("./infrastructure/composition/createReservationService");

const port = Number(process.env.PORT || 3000);
const frontendDistPath = process.env.FRONTEND_DIST_PATH || path.resolve(__dirname, "../frontend/dist");
const app = createApp({
  reservationService: createReservationService(),
  frontendDistPath
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});