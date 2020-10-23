import * as amqp from 'amqplib';

interface IExchange {
  name: string;
  type: string;
  options: any;
}

export class AmqpSender {
  static channel: amqp.Channel;
  static exchange: IExchange;
  static queue: string;
  constructor() {}

  /**
   * Create RabbitMQ connection
   *
   * @param host RabbitMQ url
   * @param exchange IExchange object for exchange configuration
   */
  public static async connection(host: string, queue?: string, exchange?: IExchange) {
    try {
      //Connection to host and create new channel
      const connection = await amqp.connect(`amqp://${host}`);
      AmqpSender.channel = await connection.createChannel();

      /** Create a new queue and assing it  to class  variable if we receive one */
      if (queue) {
        AmqpSender.queue = queue;
        AmqpSender.setQueue(queue);
      }

      /** Create a new exchange and assing it to class variable if we receive one*/
      if (exchange) {
        AmqpSender.exchange = exchange;
        AmqpSender.setExchange(exchange);
      }
    } catch (error) {
      /** Throw custom error code */
      console.log('E0', error);
      throw error;
    }
  }

  /**
   * Publish message on specific queue
   *
   * @param msg String or object message to publish
   * @param queue Queue name
   */
  public static publishtoQueue(msg: string, queue: string) {
    /** Check message type for string */
    if (typeof msg !== 'string') {
      msg = JSON.stringify(msg);
    }
    AmqpSender.channel.sendToQueue(queue, Buffer.from(msg));
  }

  /**
   * Publish message on connected exchange
   *
   * @param msg string or object message
   * @param routingKey routing key for RabbitMQ exchange
   */
  public static publishToExchange(msg: string, routingKey: string) {
    if (typeof msg !== 'string') {
      msg = JSON.stringify(msg);
    }
    /** Publish message with received parameters */
    AmqpSender.channel.publish(AmqpSender.exchange.name, `${routingKey}`, Buffer.from(msg));
  }

  /**
   * Close amqp channel
   *
   * @param ch Amqp Channel
   */
  public static closeChannel(ch: amqp.Channel) {
    ch.close();
  }

  /**
   * Set queue connection
   * @param exchange
   */
  private static setQueue(queue: string, options?: any) {
    AmqpSender.channel.assertQueue(queue, options);
  }

  /**
   * Set exchange params
   * @param exchange
   */
  private static setExchange(exchange: IExchange) {
    AmqpSender.channel.assertExchange(exchange.name, exchange.type, exchange.options);
  }
}
