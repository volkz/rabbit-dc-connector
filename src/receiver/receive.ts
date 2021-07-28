import * as amqp from 'amqplib';
import { ConnectionsUtils, IParams } from '../utils/connections';
/**
 * IQueue interface
 */
export interface IQueues {
  name: string;
  callback: (msg: amqp.ConsumeMessage | null) => any;
  options: amqp.Options.AssertQueue;
}

export class AmqpReceiver {
  /**
   * Function for establish connection with the eventbus
   *
   * @param {params} Object Based on IQueues interface
   */
  public static async connection({ ...params }: Partial<IParams>) {
    try {
      try {
        /** Generate new connection */

        AmqpReceiver.CurrentConnection = await ConnectionsUtils.generateConnection(params);

        /*Create a new channel attached to the new connection */

        AmqpReceiver.CurrentConnection = await ConnectionsUtils.generateConnection(params);
        /** limit the number of unacknowledged messages to 1 */

        AmqpReceiver.channel.prefetch(1);
      } catch (error) {
        /*If some error occurs retry de connection after 2 seconds with the same connection */

        return setTimeout(() => {
          AmqpReceiver.connection(params);
        }, 2000);
      }
    } catch (error) {
      /** Throw custom error log */
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
      AmqpReceiver.channel.consume(
        e.name,
        (msg: any) => {
          AmqpReceiver.executeCallbacks(e.callback, msg, e.options);
        },
        e.options,
      );
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
  private static executeCallbacks(cb: IQueues['callback'], msg: any, options: any) {
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
      setTimeout(function () {
        console.log(' [x] Done');
        AmqpReceiver.channel.ack(msg);
      }, 10 * 1000);
    }
  }
}
