export const config = {
puerto: process.env.PORT ?? 3000,
sessionSecret: process.env.SESSION_SECRET,
dbStorage: process.env.DB_STORAGE ?? ':memory:',
};
