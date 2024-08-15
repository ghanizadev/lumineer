import * as path from 'node:path';
import * as fs from 'node:fs';
import { SERVICE_RPC_TOKEN } from './constants';

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
        if (!key.startsWith(SERVICE_RPC_TOKEN)) continue;

        const metadata = Reflect.getMetadata(key, instance);

        handlerMetadata.push(metadata);

        file.push(
          `    rpc ${metadata.propertyKey} (${metadata.propertyKey}_Arguments) returns (${metadata.propertyKey}_Returns) {}`
        );
      }

      file.push('}');

      for (const metadata of handlerMetadata) {
        file.push('', `message ${metadata.propertyKey}_Arguments {`);

        if (metadata.inputType) {
          let i = 0;
          for (const key in metadata.inputType) {
            const property = metadata.inputType[key];
            file.push(
              `    ${property.required ? '' : 'optional '}${
                property.type
              } ${key} = ${++i};`
            );
          }
        }

        file.push('}');

        file.push('', `message ${metadata.propertyKey}_Returns {`);

        if (metadata.returnType) {
          let i = 0;
          for (const key in metadata.returnType) {
            const property = metadata.returnType[key];
            file.push(
              `    ${property.required ? '' : 'optional '}${
                property.type
              } ${key} = ${++i};`
            );
          }
        }

        file.push('}');
      }
    }

    file.push('');

    return file.join('\n');
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
