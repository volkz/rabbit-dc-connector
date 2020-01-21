import * as amqp from 'amqplib';

interface IQueues {
  name: string;
  callback: (msg: amqp.ConsumeMessage | null) => any;
  options: amqp.Options.Consume;
}

export class AmqpReceiver {
  static channel: amqp.Channel;
  static queue: string;

  /**
   *
   * @param host RabbitMQ url
   * @param exchange IExchange object for exchange configuration
   */
  public static async connection(host: string) {
    try {
      const connection = await amqp.connect(`amqp://${host}`);
      AmqpReceiver.channel = await connection.createChannel();
    } catch (error) {
      console.log('E0', error);
      throw error;
    }
  }

  public static attachQueues(queues: Array<IQueues>) {
    queues.forEach((e: IQueues) => {
      AmqpReceiver.channel.consume(e.name, msg => e.callback(msg), e.options);
    });
  }

  public static closeChannel(ch: amqp.Channel) {
    ch.close();
  }
}
