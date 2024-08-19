import * as path from 'node:path';
import * as fs from 'node:fs';
import { PROPERTY_TYPE_TOKEN, SERVICE_SERVER_RPC_TOKEN } from './constants';

export class ProtoGenerator {
  constructor(
    private readonly protoPath: string,
    private readonly protoFile: string
  ) {}

  public makeProtoFile(serviceInstances: Record<string, any>) {
    const file = ['syntax = "proto3";', '', 'package app;'];

    for (const key in serviceInstances) {
      const { instance, name } = serviceInstances[key];

      file.push('', `service ${name} {`);

      const handlerMetadata = [];

      for (const key of Reflect.getMetadataKeys(instance)) {
        if (!key.startsWith(SERVICE_SERVER_RPC_TOKEN)) continue;

        const metadata = Reflect.getMetadata(key, instance);

        handlerMetadata.push(metadata);
        file.push(
          `    rpc ${metadata.propertyKey} (${
            metadata.inputType?.metadata?.stream ? 'stream ' : ''
          }${metadata.propertyKey}_Arguments) returns (${
            metadata.returnType?.metadata?.stream ? 'stream ' : ''
          }${metadata.propertyKey}_Returns) {}`
        );
      }

      file.push('}');

      for (const metadata of handlerMetadata) {
        file.push('', `message ${metadata.propertyKey}_Arguments {`);

        if (metadata.inputType) {
          let i = 0;
          for (const key in metadata.inputType) {
            if (!key.startsWith(PROPERTY_TYPE_TOKEN)) continue;

            const property = metadata.inputType[key];
            const propertyName = property.propertyKey;

            file.push(
              `    ${property.required ? '' : 'optional '}${
                property.type
              } ${propertyName} = ${++i};`
            );
          }
        }

        file.push('}');

        file.push('', `message ${metadata.propertyKey}_Returns {`);

        if (metadata.returnType) {
          let i = 0;
          for (const key in metadata.returnType) {
            if (!key.startsWith(PROPERTY_TYPE_TOKEN)) continue;

            const property = metadata.returnType[key];
            const propertyName = property.propertyKey;

            file.push(
              `    ${property.required ? '' : 'optional '}${
                property.type
              } ${propertyName} = ${++i};`
            );
          }
        }

        file.push('}');
      }
    }

    file.push('');

    return file.join('\n');
  }

  private;

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
