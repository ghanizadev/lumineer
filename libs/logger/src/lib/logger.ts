import { Instance, BackgroundColor, ForegroundColor } from 'chalk';

type DataType = Object | string | number | boolean;

type LogLevel = 'debug' | 'log' | 'info' | 'warn' | 'error';

export class Logger {
  private chalk = new Instance();
  private readonly contextWidth: number = 18;

  constructor(
    private readonly context = '',
    private readonly contextColor: typeof BackgroundColor = 'bgBlue',
    options?: { contextWidth?: number }
  ) {
    if (options.contextWidth) this.contextWidth = options.contextWidth;

    if (context.length > this.contextWidth) {
      this.context = context.substring(0, this.contextWidth - 2) + '..';
    }
  }

  private print(level: LogLevel, ...data: DataType[]) {
    let levelLog: any;
    let textColor: typeof ForegroundColor = 'white';

    switch (level) {
      case 'log':
      case 'debug':
        levelLog = this.chalk`- {white ${level.toLocaleUpperCase().padEnd(6)}}`;
        break;
      case 'warn':
        levelLog = this.chalk`- {yellow ${level
          .toLocaleUpperCase()
          .padEnd(6)}}`;
        textColor = 'yellow';
        break;
      case 'error':
        levelLog = this.chalk`- {redBright ${level
          .toLocaleUpperCase()
          .padEnd(6)}}`;
        textColor = 'red';
        break;
      case 'info':
        levelLog = this.chalk`- {greenBright ${level
          .toLocaleUpperCase()
          .padEnd(6)}}`;
        break;
    }

    console.log(
      this.chalk`{white ${new Date().toISOString()}}`,
      this.chalk[this.contextColor].whiteBright(
        ' ' +
          this.context.substring(0, this.contextWidth).padEnd(this.contextWidth)
      ),
      this.chalk`${levelLog} :`,
      this.chalk[textColor](data.join(' '))
    );
  }

  public withContext(context: string, contextColor?: typeof BackgroundColor) {
    return new Logger(context, contextColor);
  }

  public log(...data: DataType[]) {
    this.print('log', ...data);
  }

  public debug(...data: DataType[]) {
    this.print('debug', ...data);
  }

  public info(...data: DataType[]) {
    this.print('info', ...data);
  }

  public warn(...data: DataType[]) {
    this.print('warn', ...data);
  }

  public error(...data: DataType[]) {
    this.print('error', ...data);
  }
}
