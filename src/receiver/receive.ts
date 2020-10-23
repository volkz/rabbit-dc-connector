import * as amqp from 'amqplib';
import { ConnectionsUtils, IParams } from '../utils/connections';
/**
 * IQueue interface
 */
export interface IQueues {
  name: string;
  callback: (msg: amqp.ConsumeMessage | null) => any;
  options: amqp.Options.Consume;
}

export class AmqpReceiver {
  /**
   * Function for establish connection with the eventbus
   *
   * @param host RabbitMQ url
   * @param exchange IExchange object for exchange configuration
   */
  public static async connection({ ...params }: Partial<IParams>) {
    try {
      try {
        AmqpReceiver.CurrentConnection = await ConnectionsUtils.generateConnection(params);
      } catch (error) {
        return setTimeout(() => {
          AmqpReceiver.connection(params);
        }, 2000);
      }
      AmqpReceiver.channel = await AmqpReceiver.CurrentConnection.createChannel();
      AmqpReceiver.channel.prefetch(1);
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
    if (!AmqpReceiver.channel) {
      return setTimeout(() => {
        AmqpReceiver.attachQueues(queues);
      }, 2000);
    }
    queues.forEach((e: IQueues) => {
      AmqpReceiver.channel.consume(e.name, msg => AmqpReceiver.executeCallbacks(e.callback, msg, e.options), e.options);
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

  /**
   *
   * Amqp connection
   *
   * @private
   * @static
   * @memberof AmqpReceiver
   */
  private static CurrentConnection: amqp.Connection;

  /**
   * Execute callback for consume
   *
   * @param cb
   */
  private static executeCallbacks(cb: IQueues['callback'], msg: any, options: IQueues['options']) {
    cb(msg);
    if (!options.noAck) {
      AmqpReceiver.ackMessage(msg);
    }
  }

  /**
   * Ack message for specified channel
   *
   * @param msg
   */
  private static ackMessage(msg: any) {
    if (msg) {
      const secs = msg.content.toString().split('.').length - 1;
      setTimeout(() => {
        AmqpReceiver.channel.ack(msg);
      }, secs * 1000);
    }
  }
}
