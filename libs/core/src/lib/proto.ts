import * as path from 'node:path';
import * as fs from 'node:fs';
import { SERVICE_RPC_TOKEN, SERVICE_MESSAGE_TOKEN } from './constants';
import {
  RpcMetadata,
  RpcProperty,
  RpcMessageType,
} from './types/message.types';

export class ProtoGenerator {
  private readonly proto: string[] = [];

  constructor(
    private readonly protoPath: string,
    private readonly protoFile: string,
    private readonly packageName = 'app'
  ) {}

  public makeProtoFile(serviceInstances: Record<string, any>) {
    this.proto.push('syntax = "proto3";', '', `package ${this.packageName};`);

    for (const key in serviceInstances) {
      const { instance, name } = serviceInstances[key];

      this.proto.push('', `service ${name} {`);

      const rpcMap: Record<string, RpcMetadata> = Reflect.getMetadata(
        SERVICE_RPC_TOKEN,
        instance
      );

      for (const key in rpcMap) {
        const rpc = this.generateRpc(rpcMap[key]);
        this.proto.push(rpc);
      }

      this.proto.push('}');

      const messages: RpcMessageType[] = Reflect.getMetadata(
        'service:messages',
        instance
      );

      for (const messageType of messages) {
        let message: string;

        if (messageType.type === 'message')
          message = this.generateMessageType(messageType);
        else if (messageType.type === 'enum')
          message = this.generateEnumType(messageType);
        else if (messageType.type === 'oneof')
          message = this.generateOneOfBlock(messageType);
        else throw new Error('Invalid message type: ' + messageType.type);

        this.proto.push(message);
      }
    }

    this.proto.push('');

    return this.proto.join('\n');
  }

  private generateRpc(rpcProperties: RpcMetadata, indentation = '') {
    const {
      rpcName,
      clientStream,
      serverStream,
      argumentTypeName,
      returnTypeName,
    } = rpcProperties;

    const lines = [
      `${indentation}  rpc ${rpcName} (${serverStream ? 'stream ' : ''}`,
      `${argumentTypeName}) returns (${clientStream ? 'stream ' : ''}`,
      `${returnTypeName}) {};`,
    ];

    return lines.join('');
  }

  private generatePropertyType(propertyType: RpcProperty, index = 1) {
    let label = '';

    if (propertyType.optional) {
      label = 'optional ';
    }

    if (propertyType.repeated) {
      if (label) throw new Error('More than one label decorator!');
      label = 'repeated ';
    }

    if (propertyType.map?.length) {
      if (label) throw new Error('More than one label decorator!');
      label = `map<${propertyType.map[0]}, ${propertyType.map[1]}> `;
    }

    return `  ${label}${propertyType.ref ?? propertyType.type} ${
      propertyType.propertyName
    } = ${index};`;
  }

  private generateOneOfBlock(messageType: RpcMessageType) {
    const propertyTypes = Object.values(messageType.properties);

    if (propertyTypes.length <= 1)
      throw new Error(
        'OneOf block with a single property: ' + messageType.typeName
      );

    let oneOfBlock = `oneof ${messageType.typeName} {\n`;
    let i = 0;
    for (const propertyType of propertyTypes) {
      oneOfBlock += `  ${this.generatePropertyType(propertyType, ++i)}`;
    }
    oneOfBlock += '}\n\n';

    return oneOfBlock;
  }

  private generateEnumType(messageType: RpcMessageType) {
    let enumType = 'enum';
    const propertyTypes = Object.values(messageType.properties);

    for (let i = 0; i < propertyTypes.length; i++) {
      const propertyType = propertyTypes[i];
      enumType += `  ${propertyType.propertyName} = ${i};`;
    }

    enumType += '}\n\n';
    return enumType;
  }

  private generateMessageType(messageType: RpcMessageType) {
    let message = `message ${messageType.typeName} {\n`;
    const propertyTypes = Object.values(messageType.properties);

    for (let i = 0; i < messageType.messages.length; i++) {
      const subMessageType = messageType.messages[i];

      if (subMessageType.type === 'oneof')
        message += this.generateOneOfBlock(subMessageType);
      else if (subMessageType.type === 'enum')
        message += this.generateEnumType(subMessageType);
      else message += this.generateMessageType(messageType.messages[i]);
    }

    for (let i = 0; i < propertyTypes.length; i++) {
      const propertyType = propertyTypes[i];
      const property = this.generatePropertyType(propertyType, i + 1);
      message += `  ${property}\n`;
    }

    message += '}\n';
    return message;
  }

  public writeProtoFile(protoContents: string) {
    if (!fs.existsSync(this.protoPath)) {
      fs.mkdirSync(this.protoPath);
    }

    fs.writeFileSync(this.protoFilePath, protoContents);
  }

  get protoFilePath() {
    return path.join(this.protoPath, this.protoFile);
  }
}
