const Hapi = require('@hapi/hapi');
const routes = require('./routes');  // Pastikan rute ditambahkan dengan benar

const init = async () => {
  const server = Hapi.server({
    port: 9000,
    host: 'localhost',
  });

  // Menambahkan rute
  server.route(routes);

  await server.start();
  console.log('Server berjalan pada http://localhost:9000');
};

init();
