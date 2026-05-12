try {
  const status = rs.status();

  if (status.ok === 1) {
    print('Replica set already initialized.');
  }
} catch {
  rs.initiate({
    _id: 'rs0',
    members: [{ _id: 0, host: 'mongo:27017' }],
  });

  print('Replica set rs0 initialized for docker network.');
}
