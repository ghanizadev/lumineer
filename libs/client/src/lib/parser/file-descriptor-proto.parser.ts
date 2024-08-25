import {
  FileDescriptorProto,
  IDescriptorProto,
  IEnumDescriptorProto,
  IServiceDescriptorProto,
  IFileDescriptorProto,
  IFieldDescriptorProto,
} from 'protobufjs/ext/descriptor';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { LabelMap, TypeMap } from '../constants';

export class FileDescriptorProtoParser {
  private readonly fileDescriptor: IFileDescriptorProto;
  private readonly protoPackageName: string;

  private protoText = '';

  constructor(fileBuffer: Buffer) {
    this.fileDescriptor = FileDescriptorProto.decode(fileBuffer).toJSON();
    this.protoPackageName = this.fileDescriptor.package;
  }

  public saveToFile(filePath: string) {
    this.toText();

    const fileDir = path.dirname(filePath);

    if (!fs.existsSync(fileDir)) {
      fs.mkdirSync(fileDir, { recursive: true });
    }

    fs.writeFileSync(filePath, this.protoText);
  }

  get filename() {
    return this.fileDescriptor.name;
  }

  public toText() {
    this.protoText += 'syntax = "proto3";\n\n';

    if (this.fileDescriptor.package) {
      this.protoText += `package ${this.fileDescriptor.package};\n\n`;
    }

    if (this.fileDescriptor.dependency) {
      this.fileDescriptor.dependency.forEach((dep: string) => {
        this.protoText += `import "${dep}";\n`;
      });
      this.protoText += '\n';
    }

    if (this.fileDescriptor.messageType) {
      this.fileDescriptor.messageType.forEach((messageType) => {
        this.protoText += this.generateMessageText(messageType);
      });
    }

    if (this.fileDescriptor.enumType) {
      this.fileDescriptor.enumType.forEach((enumType) => {
        this.protoText += this.generateEnumText(enumType);
      });
    }

    if (this.fileDescriptor.service) {
      this.fileDescriptor.service.forEach((serviceType) => {
        this.protoText += this.generateServiceText(serviceType);
      });
    }

    return this.protoText;
  }

  private generateMessageText(messageType: IDescriptorProto, indentation = '') {
    let messageText = `${indentation}message ${messageType.name} {\n`;

    const fields: { [key: number]: IFieldDescriptorProto[] } = {};

    messageType.field.forEach((field) => {
      const index = field.oneofIndex ?? -1;
      fields[index] = [...(fields[index] ?? []), field];
    });

    const p = (field: IFieldDescriptorProto) => {
      let labelType: string;

      if (field.typeName) {
        const nestedType = messageType.nestedType.find(
          (type) => type.name === field.typeName
        );
        labelType = this.generateTypeField(
          field,
          nestedType,
          indentation + '  '
        );
      } else {
        const type = TypeMap[field.type];
        const label = LabelMap[field.label];

        labelType = `${indentation}${label ? label + ' ' : ''}${type} `;
      }

      messageText += `${indentation}  ${labelType} ${field.name} = ${field.number};\n`;
    };

    for (const key in fields) {
      if (key === '-1') {
        fields[key].forEach(p);
      } else {
        if (fields[key].length > 1) {
          messageText += this.generateOneOfBlock(
            fields[key],
            messageType.oneofDecl[fields[key][0].oneofIndex].name,
            indentation + '  '
          );
        } else {
          p(fields[key][0]);
        }
      }
    }

    messageText += `${indentation}}\n\n`;
    return messageText;
  }

  private generateOneOfBlock(
    fields: IFieldDescriptorProto[],
    typeName: string,
    indentation = ''
  ) {
    let oneOf = `${indentation}oneof ${typeName} {\n`;

    for (const field of fields) {
      oneOf += `${indentation}  ${field.typeName ?? TypeMap[field.type]} ${
        field.name
      } = ${field.number};\n`;
    }

    oneOf += `${indentation}}\n`;

    return oneOf;
  }

  private generateTypeField(
    field: IFieldDescriptorProto,
    nestedType: IDescriptorProto,
    indentation = ''
  ) {
    if (!nestedType) {
      if (TypeMap[field.type] === 'enum') return field.typeName;
      return '';
    }

    if (nestedType.options?.mapEntry) {
      const keyType = TypeMap[nestedType.field[0].type];
      const valueType = TypeMap[nestedType.field[1].type];

      return `map<${keyType}, ${valueType}>`;
    }

    if (TypeMap[field.type] === 'message') {
      let innerMessage = this.generateMessageText(nestedType, indentation);
      const label = LabelMap[field.label];
      return `${innerMessage.substring(2)}  ${label ? label + ' ' : ''}${
        field.typeName ?? TypeMap[field.type]
      }`;
    }

    return '';
  }

  private generateEnumText(enumType: IEnumDescriptorProto) {
    let enumText = `enum ${enumType.name} {\n`;

    enumType.value.forEach((value) => {
      enumText += `  ${value.name} = ${value.number};\n`;
    });

    enumText += '}\n\n';
    return enumText;
  }

  private generateServiceText(serviceType: IServiceDescriptorProto) {
    let serviceText = `service ${serviceType.name} {\n`;

    serviceType.method.forEach((method) => {
      serviceText += `  rpc ${method.name} (${
        method.clientStreaming ? 'stream ' : ''
      }${method.inputType}) returns (${
        method.serverStreaming ? 'stream ' : ''
      }${method.outputType});\n`;
    });

    serviceText += '}\n\n';
    return serviceText;
  }

  get packageName() {
    return this.protoPackageName;
  }
}
