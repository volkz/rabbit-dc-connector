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
      uriQuery = `${authenticate.user}:${authenticate.password}@${host}`;
    }

    return `amqp://${uriQuery}`;
  }
}
