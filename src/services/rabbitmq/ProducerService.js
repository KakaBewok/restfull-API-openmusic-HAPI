const amqp = require('amqplib');

const ProducerService = {
  sendMessage: async (queue, message) => {
    const connection = await amqp.connect(process.env.RABBITMQ_SERVER);

    const channel = await connection.createChannel();

    await channel.assertQueue(queue, {
      durable: true,
    });

    await channel.sendToQueue(queue, Buffer.from(message));

    // tutup koneksi setelah 1 detik
    setTimeout(() => {
      connection.close();
    }, 1000);
  },
};
module.exports = ProducerService;
