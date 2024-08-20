import * as path from 'node:path';
import * as fs from 'node:fs';
import { SERVICE_RPC_TOKEN, SERVICE_MESSAGE_TOKEN } from './constants';
import {
  RpcMetadata,
  RpcProperty,
  RpcMessageType,
} from './types/message.types';

const IND = '  ';

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

      for (const message of messages) {
        if (message.refs) {
          messages.push(
            ...Object.values(message.refs).filter((msg) => !msg.blockScoped)
          );
        }
      }

      const messageNameMap: Record<string, RpcMessageType> = {};

      for (const message of messages) {
        messageNameMap[message.typeName] = message;
      }

      for (const messageType of Object.values(messageNameMap)) {
        let message: string;

        if (messageType.type === 'message')
          message = this.generateMessageType(messageType).block;
        else if (messageType.type === 'enum')
          message = this.generateEnumType(messageType).block;
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
      `${indentation}${IND}rpc ${rpcName} (${serverStream ? 'stream ' : ''}`,
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

    enumType += '}\n\n';
    return { block: enumType, entryCount: propertyTypes.length };
  }

  private generateMessageType(messageType: RpcMessageType, ind = '') {
    let message = `${ind}message ${messageType.typeName} {\n`;
    const propertyTypes = Object.values(messageType.properties);
    const refs = Object.values(messageType.refs ?? {}) ?? [];

    let c = 0;
    for (let i = 0; i < refs.length; i++) {
      const subMessageType = refs[i];

      if (!subMessageType.blockScoped) continue;

      if (subMessageType.type === 'enum') {
        const { block, entryCount } = this.generateEnumType(subMessageType);
        message += block;
        c += entryCount;
      } else {
        const { block, entryCount } = this.generateMessageType(
          subMessageType,
          ind + IND
        );
        message += block;
        c += entryCount;
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
        c,
        ind + IND
      );
      message += block;
      c += entryCount;
    }

    for (let i = 0; i < properties.length; i++) {
      const propertyType = properties[i];
      const property = this.generatePropertyType(propertyType, ++c);
      message += `${ind}  ${property}\n`;
    }

    message += `${ind}}\n`;
    return { block: message, entryCount: c };
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
