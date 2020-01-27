import * as amqp from 'amqplib';
import { IExchange } from '../sender/send';

export interface IAuthenticate {
  user: string;
  password: string;
}

export interface IParams {
  exchange: IExchange;
  queue: string;
  host: string;
  authenticate: IAuthenticate;
}

export class ConnectionsUtils {
  /**
   * Returns amqp connection
   *
   * @param param0
   */
  public static async generateConnection({ ...params }: Partial<IParams>) {
    try {
      const uri = ConnectionsUtils.generateQuery(params);
      try {
        const connection = await amqp.connect(uri);
        return connection;
      } catch (error) {
        throw error;
      }
    } catch (error) {
      throw error;
    }
  }
  /**
   * generate connection string
   *
   * @param params IParams object with options for connection
   */
  public static generateQuery(params: Partial<IParams>) {
    const { host, authenticate } = params;
    if (!host) {
      throw new Error('No host provided');
    }

    let uriQuery = `${host}`;

    if (authenticate) {
      const user = encodeURIComponent(authenticate.user);
      const pwd = encodeURIComponent(authenticate.password);
      uriQuery = `${user}:${pwd}@${host}`;
    }

    return `amqp://${uriQuery}`;
  }
}
