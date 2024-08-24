import * as path from 'node:path';
import * as fs from 'node:fs';
import { SERVICE_RPC_TOKEN, SERVICE_MESSAGE_TOKEN } from './constants';
import {
  RpcMetadata,
  RpcProperty,
  RpcMessageType,
} from './types/message.types';
import * as _ from 'lodash';
import { ServiceConfig } from './server';

const IND = '  ';

export class ProtoGenerator {
  private readonly proto: string[] = [];

  constructor(
    private readonly protoPath: string,
    private readonly protoFile: string,
    private readonly packageName = 'app'
  ) {}

  public makeProtoFile(serviceInstances: Record<string, ServiceConfig>) {
    this.proto.push(
      'syntax = "proto3";',
      '',
      `package ${this.packageName};`,
      ''
    );

    for (const key in serviceInstances) {
      const { instance, name } = serviceInstances[key];

      this.proto.push(`service ${name} {`);

      const rpcMap: Record<string, RpcMetadata> = Reflect.getMetadata(
        SERVICE_RPC_TOKEN,
        instance
      );

      for (const key in rpcMap) {
        const rpc = this.generateRpc(rpcMap[key]);
        this.proto.push(rpc);
      }

      this.proto.push('}', '');

      const processedMessages: RpcMessageType[] = [];
      const messageTypes: RpcMessageType[] = Reflect.getMetadata(
        'service:messages',
        instance
      );

      for (const message of messageTypes) {
        if (message.refs) {
          messageTypes.push(
            ...Object.values(message.refs).filter((msg) => !msg.blockScoped)
          );
        }

        for (const property of Object.values(message?.properties ?? {})) {
          if (property.type === 'map' && typeof property.map[1] !== 'string') {
            const typeMeta: RpcMessageType = Reflect.getMetadata(
              SERVICE_MESSAGE_TOKEN,
              property.map[1]
            );
            if (!typeMeta) throw new Error('Meta not found');
            messageTypes.push(typeMeta);
          }
        }
      }

      for (const messageType of messageTypes) {
        if (processedMessages.find((msg) => _.isEqual(msg, messageType)))
          continue;

        processedMessages.push(messageType);
        this.processMessageType(messageType);
      }
    }

    return this.proto.join('\n');
  }

  private processMessageType(messageType: RpcMessageType) {
    let message: string;

    if (messageType.type === 'message')
      message = this.generateMessageType(messageType).block;
    else if (messageType.type === 'enum')
      message = this.generateEnumType(messageType).block;
    else throw new Error('Invalid message type: ' + messageType.type);

    this.proto.push(message);
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
      `${indentation}${IND}rpc ${rpcName} (${clientStream ? 'stream ' : ''}`,
      `${argumentTypeName}) returns (${serverStream ? 'stream ' : ''}`,
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

    if (propertyType.type === 'map') {
      if (label) throw new Error('More than one label decorator!');

      let [key, value] = propertyType.map;

      if (!key || !value) throw new Error('Map needs a valid key and value');

      if (typeof value !== 'string') {
        const typeMeta: RpcMessageType = Reflect.getMetadata(
          SERVICE_MESSAGE_TOKEN,
          value
        );
        if (!typeMeta) throw new Error('Meta not found');
        value = typeMeta.typeName;
      }

      label = `map<${key}, ${value}> `;
      return `${label} ${propertyType.propertyName} = ${index};`;
    }

    return `${label}${propertyType.ref ?? propertyType.type} ${
      propertyType.propertyName
    } = ${index};`;
  }

  private generateOneOfBlock(
    typeName: string,
    propertyTypes: RpcProperty[],
    num: number,
    ind = ''
  ) {
    if (propertyTypes.length <= 1)
      throw new Error('OneOf block with a single property: ' + typeName);

    let oneOfBlock = `${ind}oneof ${typeName} {\n`;

    for (let i = 0; i < propertyTypes.length; i++) {
      const propertyType = propertyTypes[i];
      oneOfBlock += `${ind}  ${this.generatePropertyType(
        propertyType,
        i + num
      )}\n`;
    }
    oneOfBlock += `${ind}}\n`;

    return { block: oneOfBlock, entryCount: propertyTypes.length };
  }

  private generateEnumType(messageType: RpcMessageType) {
    let enumType = `enum ${messageType.typeName} {\n`;
    const propertyTypes = Object.values(messageType.properties);

    for (let i = 0; i < propertyTypes.length; i++) {
      const propertyType = propertyTypes[i];
      enumType += `  ${propertyType.propertyName} = ${i};\n`;
    }

    enumType += '}\n';

    return { block: enumType, entryCount: propertyTypes.length };
  }

  private generateMessageType(messageType: RpcMessageType, ind = '') {
    let message = `${ind}message ${messageType.typeName} {\n`;
    const propertyTypes = Object.values(messageType?.properties ?? {});
    const refs = Object.values(messageType.refs ?? {}) ?? [];

    let cursor = 1;
    for (let i = 0; i < refs.length; i++) {
      const subMessageType = refs[i];

      if (!subMessageType.blockScoped) continue;

      if (subMessageType.type === 'enum') {
        const { block, entryCount } = this.generateEnumType(subMessageType);
        message += block;
        cursor += entryCount;
      } else {
        const { block, entryCount } = this.generateMessageType(
          subMessageType,
          ind + IND
        );
        message += block;
        cursor += entryCount;
      }
    }

    let properties = [...propertyTypes];

    for (const oneofTypeName in messageType.oneofs) {
      const toAdd = properties.filter((p) =>
        messageType.oneofs[oneofTypeName].includes(p.propertyName)
      );
      properties = properties.filter(
        (p) => !messageType.oneofs[oneofTypeName].includes(p.propertyName)
      );

      const { block, entryCount } = this.generateOneOfBlock(
        oneofTypeName,
        toAdd,
        cursor,
        ind + IND
      );
      message += block;
      cursor += entryCount;
    }

    for (let i = 0; i < properties.length; i++) {
      const propertyType = properties[i];
      const property = this.generatePropertyType(propertyType, cursor++);
      message += `${ind}  ${property}\n`;
    }

    message += `${ind}}\n`;
    return { block: message, entryCount: cursor - 1 };
  }

  public writeProtoFile(protoContents: string) {
    if (!fs.existsSync(this.protoPath)) {
      fs.mkdirSync(this.protoPath, { recursive: true });
    }

    fs.writeFileSync(this.protoFilePath, protoContents);
  }

  get protoFilePath() {
    return path.join(this.protoPath, this.protoFile);
  }
}
