import * as amqp from 'amqplib';

interface IQueues {
  name: string;
  callback: (msg: amqp.ConsumeMessage | null) => any;
  options: amqp.Options.Consume;
}

export class AmqpReceiver {
  /** Static class variables */
  static channel: amqp.Channel;
  static queue: string;

  /**
   * Function for establish connection with the eventbus
   *
   * @param host RabbitMQ url
   * @param exchange IExchange object for exchange configuration
   */
  public static async connection(host: string) {
    try {
      /** Create connection with amqp client */
      const connection = await amqp.connect(`amqp://${host}`);
      /**Create new channel with connection */
      AmqpReceiver.channel = await connection.createChannel();
    } catch (error) {
      /** Throw custom error code */
      console.log('E0', error);
      throw error;
    }
  }

  /**
   * Function for attaching queues to amqp channel
   *
   * @param queues Array of queues to attach to channel
   *
   * @property name : Name of queue
   * @property callback : Function for execute with the message
   * @property options : Options for the consumer
   */
  public static attachQueues(queues: Array<IQueues>) {
    /** Loop queues to attach */
    queues.forEach((e: IQueues) => {
      AmqpReceiver.channel.consume(e.name, msg => e.callback(msg), e.options);
    });
  }

  /**
   * Closes channel connection
   *
   * @param ch
   */
  public static closeChannel(ch: amqp.Channel) {
    ch.close();
  }
}
