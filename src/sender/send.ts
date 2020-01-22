import * as amqp from 'amqplib';

interface IExchange {
  name: string;
  type: string;
  options: any;
}

export class AmqpSender {
  /**
   * Create RabbitMQ connection
   *
   * @param host RabbitMQ url
   * @param exchange IExchange object for exchange configuration
   */
  public static async connection(host: string, queue?: string, exchange?: IExchange) {
    try {
      const connection = await amqp.connect(`amqp://${host}`);
      AmqpSender.channel = await connection.createChannel();

      if (queue) {
        AmqpSender.queue = queue;
        AmqpSender.setQueue(queue);
      }

      if (exchange) {
        AmqpSender.exchange = exchange;
        AmqpSender.setExchange(exchange);
      }
    } catch (error) {
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

    AmqpSender.channel.publish(AmqpSender.exchange.name, `${routingKey}`, Buffer.from(msg));
  }

  /**
   * Close channel
   *
   * @param ch Amqp Channel
   */
  public static closeChannel(ch: amqp.Channel) {
    ch.close();
  }

  /**
   * Sender channel
   *
   * @private
   * @static
   * @type {amqp.Channel}
   * @memberof AmqpSender
   */
  private static channel: amqp.Channel;
  /**
   * Received exchange  for sender
   *
   * @private
   * @static
   * @type {IExchange}
   * @memberof AmqpSender
   */
  private static exchange: IExchange;
  /**
   * Queue string
   *
   * @private
   * @static
   * @type {string}
   * @memberof AmqpSender
   */
  private static queue: string;

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
