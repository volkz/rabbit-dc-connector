import * as amqp from 'amqplib';

/**
 * IQueue interface
 */
interface IQueues {
  name: string;
  callback: (msg: amqp.ConsumeMessage | null) => any;
  options: amqp.Options.Consume;
}

export class AmqpReceiver {
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
      throw error;
    }
  }

  /**
   * Attach array of queues (IQueues) to channel
   *
   * @param queues Array of IQueues
   */
  public static attachQueues(queues: IQueues[]) {
    queues.forEach((e: IQueues) => {
      AmqpReceiver.channel.consume(e.name, msg => e.callback(msg), e.options);
    });
  }

  /**
   * Close open channel
   *
   * @param ch
   */
  public static closeChannel(ch: amqp.Channel) {
    ch.close();
  }

  /**
   * Receiver channel for consume
   *
   * @private
   * @static
   * @type {amqp.Channel}
   * @memberof AmqpReceiver
   */
  private static channel: amqp.Channel;
}
