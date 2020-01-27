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

  /**
   *
   * Amqp connection
   *
   * @private
   * @static
   * @memberof AmqpReceiver
   */
  private static CurrentConnection: amqp.Connection;
}
